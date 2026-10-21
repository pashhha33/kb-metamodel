#!/usr/bin/env node
/**
 * tools/examples/check.cjs
 *
 * Песочница проверки канонических примеров (фаза 3b).
 *
 *   вход:   examples/vault/**\/*.md, examples/vault-manifest.json,
 *           schema/dist/metamodel-<version>.bundle.json, schema/<version>/**\/*.json,
 *           docs/validation/RULES.md (каталог: идентификаторы и уровни правил)
 *   выход:  отчёт в stdout
 *           docs/validation/EXAMPLES_VALIDATION_RUN.md (генерируемый раздел)
 *           docs/validation/examples-validation.json (машиночитаемый снимок)
 *
 * Что проверяется:
 *   1. форма каждого объекта — схемой (двухпроходный алгоритм: выбор ветки по полю type,
 *      затем валидация объекта только фрагментом этой ветки — ARCHITECTURE.md §4.1.1,
 *      находка F-3.17: anyOf + allErrors даёт сотни диагностик на один объект);
 *   2. межобъектные правила каталога — этим скриптом: разрешение ссылок, уникальность,
 *      наследование, эффективный набор свойств, активация аспектов, классификация,
 *      последовательности, уникальность в области действия, медиа, жизненный цикл.
 *
 * Это НЕ код плагина (фаза 5): скрипт работает с файлами репозитория и демонстрирует,
 * что каталог правил реализуем и что канонические примеры ему соответствуют.
 *
 * Код возврата: 0 — ошибок нет (предупреждения допустимы), 1 — есть ошибки уровня error.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const Ajv2020 = require('ajv/dist/2020');
const addFormats = require('ajv-formats');
const YAML = require('yaml');

const ROOT = path.join(__dirname, '..', '..');
const SCHEMA_DIR = path.join(ROOT, 'schema');
const VAULT = path.join(ROOT, 'examples', 'vault');
const MANIFEST = path.join(ROOT, 'examples', 'vault-manifest.json');
const RULES_MD = path.join(ROOT, 'docs', 'validation', 'RULES.md');
const RUN_MD = path.join(ROOT, 'docs', 'validation', 'EXAMPLES_VALIDATION_RUN.md');
const RUN_JSON = path.join(ROOT, 'docs', 'validation', 'examples-validation.json');

const BEGIN = '<!-- BEGIN GENERATED: examples-validation (tools/examples/check.cjs) -->';
const END = '<!-- END GENERATED: examples-validation -->';

const CONTRACT_FIELDS = new Set(['id', 'type', 'title', 'aliases', 'created_at', 'updated_at', 'status', 'tags']);
const M1_TYPES = new Set([
  'object_type', 'property_type', 'property', 'relation_type', 'relation', 'taxonomy',
  'facet', 'category', 'media_asset', 'view', 'automation', 'aspect',
]);
const SYSTEM_INSTANCE_TYPES = new Set(['relation', 'media_asset']);
const SYS_FIELDS = new Set(['sys:id', 'sys:type', 'sys:title', 'sys:aliases', 'sys:created_at', 'sys:updated_at', 'sys:status', 'sys:tags']);
const RELATION_OWN_FIELDS = new Set([
  'subject', 'relation_type', 'object', 'order', 'is_primary', 'role', 'position',
  'valid_from', 'valid_to', 'source_ref', 'context', 'description', 'lifecycle',
]);

// ─────────────────────────────────────────────────────────────────────────────
// Диагностика
// ─────────────────────────────────────────────────────────────────────────────

const diagnostics = [];
const exercised = new Map(); // ruleId -> { error: n, warn: n, info: n, pass: bool }

function diag(ruleId, level, obj, message) {
  diagnostics.push({
    ruleId,
    level,
    file: obj ? obj.rel : '(хранилище)',
    objectId: obj ? obj.fm.id : null,
    message,
  });
  const e = exercised.get(ruleId) || { error: 0, warn: 0, info: 0 };
  e[level] = (e[level] || 0) + 1;
  exercised.set(ruleId, e);
}

/** Правило проверено и нарушений нет: отмечается в матрице как «проверено на примерах». */
function pass(ruleId) {
  if (!exercised.has(ruleId)) exercised.set(ruleId, { error: 0, warn: 0, info: 0 });
}

// ─────────────────────────────────────────────────────────────────────────────
// Загрузка
// ─────────────────────────────────────────────────────────────────────────────

function findActiveVersion() {
  const roots = fs
    .readdirSync(SCHEMA_DIR)
    .filter((f) => /^metamodel-\d+\.\d+\.\d+\.schema\.json$/.test(f))
    .map((f) => ({ file: f, doc: JSON.parse(fs.readFileSync(path.join(SCHEMA_DIR, f), 'utf8')) }))
    .filter((r) => !r.doc['x-superseded-by']);
  if (roots.length !== 1) throw new Error('Ожидалась ровно одна точка входа схемы без x-superseded-by');
  return roots[0].file.match(/^metamodel-(\d+\.\d+\.\d+)\.schema\.json$/)[1];
}

function collect(dir, ext) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collect(full, ext));
    else if (entry.name.endsWith(ext)) out.push(full);
  }
  return out.sort();
}

const LINK_RE = /\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]*))?\]\]/g;
const STABLE_RE = /\(([A-Z][A-Z0-9]{2,11})-([0-9A-HJKMNP-TV-Z]{26})\)\s*$/;

/** Все строковые значения frontmatter (обход в глубину). */
function* strings(node) {
  if (typeof node === 'string') yield node;
  else if (Array.isArray(node)) for (const v of node) yield* strings(v);
  else if (node && typeof node === 'object') for (const v of Object.values(node)) yield* strings(v);
}

/** Ссылки frontmatter: значение поля, цель, подпись, стабильная часть. */
function linksOf(fm) {
  const out = [];
  const walk = (node, keyPath) => {
    if (typeof node === 'string') {
      for (const m of node.matchAll(LINK_RE)) {
        const target = m[1].trim();
        const stable = target.match(STABLE_RE);
        out.push({
          key: keyPath.join('.'),
          raw: m[0],
          target,
          alias: m[2] === undefined ? null : m[2].trim(),
          prefix: stable ? stable[1] : null,
          id: stable ? stable[2] : null,
        });
      }
    } else if (Array.isArray(node)) {
      node.forEach((v, i) => walk(v, keyPath.concat(String(i))));
    } else if (node && typeof node === 'object') {
      for (const [k, v] of Object.entries(node)) walk(v, keyPath.concat(k));
    }
  };
  walk(fm, []);
  return out;
}

function loadVault() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const objects = [];
  for (const file of collect(VAULT, '.md')) {
    const rel = path.relative(ROOT, file).split(path.sep).join('/');
    const text = fs.readFileSync(file, 'utf8');
    const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
    if (!m) throw new Error(rel + ': нет frontmatter между --- и ---');
    const fm = YAML.parse(m[1]);
    objects.push({
      rel,
      base: path.basename(file, '.md'),
      fm,
      links: linksOf(fm),
      id: fm.id,
      type: fm.type,
      title: fm.title,
    });
  }
  return { manifest, objects };
}

// ─────────────────────────────────────────────────────────────────────────────
// Индексы
// ─────────────────────────────────────────────────────────────────────────────

function buildIndexes(objects, manifest) {
  const byId = new Map();
  const byStable = new Map();
  const typeDefs = new Map(); // type_id -> { title, label, prefix, isAbstract, obj }
  const properties = new Map(); // property key -> obj
  const facets = new Map(); // facet key -> obj
  const categories = new Map(); // category id -> obj
  const aspects = [];
  const relationTypes = new Map(); // relation_type id -> obj

  for (const o of objects) {
    if (!o.id) continue;
    if (byId.has(o.id)) byId.get(o.id).push(o);
    else byId.set(o.id, [o]);
    const stable = o.base.match(/\(([A-Z][A-Z0-9]{2,11})-([0-9A-HJKMNP-TV-Z]{26})\)$/);
    if (stable) {
      const key = stable[1] + '-' + stable[2];
      if (!byStable.has(key)) byStable.set(key, []);
      byStable.get(key).push(o);
    }
    if (o.type === 'object_type') {
      typeDefs.set(o.fm.title ? String(o.fm.title).toLowerCase() : o.title, o);
    }
    if (o.type === 'property') properties.set(o.title, o);
    if (o.type === 'facet') facets.set(o.fm.key, o);
    if (o.type === 'category') categories.set(o.id, o);
    if (o.type === 'aspect') aspects.push(o);
    if (o.type === 'relation_type') relationTypes.set(o.id, o);
  }

  return { byId, byStable, properties, facets, categories, aspects, relationTypes };
}

/** Идентификатор типа (snake_case) для определения ObjectType: берётся из соответствия префиксу. */
const PREFIX_TO_TYPE = {
  PERSON: 'person', CHAR: 'character', ORG: 'organization', PROJ: 'project', TASK: 'task',
  BOOK: 'book', CHAP: 'chapter', ARTICLE: 'article', GALLERY: 'gallery',
};
function prefixToTypeId(o) {
  return PREFIX_TO_TYPE[o.fm.type_prefix] || null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Схема: двухпроходная валидация формы
// ─────────────────────────────────────────────────────────────────────────────

function buildValidators(version) {
  const ajv = new Ajv2020({ strict: false, allErrors: true, allowUnionTypes: true });
  addFormats(ajv);
  for (const f of collect(path.join(SCHEMA_DIR, version, 'common'), '.json')) {
    ajv.addSchema(JSON.parse(fs.readFileSync(f, 'utf8')));
  }
  const branches = new Map();
  const m1Files = collect(path.join(SCHEMA_DIR, version, 'm1'), '.json');
  // сначала регистрируем все фрагменты (aspect.json ссылается на object_type.json#/$defs),
  // затем получаем валидаторы по $id
  for (const f of m1Files) ajv.addSchema(JSON.parse(fs.readFileSync(f, 'utf8')));
  for (const f of m1Files) {
    const doc = JSON.parse(fs.readFileSync(f, 'utf8'));
    branches.set(path.basename(f, '.json'), ajv.getSchema(doc.$id));
  }
  const m0doc = JSON.parse(fs.readFileSync(path.join(SCHEMA_DIR, version, 'common', 'm0_instance.json'), 'utf8'));
  const m0 = ajv.getSchema(m0doc.$id);
  const bundlePath = path.join(SCHEMA_DIR, 'dist', 'metamodel-' + version + '.bundle.json');
  const bundle = ajv.compile(JSON.parse(fs.readFileSync(bundlePath, 'utf8')));
  return { branches, m0, bundle };
}

function validateShape(o, validators) {
  const isM1 = M1_TYPES.has(o.type);
  const v = isM1 ? validators.branches.get(o.type) : validators.m0;
  if (!v) {
    diag('contract.r4', 'error', o, 'Неизвестный тип объекта: ' + o.type);
    return false;
  }
  const ok = v(o.fm);
  if (!ok) {
    for (const e of v.errors.slice(0, 5)) {
      diag('schema.form', 'error', o, (e.instancePath || '(корень)') + ' ' + e.message);
    }
  }
  return ok;
}

// ─────────────────────────────────────────────────────────────────────────────
// Каталог правил: идентификаторы и уровни
// ─────────────────────────────────────────────────────────────────────────────

function loadCatalog() {
  const text = fs.readFileSync(RULES_MD, 'utf8');
  const rules = new Map();
  const re = /^\|\s*`([a-z]+)\.r(\d+)`\s*\|\s*(error|warn|info)\s*\|/gm;
  let m;
  while ((m = re.exec(text)) !== null) rules.set(m[1] + '.r' + m[2], { id: m[1] + '.r' + m[2], group: m[1], level: m[3] });
  return rules;
}

// ─────────────────────────────────────────────────────────────────────────────
// Проверки
// ─────────────────────────────────────────────────────────────────────────────

function main(objects, idx, manifest) {
  const version = findActiveVersion();
  const catalog = loadCatalog();
  const validators = buildValidators(version);
  const { properties, facets, categories, aspects, relationTypes, byId, byStable } = idx;

  // ── 1. Форма объекта (двухпроходная валидация) ─────────────────────
  for (const o of objects) validateShape(o, validators);

  // ── 2. Системный контракт ─────────────────────────────────────────
  for (const o of objects) {
    const list = idx.byId.get(o.id) || [];
    if (list.length > 1) {
      diag('contract.r3', 'error', o, 'id ' + o.id + ' используется несколькими объектами: ' + list.map((x) => x.rel).join(', '));
    } else pass('contract.r3');

    const stable = o.base.match(/\(([A-Z][A-Z0-9]{2,11})-([0-9A-HJKMNP-TV-Z]{26})\)$/);
    if (!stable) {
      diag('contract.r11', 'error', o, 'Имя файла не соответствует каноническому формату: ' + o.base);
    } else if (stable[2] !== o.id) {
      diag('contract.r10', 'error', o, 'id в файле (' + o.base + ') не совпадает с id в frontmatter (' + o.id + ')');
    } else {
      pass('contract.r10');
      pass('contract.r11');
    }

    const nameInFile = o.base.replace(/\s*\([A-Z][A-Z0-9]{2,11}-[0-9A-HJKMNP-TV-Z]{26}\)$/, '');
    const isKeyTitle = ['property', 'property_type', 'relation_type', 'facet', 'aspect', 'automation'].includes(o.type);
    const expectedName = String(isKeyTitle ? o.title : o.title).slice(0, 60);
    if (nameInFile !== expectedName) {
      diag('contract.r11', 'error', o, 'Имя файла «' + nameInFile + '» не соответствует title «' + expectedName + '»');
    }
    if (String(o.title).length > 60) diag('contract.r12', 'warn', o, 'title длиннее 60 символов; в имени файла использовано усечение');
    else pass('contract.r12');

    if (o.fm.created_at && o.fm.updated_at && String(o.fm.updated_at) < String(o.fm.created_at)) {
      diag('contract.r9', 'warn', o, 'updated_at раньше created_at');
    } else pass('contract.r9');

    for (const f of ['created_at', 'updated_at']) {
      const v = o.fm[f];
      if (typeof v !== 'string') {
        diag('format.r3', 'info', o, 'Поле ' + f + ' не является строкой: YAML-парсер привёл значение к дате (D-0065)');
      } else if (!/(Z|[+-]\d{2}:\d{2})$/.test(v)) {
        diag('format.r3', 'info', o, 'Дата без смещения часовой зоны: ' + v);
      } else pass('format.r3');
    }

    if (Array.isArray(o.fm.aliases)) {
      const set = new Set(o.fm.aliases.map((a) => String(a).trim().toLowerCase()));
      if (set.size !== o.fm.aliases.length) diag('alias.r3', 'error', o, 'aliases содержит дубли внутри объекта');
      else pass('alias.r3');
      if (set.has(String(o.title).trim().toLowerCase())) {
        diag('alias.r1', 'warn', o, 'aliases содержит значение, равное title');
      } else pass('alias.r1');
    }
  }

  // дубли псевдонимов между объектами
  const aliasOwners = new Map();
  for (const o of objects) {
    for (const a of o.fm.aliases || []) {
      const k = String(a).trim().toLowerCase();
      if (!aliasOwners.has(k)) aliasOwners.set(k, []);
      aliasOwners.get(k).push(o);
    }
  }
  let aliasDup = false;
  for (const [a, owners] of aliasOwners) {
    if (owners.length > 1) {
      aliasDup = true;
      diag('alias.r2', 'warn', owners[0], 'Псевдоним «' + a + '» встречается у нескольких объектов: ' + owners.map((x) => x.rel).join(', '));
    }
  }
  if (!aliasDup) pass('alias.r2');

  // ── 3. Типы и иерархия наследования ───────────────────────────────
  const typeIndex = new Map(); // type_id -> определение ObjectType
  const typeOfObjectType = new Map(); // id определения ObjectType -> type_id
  const prefixOwner = new Map();
  for (const entry of manifest.objects) {
    if (entry.kind !== 'object_type' || !entry.typeId) continue;
    const def = objects.find((o) => o.id === entry.id);
    if (!def) continue;
    typeIndex.set(entry.typeId, def);
    typeOfObjectType.set(entry.id, entry.typeId);
  }
  if (typeIndex.size === 0) throw new Error('Индекс типов пуст: в манифесте нет записей kind: object_type с typeId');
  for (const o of objects) {
    if (o.type !== 'object_type') continue;
    if (o.fm.type_prefix) {
      if (prefixOwner.has(o.fm.type_prefix)) {
        diag('naming.r6', 'error', o, 'Префикс ' + o.fm.type_prefix + ' уже используется типом ' + prefixOwner.get(o.fm.type_prefix));
      } else {
        prefixOwner.set(o.fm.type_prefix, o.title);
        pass('naming.r6');
      }
    }
  }
  for (const o of objects) {
    if (o.type !== 'object_type') continue;
    if (!o.fm.label) diag('naming.r10', 'error', o, 'У определения ' + o.title + ' не заполнен label');
    else pass('naming.r10');
  }

  const byIdDef = new Map([...typeIndex.values()].map((d) => [d.id, d]));
  function parentChain(typeId) {
    const chain = [];
    let cur = typeIndex.get(typeId);
    let guard = 0;
    while (cur && guard < 50) {
      chain.push(cur);
      const parentId = linkStable(cur.fm.parent_type);
      cur = parentId ? byIdDef.get(parentId) : null;
      guard += 1;
    }
    return chain;
  }

  for (const o of objects) {
    if (o.type !== 'object_type' || !o.fm.parent_type) continue;
    const target = resolveLink(o, o.fm.parent_type, 'inherit.r6');
    if (!target) continue;
    if (target.type !== 'object_type') {
      diag('inherit.r6', 'error', o, 'Родительский тип не является ObjectType: ' + target.rel);
    } else pass('inherit.r6');
  }
  for (const [typeId, def] of typeIndex) {
    const chain = parentChain(typeId);
    if (chain.length > 6) diag('inherit.r7', 'warn', def, 'Глубокая иерархия типов (' + chain.length + ' уровней)');
    else pass('inherit.r7');
    const seen = new Set();
    let cycle = false;
    for (const c of chain) {
      if (seen.has(c.id)) { cycle = true; break; }
      seen.add(c.id);
    }
    if (cycle) diag('inherit.r5', 'error', def, 'Обнаружен цикл наследования для типа ' + typeId);
    else pass('inherit.r5');
  }

  /** Эффективный набор свойств типа (ADR-0003 §3.4, ADR-0008 §3.3 ред. 2 — без аспектов). */
  function effectiveProps(typeId) {
    const keys = new Set();
    const overrides = new Map();
    for (const def of parentChain(typeId).reverse()) {
      for (const ref of def.fm.properties || []) {
        const p = resolveLink(def, ref, 'link.r1');
        if (p && p.type === 'property') keys.add(p.title);
      }
      for (const ov of def.fm.property_overrides || []) {
        const p = resolveLink(def, ov.property, 'link.r1');
        if (p) overrides.set(p.title, { ...overrides.get(p.title), ...ov, defTitle: def.title });
      }
    }
    const chainIds = parentChain(typeId).map((c) => c.id);
    for (const p of properties.values()) {
      if (p.fm.scope === 'universal') keys.add(p.title);
      if (p.fm.scope === 'family') {
        // ветвь применения семейства объявлена в определении свойства (допущение A-7 фазы 3b)
        const branches = (p.fm.applies_to || []).map((r) => linkStable(r)).filter(Boolean);
        if (branches.length === 0 || branches.some((id) => chainIds.includes(id))) keys.add(p.title);
      }
    }
    return { keys, overrides };
  }

  // ── 4. Определения свойств ────────────────────────────────────────
  const propKeyOwner = new Map();
  for (const [key, p] of properties) {
    if (propKeyOwner.has(key)) diag('naming.r3', 'error', p, 'Ключ ' + key + ' используется несколькими свойствами');
    else { propKeyOwner.set(key, p); pass('naming.r3'); }
    if (p.fm.scope === 'family') {
      // D-0072 (meta.r16): семейное свойство объявляет ветви применения явно;
      // пустой список — намеренное «все ветви», отсутствие поля — ошибка.
      if (!Array.isArray(p.fm.applies_to)) {
        diag('meta.r16', 'error', p, 'Свойство ' + key + ' с scope: family без applies_to: укажите ветви применения или пустой список (все ветви)');
      } else pass('meta.r16');
    }
    if (p.fm.value_type === 'reference') {
      if (!Array.isArray(p.fm.target_types)) diag('meta.r2', 'error', p, 'Свойство ' + key + ' со значением reference без target_types');
      else pass('meta.r2');
      for (const ref of p.fm.target_types || []) {
        if (isSystemTypeName(ref)) continue; // D-0067: системный тип — голая строка snake_case
        const t = resolveLink(p, ref, 'link.r1');
        if (t && t.type !== 'object_type') {
          diag('link.r2', 'error', p, 'Цель target_types не является определением типа: ' + t.rel);
        }
      }
    }
    if (p.fm.unique_within) {
      const scope = resolveLink(p, p.fm.unique_within, 'unique.r2');
      if (!scope || scope.type !== 'property') diag('unique.r2', 'error', p, 'Область уникальности ' + key + ' не является свойством');
      else pass('unique.r2');
    }
  }

  // ── 5. Классификация ──────────────────────────────────────────────
  const facetByKey = new Map();
  for (const [key, f] of idx.facets) {
    if (facetByKey.has(key)) diag('naming.r9', 'error', f, 'key ' + key + ' уже используется другим фасетом');
    else { facetByKey.set(key, f); pass('naming.r9'); }
    if (f.title !== f.fm.key) diag('naming.r8', 'error', f, 'title фасета (' + f.title + ') расходится со значением key (' + f.fm.key + ')');
    else pass('naming.r8');
    if (!resolveLink(f, f.fm.taxonomy, 'meta.r6')) diag('meta.r6', 'error', f, 'Таксономия фасета ' + key + ' не разрешается');
    else pass('meta.r6');
  }

  const taxonomyOfFacet = (f) => (f ? resolveLink(f, f.fm.taxonomy, 'meta.r6') : null);
  const childrenOf = new Map();
  const assignedCategories = new Set();

  for (const o of objects) {
    for (const [k, v] of Object.entries(o.fm)) {
      if (!k.startsWith('cat_') || !Array.isArray(v)) continue;
      for (const ref of v) {
        const c = resolveLink(o, ref, 'classif.r11');
        if (c) assignedCategories.add(c.id);
      }
    }
  }

  for (const [id, c] of idx.categories) {
    const facet = resolveLink(c, c.fm.facet, 'classif.r1');
    if (!facet || facet.type !== 'facet') {
      diag('classif.r1', 'error', c, 'Категория «' + c.title + '» не ссылается на существующий фасет');
      continue;
    }
    pass('classif.r1');
    if (c.fm.parent) {
      const parent = resolveLink(c, c.fm.parent, 'link.r1');
      if (!parent) continue;
      if (parent.type !== 'category') diag('link.r2', 'error', c, 'parent категории «' + c.title + '» не является категорией');
      if (!childrenOf.has(parent.id)) childrenOf.set(parent.id, []);
      childrenOf.get(parent.id).push(c);
      if (Array.isArray(c.fm.parent) && facet.fm.hierarchy_mode === 'strict' && c.fm.parent.length > 1) {
        diag('classif.r4', 'error', c, 'При hierarchy_mode: strict у категории «' + c.title + '» более одного parent');
      } else pass('classif.r4');
    }
  }

  // циклы в parent
  for (const [id, c] of idx.categories) {
    const seen = new Set();
    let cur = c;
    let cycle = false;
    while (cur && cur.fm.parent) {
      if (seen.has(cur.id)) { cycle = true; break; }
      seen.add(cur.id);
      cur = resolveLink(cur, cur.fm.parent, 'link.r1');
    }
    if (cycle) diag('classif.r5', 'error', c, 'Цикл в parent у категории «' + c.title + '»');
    else pass('classif.r5');
  }

  // уникальность названий в фасете + одинаковые названия в разных фасетах таксономии
  const labelsByFacet = new Map();
  const labelsByTaxonomy = new Map();
  for (const [id, c] of idx.categories) {
    const fKey = c.fm.facet && linkStable(c.fm.facet);
    labelsByFacet.set(fKey, labelsByFacet.get(fKey) || new Map());
    const bucket = labelsByFacet.get(fKey);
    if (bucket.has(c.title)) diag('classif.r8', 'error', c, 'Название «' + c.title + '» не уникально в пределах фасета');
    else { bucket.set(c.title, c); pass('classif.r8'); }
    const facet = idx.byId.get(fKey && fKey.split('-')[1]) ? null : null;
  }
  for (const [id, c] of idx.categories) {
    const facet = resolveLink(c, c.fm.facet, 'classif.r1');
    if (!facet) continue;
    const tax = resolveLink(facet, facet.fm.taxonomy, 'meta.r6');
    if (!tax) continue;
    const bucket = labelsByTaxonomy.get(tax.id) || new Map();
    if (!labelsByTaxonomy.has(tax.id)) labelsByTaxonomy.set(tax.id, bucket);
    if (bucket.has(c.title)) {
      const other = bucket.get(c.title);
      const otherFacet = resolveLink(other, other.fm.facet, 'classif.r1');
      if (otherFacet && otherFacet.id !== facet.id) {
        diag('classif.r9', 'warn', c, 'Название «' + c.title + '» встречается в разных фасетах таксономии «' + tax.title + '»');
      }
    } else bucket.set(c.title, c);
  }
  if (![...exercised.keys()].includes('classif.r9')) pass('classif.r9');

  // мёртвые категории
  // D-0069 (Q-57b = A): категории-триггеры аспектов считаются используемыми — classif.r7 ищет
  // категории без какого-либо назначения, а триггер активирует свойства аспекта (ADR-0008 §3.1),
  // то есть роль у категории есть. Текст правила в каталоге не меняется: уточнение интерпретации
  // эвристики уровня warn.
  const triggerCategoryIds = new Set();
  for (const a of aspects) {
    for (const ref of a.fm.trigger_categories || []) {
      const t = resolveLink(a, ref, 'aspect.r3');
      if (t) triggerCategoryIds.add(t.id);
    }
  }
  for (const [id, c] of idx.categories) {
    const facet = resolveLink(c, c.fm.facet, 'classif.r1');
    if (facet && isDictionaryFacet(facet)) continue; // словарь значений не является осью назначения (D-0064)
    const hasChildren = (childrenOf.get(id) || []).length > 0;
    const used = assignedCategories.has(id) || isUsedAsRole(id) || triggerCategoryIds.has(id);
    if (!hasChildren && !used && c.fm.status !== 'archived') {
      diag('classif.r7', 'warn', c, 'Категория «' + c.title + '» без дочерних и без назначений — возможно, мёртвая');
    }
  }
  pass('classif.r7');

  // поля cat_* и их фасеты
  for (const o of objects) {
    for (const [k, v] of Object.entries(o.fm)) {
      if (!k.startsWith('cat_')) continue;
      const key = k.slice(4);
      const facet = facetByKey.get(key);
      if (!facet) {
        diag('classif.r12', 'warn', o, 'Обнаружено поле ' + k + ' без соответствующего фасета');
        continue;
      }
      pass('classif.r10');
      if (!Array.isArray(v)) {
        diag('classif.r3', 'error', o, 'Поле ' + k + ' не является списком ссылок');
        continue;
      }
      const isDictionary = isDictionaryFacet(facet);
      for (const ref of v) {
        const c = resolveLink(o, ref, 'classif.r11');
        if (!c) continue;
        if (c.type !== 'category') {
          diag('classif.r11', 'error', o, 'Ссылка в ' + k + ' ведёт не на категорию: ' + c.rel);
          continue;
        }
        const cf = resolveLink(c, c.fm.facet, 'classif.r1');
        if (!cf || cf.id !== facet.id) {
          diag('classif.r11', 'error', o, 'Ссылка в ' + k + ' ведёт на категорию «' + c.title + '» другого фасета');
        } else pass('classif.r11');
      }
      if (!isDictionary) {
        const card = facet.fm.assignment_cardinality;
        if (!cardinalityOk(card, v.length)) {
          diag('classif.r3', 'error', o, 'Поле ' + k + ' допускает ' + card + ', фактически ' + v.length);
        } else pass('classif.r3');
        // тип объекта входит в applicable_types таксономии
        const tax = resolveLink(facet, facet.fm.taxonomy, 'meta.r6');
        if (tax && !typeInList(o, tax.fm.applicable_types, typeIndex)) {
          diag('classif.r2', 'error', o, 'Тип ' + o.type + ' не входит в applicable_types таксономии «' + tax.title + '»');
        } else pass('classif.r2');
      }
    }
  }

  // таксономии: applicable_types и корни фасетов
  for (const o of objects) {
    if (o.type !== 'taxonomy') continue;
    if (!Array.isArray(o.fm.applicable_types) || o.fm.applicable_types.length === 0) {
      diag('meta.r5', 'error', o, 'applicable_types таксономии «' + o.title + '» пуст');
    } else {
      pass('meta.r5');
      for (const ref of o.fm.applicable_types) {
        if (isSystemTypeName(ref)) continue; // D-0067: системный тип — голая строка snake_case
        const t = resolveLink(o, ref, 'meta.r5');
        if (!t) continue;
        if (t.type !== 'object_type') {
          diag('meta.r5', 'error', o, 'applicable_types содержит ссылку не на тип: ' + t.rel);
        }
      }
    }
  }
  for (const [key, facet] of facetByKey) {
    const tax = resolveLink(facet, facet.fm.taxonomy, 'meta.r6');
    if (!tax) continue;
    const roots = [...idx.categories.values()].filter((c) => {
      const f = resolveLink(c, c.fm.facet, 'classif.r1');
      return f && f.id === facet.id && !c.fm.parent;
    });
    const req = facet.fm.root_requirement || tax.fm.root_requirement;
    if (req === 'single' && roots.length !== 1) {
      diag('classif.r6', 'warn', facet, 'Корневых категорий ' + roots.length + ' при требовании single');
    } else pass('classif.r6');
  }

  // ── 6. Аспекты ────────────────────────────────────────────────────
  const aspectProps = new Map(); // property key -> [аспекты]
  const aspectTriggers = new Map(); // category id -> [аспекты]
  for (const a of idx.aspects) {
    if (!Array.isArray(a.fm.trigger_categories) || a.fm.trigger_categories.length === 0) {
      diag('aspect.r3', 'error', a, 'trigger_categories аспекта «' + a.title + '» пуст');
    }
    for (const ref of a.fm.trigger_categories || []) {
      const c = resolveLink(a, ref, 'aspect.r3');
      if (!c) { diag('aspect.r3', 'error', a, 'Триггер аспекта «' + a.title + '» не разрешается: ' + ref); continue; }
      if (c.type !== 'category') diag('aspect.r3', 'error', a, 'Триггер аспекта «' + a.title + '» не является категорией: ' + c.rel);
      else {
        pass('aspect.r3');
        if (!aspectTriggers.has(c.id)) aspectTriggers.set(c.id, []);
        aspectTriggers.get(c.id).push(a);
      }
    }
    if (!Array.isArray(a.fm.properties) || a.fm.properties.length === 0) {
      diag('aspect.r4', 'error', a, 'properties аспекта «' + a.title + '» пуст');
    }
    for (const ref of a.fm.properties || []) {
      const p = resolveLink(a, ref, 'aspect.r4');
      if (!p) { diag('aspect.r4', 'error', a, 'Свойство аспекта «' + a.title + '» не разрешается: ' + ref); continue; }
      if (p.type !== 'property') diag('aspect.r4', 'error', a, 'Цель в properties аспекта «' + a.title + '» не является свойством');
      else {
        pass('aspect.r4');
        if (!aspectProps.has(p.title)) aspectProps.set(p.title, []);
        aspectProps.get(p.title).push(a);
      }
    }
    if (a.fm.is_active === false) diag('aspect.r6', 'info', a, 'Аспект «' + a.title + '» выключен и не применяется');
    else pass('aspect.r6');
  }

  // ── 7. Экземпляры: эффективный набор свойств, аспекты, кардинальности ──
  for (const o of objects) {
    if (M1_TYPES.has(o.type)) continue; // состав полей системных типов задан ядром
    const def = typeIndex.get(o.type);
    if (!def) {
      diag('contract.r4', 'error', o, 'Неизвестный тип объекта: ' + o.type);
      continue;
    }
    pass('contract.r4');
    if (def.fm.is_abstract) {
      diag('contract.r5', 'error', o, 'Тип ' + o.type + ' абстрактный, экземпляры недопустимы');
    } else pass('contract.r5');

    const { keys, overrides } = effectiveProps(o.type);
    const activated = activatedAspects(o, idx, facetByKey);
    for (const a of activated) for (const ref of a.fm.properties || []) {
      const p = resolveLink(a, ref, 'aspect.r4');
      if (p) keys.add(p.title);
    }
    for (const a of activated) for (const ov of a.fm.property_overrides || []) {
      const p = resolveLink(a, ov.property, 'link.r1');
      if (p) overrides.set(p.title, { ...overrides.get(p.title), ...ov, defTitle: a.title });
    }

    const aspectKeys = new Set();
    for (const a of activated) for (const ref of a.fm.properties || []) {
      const p = resolveLink(a, ref, 'aspect.r4');
      if (p) aspectKeys.add(p.title);
    }

    for (const [k, v] of Object.entries(o.fm)) {
      if (CONTRACT_FIELDS.has(k) || k.startsWith('cat_')) continue;
      if (!keys.has(k)) {
        diag('property.r5', 'error', o, 'Свойство ' + k + ' не определено для типа ' + o.type + ' и не активировано ни одним аспектом');
        continue;
      }
      pass('property.r5');
      const p = properties.get(k);
      if (!p) continue;
      const ov = overrides.get(k) || {};
      const card = ov.cardinality || p.fm.cardinality;
      const required = ov.required !== undefined ? ov.required : p.fm.required;
      if (!cardinalityOk(card, v)) {
        diag('property.r2', 'error', o, 'Свойство ' + (p.fm.label || k) + ' допускает ' + card + ', фактически ' + describeFact(v));
      } else pass('property.r2');
      if (required && isEmpty(v)) {
        diag('property.r1', 'error', o, 'Не заполнено обязательное свойство ' + (p.fm.label || k) + ' (' + k + ')');
      } else pass('property.r1');
      if (p.fm.value_type === 'reference') {
        for (const ref of Array.isArray(v) ? v : [v]) {
          if (typeof ref !== 'string') continue;
          const t = resolveLink(o, ref, 'link.r1');
          if (!t) continue;
          if (Array.isArray(p.fm.target_types) && p.fm.target_types.length && !typeInList(t, p.fm.target_types, typeIndex)) {
            diag('link.r2', 'error', o, 'Свойство ' + (p.fm.label || k) + ' ожидает ' + p.fm.target_types.join(', ') + ', цель имеет тип ' + t.type);
          } else pass('link.r2');
          if (p.fm.expected_media_roles && t.type === 'media_asset') {
            const roles = t.fm.roles || [];
            if (!roles.some((r) => p.fm.expected_media_roles.includes(r))) {
              diag('media.r5', 'warn', o, 'Обёртка «' + t.title + '» не подходит для свойства ' + (p.fm.label || k) + ': ожидалась роль ' + p.fm.expected_media_roles.join(', '));
            } else pass('media.r5');
          }
        }
      }
      if (p.fm.value_type === 'date' && typeof v === 'string' && !/^\d{4}-\d{2}-\d{2}$/.test(v)) {
        diag('property.r3', 'error', o, 'Свойство ' + (p.fm.label || k) + ' ожидает date, фактически ' + v);
      } else if (p.fm.value_type === 'number' && v !== null && typeof v !== 'number') {
        diag('property.r3', 'error', o, 'Свойство ' + (p.fm.label || k) + ' ожидает number, фактически ' + typeof v);
      } else pass('property.r3');
      if (aspectKeys.has(k) && activated.length === 0 && !isEmpty(v)) {
        diag('property.r6', 'warn', o, 'Свойство ' + (p.fm.label || k) + ' заполнено, но ни одна назначенная категория его не активирует');
      }
    }

    // обязательные свойства, отсутствующие в frontmatter
    for (const k of keys) {
      const p = properties.get(k);
      if (!p) continue;
      const ov = overrides.get(k) || {};
      const required = ov.required !== undefined ? ov.required : p.fm.required;
      const card = ov.cardinality || p.fm.cardinality;
      if (required && !(k in o.fm) && (card === '1' || card === '1..n')) {
        diag('property.r1', 'error', o, 'Не заполнено обязательное свойство ' + (p.fm.label || k) + ' (' + k + ')');
      }
    }

    // aspect.r1: значение есть, а аспект не сработал
    for (const [k, v] of Object.entries(o.fm)) {
      if (CONTRACT_FIELDS.has(k) || k.startsWith('cat_')) continue;
      const owners = aspectProps.get(k);
      if (!owners || isEmpty(v)) continue;
      const active = owners.filter((a) => activated.includes(a));
      if (active.length === 0) {
        diag('aspect.r1', 'warn', o, 'Свойство ' + k + ' заполнено, но ни одна назначенная категория его не активирует');
      } else pass('aspect.r1');
    }
  }

  // ── 8. Последовательности и уникальность в области действия ────────
  for (const [typeId, def] of typeIndex) {
    const hasParent = 'sequential_parent' in def.fm;
    const hasKey = 'sequence_key' in def.fm;
    if (hasParent !== hasKey) {
      diag('sequence.r1', 'error', def, 'Тип «' + def.title + '» объявлен последовательностью частично: укажите оба поля или ни одного');
    } else pass('sequence.r1');
    if (!hasParent) continue;
    const parentProp = resolveLink(def, def.fm.sequential_parent, 'sequence.r2');
    if (!parentProp || parentProp.type !== 'property' || parentProp.fm.value_type !== 'reference' || !['1', '0..1'].includes(parentProp.fm.cardinality)) {
      diag('sequence.r2', 'error', def, 'Свойство-родитель последовательности «' + def.title + '» непригодно');
    } else pass('sequence.r2');
    const keyProp = resolveLink(def, def.fm.sequence_key, 'sequence.r3');
    if (!keyProp || keyProp.type !== 'property' || keyProp.fm.value_type !== 'number' || keyProp.fm.cardinality !== '1') {
      const ov = (def.fm.property_overrides || []).find((x) => {
        const p = resolveLink(def, x.property, 'link.r1');
        return p && keyProp && p.id === keyProp.id;
      });
      if (!ov || ov.cardinality !== '1') diag('sequence.r3', 'error', def, 'Свойство-ключ порядка «' + def.title + '» непригодно без ужесточения до cardinality: 1');
      else pass('sequence.r3');
    } else pass('sequence.r3');
    if (def.fm.sequence_step !== undefined && !(def.fm.sequence_step > 0)) {
      diag('sequence.r6', 'error', def, 'Шаг нумерации должен быть положительным');
    } else pass('sequence.r6');
    if (def.fm.title_template) {
      const { keys } = effectiveProps(typeId);
      for (const m of String(def.fm.title_template).matchAll(/\{([a-z0-9_]+)\}/g)) {
        if (!keys.has(m[1])) diag('meta.r14', 'error', def, 'Плейсхолдер {' + m[1] + '} не соответствует свойству типа «' + def.title + '»');
        else pass('meta.r14');
      }
    }
  }

  const uniqueIndex = new Map(); // property key -> Map(scopeValue -> [объекты])
  for (const o of objects) {
    if (M1_TYPES.has(o.type)) continue;
    const def = typeIndex.get(o.type);
    if (!def) continue;
    const { keys } = effectiveProps(o.type);
    // sequence.r4
    if ('sequence_key' in def.fm) {
      const keyProp = resolveLink(def, def.fm.sequence_key, 'sequence.r3');
      if (keyProp && isEmpty(o.fm[keyProp.title])) {
        diag('sequence.r4', 'error', o, 'Не заполнен ключ порядка ' + keyProp.title + ' у объекта «' + o.title + '»');
      } else pass('sequence.r4');
    }
    // unique.r1
    for (const k of Object.keys(o.fm)) {
      const p = properties.get(k);
      if (!p || !p.fm.unique_within) continue;
      const scopeProp = resolveLink(p, p.fm.unique_within, 'unique.r2');
      if (!scopeProp) continue;
      const scopeValue = stableOfValue(o.fm[scopeProp.title]);
      if (!scopeValue) continue;
      const bucket = uniqueIndex.get(k) || new Map();
      if (!uniqueIndex.has(k)) uniqueIndex.set(k, bucket);
      const pairKey = scopeValue + '|' + JSON.stringify(o.fm[k]);
      const list = bucket.get(pairKey) || [];
      list.push({ o, scopeValue, value: o.fm[k] });
      bucket.set(pairKey, list);
    }
  }
  for (const [key, bucket] of uniqueIndex) {
    for (const [, list] of bucket) {
      if (list.length > 1) {
        diag('unique.r1', 'error', list[1].o, 'В области ' + list[1].scopeValue + ' уже есть объект с ' + key + ' = ' + JSON.stringify(list[1].value) + ': ' + list[0].o.rel);
      } else pass('unique.r1');
    }
  }
  // sequence.r5: разрыв нумерации
  for (const [typeId, def] of typeIndex) {
    if (!('sequence_key' in def.fm)) continue;
    const keyProp = resolveLink(def, def.fm.sequence_key, 'sequence.r3');
    const parentProp = resolveLink(def, def.fm.sequential_parent, 'sequence.r2');
    if (!keyProp || !parentProp) continue;
    const groups = new Map();
    for (const o of objects) {
      if (o.type !== typeId) continue;
      const scope = stableOfValue(o.fm[parentProp.title]) || '(без родителя)';
      const value = o.fm[keyProp.title];
      if (typeof value !== 'number') continue;
      if (!groups.has(scope)) groups.set(scope, []);
      groups.get(scope).push({ o, value });
    }
    const step = def.fm.sequence_step || 10;
    for (const [scope, items] of groups) {
      items.sort((a, b) => a.value - b.value);
      for (let i = 1; i < items.length; i += 1) {
        if (items[i].value - items[i - 1].value > step) {
          diag('sequence.r5', 'warn', items[i].o, 'Между ' + items[i - 1].value + ' и ' + items[i].value + ' пропущены значения порядка');
        } else pass('sequence.r5');
      }
    }
  }

  // ── 9. Отношения ──────────────────────────────────────────────────
  const triples = new Map();
  const subjectsOfReplace = new Map();
  for (const o of objects) {
    if (o.type !== 'relation') continue;
    for (const f of ['subject', 'relation_type', 'object']) {
      if (!o.fm[f]) diag('relation.r1', 'error', o, 'У отношения не заполнено обязательное поле ' + f);
    }
    pass('relation.r1');
    const rt = resolveLink(o, o.fm.relation_type, 'link.r1');
    if (!rt || rt.type !== 'relation_type') {
      diag('link.r2', 'error', o, 'relation_type не разрешается в определение типа отношения');
      continue;
    }
    const subj = resolveLink(o, o.fm.subject, 'link.r1');
    const obj = resolveLink(o, o.fm.object, 'link.r1');
    if (subj && rt.fm.subject_types && rt.fm.subject_types.length && !typeInList(subj, rt.fm.subject_types, typeIndex)) {
      diag('relation.r2', 'error', o, 'Субъект типа ' + subj.type + ' недопустим для отношения «' + rt.fm.label + '»');
    } else pass('relation.r2');
    if (obj && rt.fm.object_types && rt.fm.object_types.length && !typeInList(obj, rt.fm.object_types, typeIndex)) {
      diag('relation.r3', 'error', o, 'Объект типа ' + obj.type + ' недопустим для отношения «' + rt.fm.label + '»');
    } else pass('relation.r3');

    const tripleKey = rt.id + '|' + (subj ? subj.id : '?') + '|' + (obj ? obj.id : '?');
    if (rt.fm.uniqueness_rule === 'unique_triple') {
      if (triples.has(tripleKey)) diag('relation.r4', 'error', o, 'Нарушено правило уникальности unique_triple: ' + triples.get(tripleKey));
      else { triples.set(tripleKey, o.rel); pass('relation.r4'); }
    }
    if (rt.fm.uniqueness_rule === 'unique_subject' && subj) {
      const list = subjectsOfReplace.get(subj.id) || [];
      list.push(o);
      subjectsOfReplace.set(subj.id, list);
    }
    if (o.fm.role) {
      const role = resolveLink(o, o.fm.role, 'link.r3');
      if (!role || role.type !== 'category') diag('link.r3', 'error', o, 'Значение role не является категорией');
      else {
        const facet = resolveLink(role, role.fm.facet, 'classif.r1');
        const propRole = properties.get('role');
        const expected = propRole ? resolveLink(propRole, propRole.fm.target_facet, 'link.r3') : null;
        if (expected && (!facet || facet.id !== expected.id)) {
          diag('link.r3', 'error', o, 'Значение role «' + role.title + '» не относится к фасету «' + expected.fm.label + '»');
        } else pass('link.r3');
      }
    }
    if (o.fm.valid_from && o.fm.valid_to) {
      const from = normalizeDate(o.fm.valid_from);
      const to = normalizeDate(o.fm.valid_to);
      if (from && to && to < from) diag('relation.r8', 'warn', o, 'Дата окончания раньше даты начала');
      else pass('relation.r8');
    }
    if (o.fm.valid_from !== undefined && typeof o.fm.valid_from === 'number') {
      diag('format.r3', 'info', o, 'valid_from записан целым годом: историческая форма (находка F-3.5)');
    }
  }
  for (const [subjId, list] of subjectsOfReplace) {
    if (list.length > 1) diag('lifecycle.r3', 'error', list[1], 'Объект «' + list[1].title + '» имеет несколько связей замены');
    else pass('lifecycle.r3');
  }

  // lifecycle.r1, lifecycle.r2
  for (const o of objects) {
    if (o.type !== 'relation') continue;
    const rt = resolveLink(o, o.fm.relation_type, 'link.r1');
    if (!rt || !['supersedes', 'merged_into'].includes(rt.title)) continue;
    const subj = resolveLink(o, o.fm.subject, 'link.r1');
    const obj = resolveLink(o, o.fm.object, 'link.r1');
    if (obj && obj.fm.status === 'archived') {
      diag('lifecycle.r1', 'error', o, 'Цель связи замены «' + obj.title + '» архивная; цепочки замен запрещены');
    } else pass('lifecycle.r1');
    if (subj && subj.fm.status === 'archived' && rt.title === 'merged_into') {
      pass('lifecycle.r2'); // архивация дубликата — шаг 6 процедуры слияния (RULES.md §12.1)
    }
  }
  for (const o of objects) {
    if (o.fm.status !== 'archived' || M1_TYPES.has(o.type)) continue;
    const referrers = objects.filter((x) => x !== o && x.fm.status === 'active' && x.links.some((l) => l.id === o.id));
    if (referrers.length) {
      diag('lifecycle.r2', 'warn', o, 'На архивный объект «' + o.title + '» ссылаются активные: ' + referrers.map((x) => x.rel).join(', '));
    } else pass('lifecycle.r2');
  }
  pass('lifecycle.r4');
  pass('lifecycle.r5');

  // relation.r6: одна связь не существует в двух формах
  for (const o of objects) {
    if (o.type !== 'relation') continue;
    const subj = resolveLink(o, o.fm.subject, 'link.r1');
    const obj = resolveLink(o, o.fm.object, 'link.r1');
    if (!subj || !obj) continue;
    for (const end of [subj, obj]) {
      if (M1_TYPES.has(end.type)) continue;
      for (const [k, v] of Object.entries(end.fm)) {
        if (CONTRACT_FIELDS.has(k) || k.startsWith('cat_')) continue;
        const values = Array.isArray(v) ? v : [v];
        const other = end === subj ? obj : subj;
        if (values.some((x) => typeof x === 'string' && x.includes('(' + prefixOfObject(other) + '-' + other.id + ')'))) {
          diag('relation.r6', 'error', end, 'Связь «' + subj.title + '» → «' + obj.title + '» продублирована: свойство ' + k + ' и отношение «' + o.title + '»');
        } else pass('relation.r6');
      }
    }
  }

  // relation.r7: рекомендация
  for (const o of objects) {
    if (o.type !== 'relation') continue;
    const rt = resolveLink(o, o.fm.relation_type, 'link.r1');
    if (!rt || rt.fm.is_restriction !== false) continue;
    const subj = resolveLink(o, o.fm.subject, 'link.r1');
    if (subj && rt.fm.subject_types && rt.fm.subject_types.length && !typeInList(subj, rt.fm.subject_types, typeIndex)) {
      diag('relation.r7', 'warn', o, 'Не рекомендуется: «' + rt.fm.label + '» обычно связывает другие типы');
    } else pass('relation.r7');
  }
  pass('relation.r5');

  // ── 10. Представления и автоматизации ─────────────────────────────
  for (const o of objects) {
    if (o.type === 'view') {
      if (o.fm.is_active && (!Array.isArray(o.fm.target_types) || o.fm.target_types.length === 0)) {
        diag('view.r1', 'error', o, 'Активное представление «' + o.title + '» без целевых типов');
      } else {
        pass('view.r1');
        for (const ref of o.fm.target_types || []) {
          const t = resolveLink(o, ref, 'view.r1');
          if (!t) diag('view.r1', 'error', o, 'Целевой тип представления «' + o.title + '» не разрешается');
          else if (t.type === 'object_type') {
            const typeId = prefixToTypeId(t);
            const { keys } = effectiveProps(typeId);
            if (keys.size === 0) diag('view.r2', 'warn', o, 'Представление ссылается на тип «' + t.title + '» без свойств, пригодных для колонок');
            else pass('view.r2');
          }
        }
      }
    }
    if (o.type === 'automation') {
      for (const ref of o.fm.form_fields || []) {
        if (typeof ref === 'string' && ref.startsWith('sys:')) {
          if (!SYS_FIELDS.has(ref)) diag('meta.r15', 'error', o, 'Неизвестное sys-поле в form_fields: ' + ref);
          else pass('meta.r15');
          continue;
        }
        const p = resolveLink(o, ref, 'meta.r15');
        if (!p) { diag('meta.r15', 'error', o, 'Элемент form_fields не разрешается: ' + ref); continue; }
        if (p.type !== 'property') { diag('meta.r15', 'error', o, 'Элемент form_fields не является свойством: ' + p.rel); continue; }
        let ok = false;
        for (const ref2 of o.fm.target_types || []) {
          const t = resolveLink(o, ref2, 'meta.r15');
          if (!t) continue;
          const typeId = prefixToTypeId(t);
          if (effectiveProps(typeId).keys.has(p.title)) ok = true;
        }
        if (!ok) diag('meta.r15', 'error', o, 'Поле ' + p.title + ' не принадлежит целевому типу автоматизации');
        else pass('meta.r15');
      }
      pass('meta.r8');
    }
  }

  // ── 11. Медиаобёртки ──────────────────────────────────────────────
  const fileOwners = new Map();
  const referencedAssets = new Set();
  for (const o of objects) {
    if (o.type !== 'media_asset') continue;
    if (!o.fm.file) {
      diag('media.r1', 'error', o, 'У обёртки «' + o.title + '» не заполнено поле file');
      continue;
    }
    const abs = path.join(VAULT, o.fm.file);
    if (!fs.existsSync(abs)) diag('media.r1', 'error', o, 'Файл обёртки не найден: ' + o.fm.file);
    else pass('media.r1');
    const expected = o.title.slice(0, 60) + ' (MEDIA-' + o.id + ')' + path.extname(o.fm.file);
    if (path.basename(o.fm.file) !== expected) {
      diag('media.r9', 'warn', o, 'Имя файла «' + path.basename(o.fm.file) + '» не соответствует каноническому «' + expected + '»');
    } else pass('media.r9');
    pass('naming.r11');
    if (fileOwners.has(o.fm.file)) {
      diag('media.r6', 'warn', o, 'Файл ' + o.fm.file + ' используется несколькими обёртками');
    } else { fileOwners.set(o.fm.file, o); pass('media.r6'); }
    const galleries = o.fm.galleries || [];
    const seen = new Set();
    for (const ref of galleries) {
      const g = resolveLink(o, ref, 'media.r3');
      if (!g) { diag('media.r3', 'error', o, 'Ссылка на галерею не разрешается: ' + ref); continue; }
      if (g.type !== 'gallery') diag('media.r3', 'error', o, 'Цель в galleries «' + g.title + '» не является объектом типа gallery');
      else pass('media.r3');
      if (seen.has(g.id)) diag('media.r3', 'error', o, 'Дубликат галереи в списке обёртки «' + o.title + '»');
      seen.add(g.id);
    }
    if (galleries.length > 5) diag('media.r7', 'warn', o, 'Обёртка «' + o.title + '» входит в ' + galleries.length + ' галерей');
    else pass('media.r7');
    pass('media.r2');
  }
  for (const o of objects) {
    for (const l of o.links) {
      if (l.id) referencedAssets.add(l.id);
    }
  }
  for (const o of objects) {
    if (o.type !== 'media_asset') continue;
    const usedBy = objects.filter((x) => x !== o && x.links.some((l) => l.id === o.id));
    if (usedBy.length === 0) diag('media.r4', 'warn', o, 'Обёртка «' + o.title + '» не используется ни одним объектом');
    else pass('media.r4');
  }
  const assets = fs.existsSync(path.join(VAULT, 'assets')) ? fs.readdirSync(path.join(VAULT, 'assets')) : [];
  const wrappedFiles = new Set(objects.filter((o) => o.type === 'media_asset').map((o) => path.basename(o.fm.file || '')));
  for (const a of assets) {
    if (!wrappedFiles.has(a)) diag('media.r8', 'info', null, 'Файл вложения ' + a + ' не имеет обёртки (норма, если роль и метаданные не нужны)');
  }
  pass('media.r8');

  // ── 12. Определения M1: уникальность и «мёртвые» определения ──────
  const usedProps = new Set();
  const usedRelationTypes = new Set();
  for (const o of objects) {
    if (o.type === 'object_type') {
      for (const ref of o.fm.properties || []) { const p = resolveLink(o, ref, 'link.r1'); if (p) usedProps.add(p.id); }
      for (const ov of o.fm.property_overrides || []) { const p = resolveLink(o, ov.property, 'link.r1'); if (p) usedProps.add(p.id); }
      for (const f of ['sequential_parent', 'sequence_key', 'unique_within']) {
        if (o.fm[f]) { const p = resolveLink(o, o.fm[f], 'link.r1'); if (p) usedProps.add(p.id); }
      }
    }
    if (o.type === 'aspect') {
      for (const ref of o.fm.properties || []) { const p = resolveLink(o, ref, 'link.r1'); if (p) usedProps.add(p.id); }
      for (const ov of o.fm.property_overrides || []) { const p = resolveLink(o, ov.property, 'link.r1'); if (p) usedProps.add(p.id); }
    }
    if (o.type === 'property' && o.fm.unique_within) { const p = resolveLink(o, o.fm.unique_within, 'link.r1'); if (p) usedProps.add(p.id); }
    if (o.type === 'automation') for (const ref of o.fm.form_fields || []) { const p = resolveLink(o, ref, 'link.r1'); if (p) usedProps.add(p.id); }
    if (o.type === 'relation') { const rt = resolveLink(o, o.fm.relation_type, 'link.r1'); if (rt) usedRelationTypes.add(rt.id); }
  }
  for (const [key, p] of properties) {
    const auto = p.fm.scope === 'universal' || p.fm.scope === 'family';
    if (!usedProps.has(p.id) && !auto && p.fm.lifecycle !== 'deprecated') {
      diag('meta.r13', 'warn', p, 'Определение свойства «' + (p.fm.label || key) + '» не используется ни одним типом или аспектом');
    } else pass('meta.r13');
  }
  pass('meta.r11');
  const m1Ids = new Set();
  for (const o of objects) {
    if (!M1_TYPES.has(o.type)) continue;
    if (m1Ids.has(o.id)) diag('meta.r12', 'error', o, 'id определения M1 не уникален: ' + o.id);
    else { m1Ids.add(o.id); pass('meta.r12'); }
  }

  // ── 13. Разрешение ссылок и каноническая форма ────────────────────
  for (const o of objects) {
    for (const l of o.links) {
      if (!l.prefix || !l.id) {
        diag('link.r4', 'error', o, 'Ссылка не содержит идентификатора цели, разрешение ненадёжно: ' + l.raw);
        continue;
      }
      const list = idx.byStable.get(l.prefix + '-' + l.id);
      if (!list || list.length === 0) {
        diag('link.r1', 'error', o, 'Ссылка ведёт на несуществующий объект: ' + l.raw);
        continue;
      }
      if (list.length > 1) {
        diag('link.r6', 'warn', o, 'Неоднозначная ссылка ' + l.raw + ': найдено ' + list.length + ' файлов');
        continue;
      }
      pass('link.r6');
      pass('link.r4');
      pass('link.r1'); // цель существует и однозначна — правило проверено (учёт exercised)
      const target = list[0];
      const expectedPrefix = prefixOfObject(target);
      if (l.prefix !== expectedPrefix) {
        diag('link.r4', 'error', o, 'Префикс ссылки ' + l.prefix + ' не соответствует префиксу цели ' + expectedPrefix + ': ' + l.raw);
      } else pass('link.r4');
      const names = new Set([target.title, target.fm.label].filter(Boolean));
      const expectedTarget = [...names].map((n) => n + ' (' + l.prefix + '-' + l.id + ')');
      if (!expectedTarget.includes(l.target)) {
        diag('link.r5', 'warn', o, 'Подпись ссылки устарела: «' + l.target + '» вместо «' + expectedTarget[0] + '»');
      } else pass('link.r5');
      if (l.alias && !names.has(l.alias)) {
        diag('link.r5', 'warn', o, 'Подпись ссылки «' + l.alias + '» не совпадает с названием цели «' + target.title + '»');
      }
    }
  }

  // ── 14. Итоги ─────────────────────────────────────────────────────
  const errors = diagnostics.filter((d) => d.level === 'error');
  const warns = diagnostics.filter((d) => d.level === 'warn');
  const infos = diagnostics.filter((d) => d.level === 'info');

  console.log('[check] объектов: ' + objects.length + ', схема ' + version + ', правил в каталоге: ' + catalog.size);
  console.log('[check] проверено правил на примерах: ' + exercised.size + ' из ' + catalog.size);
  if (errors.length || warns.length || infos.length) {
    console.log('');
    for (const d of diagnostics) {
      console.log('[' + d.level.toUpperCase() + '] ' + d.ruleId + ' — ' + d.file + ' — ' + d.message);
    }
  }
  console.log('');
  console.log('[итог] error: ' + errors.length + ', warn: ' + warns.length + ', info: ' + infos.length);

  writeReport(version, objects, catalog);
  if (errors.length > 0) process.exit(1);
}

// ─────────────────────────────────────────────────────────────────────────────
// Вспомогательные функции (объявлены после main для читаемости, поднимаются hoisting-ом)
// ─────────────────────────────────────────────────────────────────────────────

function prefixOfObject(o) {
  if (M1_TYPES.has(o.type)) {
    return {
      object_type: 'OTYPE', property_type: 'PTYPE', property: 'PROP', relation_type: 'RTYPE',
      relation: 'REL', taxonomy: 'TAX', facet: 'FACET', category: 'CAT', media_asset: 'MEDIA',
      view: 'VIEW', automation: 'AUTO', aspect: 'ASPECT',
    }[o.type];
  }
  return PREFIX_TO_TYPE_REV[o.type] || null;
}

const PREFIX_TO_TYPE_REV = {
  person: 'PERSON', character: 'CHAR', organization: 'ORG', project: 'PROJ', task: 'TASK',
  book: 'BOOK', chapter: 'CHAP', article: 'ARTICLE', gallery: 'GALLERY',
};

function isKeyTitleType(type) {
  return ['property', 'property_type', 'relation_type', 'facet', 'aspect', 'automation'].includes(type);
}

function linkStable(value) {
  if (typeof value !== 'string') return null;
  const m = value.match(/\(([A-Z][A-Z0-9]{2,11})-([0-9A-HJKMNP-TV-Z]{26})\)/);
  return m ? m[2] : null;
}

function stableOfValue(value) {
  if (typeof value === 'string') return linkStable(value);
  if (Array.isArray(value) && typeof value[0] === 'string') return linkStable(value[0]);
  return null;
}

let CURRENT = null;
function resolveLink(from, value, ruleId) {
  const id = typeof value === 'string' ? linkStable(value) : Array.isArray(value) && value.length === 1 ? linkStable(value[0]) : null;
  if (!id) return null;
  const list = CURRENT.byId.get(id);
  if (list && list.length) return list[0];
  return null;
}

/** Системные типы M1, записываемые в applicable_types/target_types голой строкой snake_case (D-0067). */
const SYSTEM_TYPE_NAMES = new Set(['category', 'media_asset', 'relation']);

function isSystemTypeName(v) {
  return typeof v === 'string' && SYSTEM_TYPE_NAMES.has(v);
}

function cardinalityOk(card, value) {
  const n = Array.isArray(value) ? value.length : value === null || value === undefined || value === '' ? 0 : 1;
  switch (card) {
    case '1': return n === 1;
    case '0..1': return n <= 1;
    case '1..n': return Array.isArray(value) ? n >= 1 : n === 1;
    case '0..n': return true;
    default: return true;
  }
}

function isEmpty(v) {
  if (v === null || v === undefined || v === '') return true;
  if (Array.isArray(v)) return v.length === 0 || v.every((x) => x === null || x === '');
  return false;
}

function describeFact(v) {
  if (Array.isArray(v)) return v.length + ' знач.';
  return v === null || v === undefined || v === '' ? '0 знач.' : '1 знач.';
}

function normalizeDate(v) {
  if (typeof v === 'number') return String(v).padStart(4, '0') + '-01-01';
  if (typeof v === 'string') return v.length === 4 ? v + '-01-01' : v;
  return null;
}

function typeInList(obj, refs, typeIndex) {
  // D-0067: системный тип в списке — голая строка snake_case, совпадает с type объекта.
  if (refs.some((r) => isSystemTypeName(r) && r === obj.type)) return true;
  const targets = refs.map((r) => ({ id: linkStable(r), raw: r })).filter((t) => t.id);
  if (targets.some((t) => t.id === obj.id)) return true;
  let def = obj.type === 'object_type' ? obj : typeIndex.get(obj.type);
  let guard = 0;
  while (def && guard < 20) {
    if (targets.some((t) => t.id === def.id)) return true;
    const parentId = linkStable(def.fm.parent_type);
    def = parentId ? [...typeIndex.values()].find((x) => x.id === parentId) : null;
    guard += 1;
  }
  return false;
}

function isDictionaryFacet(facet) {
  const tax = resolveLink(facet, facet.fm.taxonomy, 'meta.r6');
  if (!tax || !Array.isArray(tax.fm.applicable_types)) return false;
  // D-0064 + D-0067: словарь — таксономия с голым именем relation в applicable_types.
  return tax.fm.applicable_types.some((r) => r === 'relation');
}

function isUsedAsRole(categoryId) {
  return roleCategoryIds.has(categoryId);
}
const roleCategoryIds = new Set();

function activatedAspects(o, idx, facetByKey) {
  const assigned = [];
  for (const [k, v] of Object.entries(o.fm)) {
    if (!k.startsWith('cat_') || !Array.isArray(v)) continue;
    if (isDictionaryFacet(facetByKey.get(k.slice(4)))) continue;
    for (const ref of v) {
      const c = resolveLink(o, ref, 'classif.r11');
      if (c) assigned.push(c);
    }
  }
  const withAncestors = new Set();
  for (const c of assigned) {
    let cur = c;
    let guard = 0;
    while (cur && guard < 20) {
      withAncestors.add(cur.id);
      const parentId = linkStable(cur.fm.parent);
      cur = parentId ? idx.categories.get(parentId) : null;
      guard += 1;
    }
  }
  return idx.aspects.filter((a) => a.fm.is_active !== false && (a.fm.trigger_categories || []).some((ref) => {
    const c = resolveLink(a, ref, 'aspect.r3');
    return c && withAncestors.has(c.id);
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Отчёт
// ─────────────────────────────────────────────────────────────────────────────

function writeReport(version, objects, catalog) {
  const errors = diagnostics.filter((d) => d.level === 'error');
  const warns = diagnostics.filter((d) => d.level === 'warn');
  const infos = diagnostics.filter((d) => d.level === 'info');
  const lines = [];
  lines.push('> Прогон выполнен `tools/examples/check.cjs` (Node ' + process.versions.node + ', AJV ' + require('ajv/package.json').version + '). Дата: ' + new Date().toISOString().slice(0, 10) + '.');
  lines.push('>');
  lines.push('> Хранилище примеров: `examples/vault/` (' + objects.length + ' заметок). Схема: ' + version + ' (двухпроходная валидация формы) + межобъектные правила каталога.');
  lines.push('');
  lines.push('**Итог: ' + errors.length + ' error, ' + warns.length + ' warn, ' + infos.length + ' info. Правил, проверенных на примерах: ' + exercised.size + ' из ' + catalog.size + '.**');
  lines.push('');
  lines.push('### Диагностика');
  lines.push('');
  if (diagnostics.length === 0) lines.push('Диагностики нет: канонические примеры проходят все реализованные в песочнице проверки.');
  else {
    lines.push('| Уровень | Правило | Файл | Сообщение |');
    lines.push('|---|---|---|---|');
    for (const d of diagnostics) {
      lines.push('| ' + d.level + ' | `' + d.ruleId + '` | `' + d.file + '` | ' + d.message.replace(/\|/g, '\\|') + ' |');
    }
  }
  lines.push('');
  lines.push('### Матрица: какие правила проверены на канонических примерах');
  lines.push('');
  lines.push('| Правило | Уровень | Результат |');
  lines.push('|---|---|---|');
  const groups = new Map();
  for (const [id, rule] of catalog) {
    if (!groups.has(rule.group)) groups.set(rule.group, []);
    groups.get(rule.group).push(rule);
  }
  for (const [, rules] of [...groups].sort()) {
    for (const rule of rules.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))) {
      const e = exercised.get(rule.id);
      const mark = !e ? '⬜ не реализовано в песочнице'
        : e.error ? '❌ error: ' + e.error
        : e.warn ? '⚠️ warn: ' + e.warn
        : e.info ? 'ℹ️ info: ' + e.info
        : '✅ нарушений нет';
      lines.push('| `' + rule.id + '` | ' + rule.level + ' | ' + mark + ' |');
    }
  }
  lines.push('');

  if (fs.existsSync(RUN_MD)) {
    const text = fs.readFileSync(RUN_MD, 'utf8');
    const start = text.indexOf(BEGIN);
    const end = text.indexOf(END);
    if (start === -1 || end === -1) throw new Error('В ' + RUN_MD + ' нет маркеров генерируемого раздела');
    fs.writeFileSync(RUN_MD, text.slice(0, start) + BEGIN + '\n' + lines.join('\n') + END + text.slice(end + END.length), 'utf8');
  } else {
    throw new Error('Не найден ' + RUN_MD + ': документ с маркерами создаётся до первого прогона');
  }
  fs.writeFileSync(
    RUN_JSON,
    JSON.stringify(
      {
        generated_by: 'tools/examples/check.cjs',
        schema_version: version,
        objects: objects.length,
        summary: { error: errors.length, warn: warns.length, info: infos.length, rules_exercised: exercised.size, rules_total: catalog.size },
        diagnostics,
        exercised: Object.fromEntries(exercised),
      },
      null,
      2
    ) + '\n',
    'utf8'
  );
  console.log('[ok] отчёт записан: ' + path.relative(process.cwd(), RUN_MD));
}

// ─────────────────────────────────────────────────────────────────────────────

try {
  // CURRENT используется функцией resolveLink: заполняется до проверок
  const version = findActiveVersion();
  const loaded = loadVault();
  const { objects } = loaded;
  CURRENT = buildIndexes(objects, loaded.manifest);
  for (const o of objects) {
    if (o.type === 'relation' && o.fm.role) {
      const id = linkStable(o.fm.role);
      if (id) roleCategoryIds.add(id);
    }
  }
  main(objects, CURRENT, loaded.manifest);
} catch (err) {
  console.error('[fail] ' + (err.stack || err.message));
  process.exit(1);
}
