#!/usr/bin/env node
/**
 * tools/schema-lint.cjs
 *
 * Статическая проверка схемы до её использования: все ли $ref разрешимы, все ли поля
 * схемы описаны, согласованы ли версии и имена, все ли ветки диспетчеризации на месте.
 *
 * Зачем отдельный скрипт: ошибка в схеме обнаруживается либо при сборке производного файла,
 * либо — что хуже — молчаливым принятием некорректных данных. В фазе 3a одна такая ошибка
 * уже была: ветки корневого oneOf переопределяли required фрагментов (находка F-3.16),
 * и поймал её только прогон контрольных примеров.
 *
 * Проверки:
 *   L1  каждый фрагмент имеет $schema, $id, title, description
 *   L2  $id фрагмента соответствует его пути относительно schema/
 *   L3  каждый $ref разрешим: файл существует, указатель JSON внутри него существует
 *   L4  каталог версии совпадает с версией в имени точки входа и в x-metamodel-version
 *   L5  ветки диспетчеризации содержат только $ref (иначе соседние ключевые слова
 *       применяются наряду с целью ссылки и переопределяют её ограничения — F-3.16)
 *   L6  число веток равно числу типов M1 (12) плюс одна ветка экземпляра M0
 *   L7  каждое определение M1 объявляет type: const и подчиняется системному контракту
 *   L8  аннотации x-rules ссылаются на правила, существующие в docs/validation/RULES.md
 *   L9  производные файлы существуют и свежее источника
 *
 * Код возврата: 0 — замечаний нет, 1 — есть ошибки.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SCHEMA_DIR = path.join(ROOT, 'schema');
const RULES_MD = path.join(ROOT, 'docs', 'validation', 'RULES.md');
const ID_BASE = 'https://secondbrain.local/schema/';

const M1_TYPES = [
  'object_type',
  'property_type',
  'property',
  'relation_type',
  'relation',
  'taxonomy',
  'facet',
  'category',
  'media_asset',
  'view',
  'automation',
  'aspect',
];

const errors = [];
const warnings = [];
const err = (code, msg) => errors.push(code + ': ' + msg);
const warn = (code, msg) => warnings.push(code + ': ' + msg);

function findActiveVersion() {
  const roots = fs
    .readdirSync(SCHEMA_DIR)
    .filter((f) => /^metamodel-\d+\.\d+\.\d+\.schema\.json$/.test(f))
    .map((f) => ({ file: f, doc: JSON.parse(fs.readFileSync(path.join(SCHEMA_DIR, f), 'utf8')) }))
    .filter((r) => !r.doc['x-superseded-by']);
  if (roots.length !== 1) {
    throw new Error(
      'Ожидалась ровно одна точка входа схемы без x-superseded-by, найдено: ' +
        (roots.map((r) => r.file).join(', ') || 'ни одной')
    );
  }
  const version = roots[0].file.match(/^metamodel-(\d+\.\d+\.\d+)\.schema\.json$/)[1];
  if (!fs.existsSync(path.join(SCHEMA_DIR, version))) {
    throw new Error('Для ' + roots[0].file + ' нет каталога фрагментов schema/' + version + '/');
  }
  return version;
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

function resolvePointer(doc, pointer) {
  if (!pointer) return doc;
  const tokens = pointer.replace(/^\//, '').split('/').map((t) => t.replace(/~1/g, '/').replace(/~0/g, '~'));
  let cur = doc;
  for (const token of tokens) {
    if (cur === null || typeof cur !== 'object' || !(token in cur)) return undefined;
    cur = cur[token];
  }
  return cur;
}

function main() {
  const version = findActiveVersion();
  const catalogs = fs
    .readdirSync(SCHEMA_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && /^\d+\.\d+\.\d+$/.test(d.name))
    .map((d) => d.name)
    .sort();
  if (catalogs.length > 1) {
    warn('L4', 'в schema/ несколько каталогов версий: ' + catalogs.join(', ') + '. Активная — ' + version +
      ' (точка входа без x-superseded-by); предыдущие сохранены как артефакты своих выпусков');
  }

  // L4: точка входа и объявленная версия.
  const rootFile = path.join(SCHEMA_DIR, 'metamodel-' + version + '.schema.json');
  if (!fs.existsSync(rootFile)) {
    err('L4', 'нет точки входа schema/metamodel-' + version + '.schema.json');
    return finish();
  }
  const root = JSON.parse(fs.readFileSync(rootFile, 'utf8'));
  if (root['x-metamodel-version'] !== version) {
    err('L4', 'x-metamodel-version (' + root['x-metamodel-version'] + ') не совпадает с версией каталога (' + version + ')');
  }

  const fragmentFiles = collect(path.join(SCHEMA_DIR, version), '.json');
  const docs = new Map();
  docs.set(rootFile, root);
  for (const f of fragmentFiles) docs.set(f, JSON.parse(fs.readFileSync(f, 'utf8')));

  // L1, L2: метаданные фрагментов и соответствие $id пути.
  for (const [file, doc] of docs) {
    const rel = path.relative(ROOT, file);
    if (file !== rootFile) {
      for (const key of ['$schema', '$id', 'title', 'description']) {
        if (!doc[key]) err('L1', rel + ': отсутствует ' + key);
      }
      const expectedId = ID_BASE + path.relative(SCHEMA_DIR, file).split(path.sep).join('/');
      if (doc.$id && doc.$id !== expectedId) {
        err('L2', rel + ': $id «' + doc.$id + '» не соответствует пути «' + expectedId + '»');
      }
    }
  }

  // L3: разрешимость $ref.
  const byId = new Map();
  for (const [file, doc] of docs) if (doc.$id) byId.set(doc.$id, { file, doc });
  let refCount = 0;
  const walkRefs = (node, ownerFile) => {
    if (Array.isArray(node)) return node.forEach((n) => walkRefs(n, ownerFile));
    if (!node || typeof node !== 'object') return;
    for (const key of Object.keys(node)) {
      if (key === '$ref' && typeof node[key] === 'string') {
        refCount += 1;
        const ref = node[key];
        const hashIndex = ref.indexOf('#');
        const uriPart = hashIndex === -1 ? ref : ref.slice(0, hashIndex);
        const pointer = hashIndex === -1 ? '' : ref.slice(hashIndex + 1);
        const ownerDoc = docs.get(ownerFile);
        const baseUri = ownerDoc && ownerDoc.$id ? ownerDoc.$id : ID_BASE + path.relative(SCHEMA_DIR, ownerFile).split(path.sep).join('/');
        const absolute = uriPart === '' ? baseUri : uriPart.startsWith(ID_BASE) ? uriPart : new URL(uriPart, baseUri).href;
        if (absolute.startsWith('#')) {
          if (resolvePointer(ownerDoc, absolute.slice(1)) === undefined) {
            err('L3', path.relative(ROOT, ownerFile) + ': локальный $ref ' + ref + ' не разрешается');
          }
          continue;
        }
        const target = byId.get(absolute);
        if (!target) {
          err('L3', path.relative(ROOT, ownerFile) + ': $ref ' + ref + ' → файл схемы не найден (' + absolute + ')');
          continue;
        }
        if (pointer && resolvePointer(target.doc, pointer) === undefined) {
          err('L3', path.relative(ROOT, ownerFile) + ': $ref ' + ref + ' → указатель не найден в ' + path.relative(ROOT, target.file));
        }
      } else if (key !== '$id') {
        walkRefs(node[key], ownerFile);
      }
    }
  };
  for (const [file, doc] of docs) walkRefs(doc, file);

  // L5, L6: ветки диспетчеризации.
  const branches = root.anyOf || root.oneOf || [];
  if (!branches.length) err('L6', 'в точке входа нет ни anyOf, ни oneOf: диспетчеризация отсутствует');
  if (root.oneOf) warn('L6', 'использован oneOf: при allErrors диагностика перечисляет провалы всех веток (F-3.17). Рекомендуется anyOf');
  for (const [i, branch] of branches.entries()) {
    const keys = Object.keys(branch).filter((k) => k !== '$ref');
    if (keys.length) {
      err('L5', 'ветка ' + i + ' содержит ключи кроме $ref: ' + keys.join(', ') + ' — они применяются наряду с целью ссылки и переопределяют её ограничения (F-3.16)');
    }
  }
  if (branches.length !== M1_TYPES.length + 1) {
    err('L6', 'веток ' + branches.length + ', ожидается ' + (M1_TYPES.length + 1) + ' (12 типов M1 + конверт M0)');
  }

  // L7: каждое определение M1 объявляет type: const и подчиняется системному контракту.
  const m1Files = fragmentFiles.filter((f) => f.includes(path.sep + 'm1' + path.sep));
  const declaredTypes = [];
  for (const file of m1Files) {
    const doc = docs.get(file);
    const rel = path.relative(ROOT, file);
    const typeConst = doc.properties && doc.properties.type && doc.properties.type.const;
    if (!typeConst) err('L7', rel + ': нет properties.type.const — ветка диспетчеризации не сработает');
    else declaredTypes.push(typeConst);
    const refersContract = JSON.stringify(doc.allOf || []).includes('system_contract.json');
    if (!refersContract) err('L7', rel + ': фрагмент не подчиняется системному контракту (нет $ref на common/system_contract.json в allOf)');
  }
  for (const t of M1_TYPES) {
    if (!declaredTypes.includes(t)) err('L7', 'тип M1 «' + t + '» не объявлен ни в одном фрагменте m1/');
  }
  for (const t of declaredTypes) {
    if (!M1_TYPES.includes(t)) err('L7', 'фрагмент объявляет type «' + t + '», которого нет в перечне 12 типов M1');
  }

  // L8: аннотации x-rules против каталога правил.
  const rulesText = fs.readFileSync(RULES_MD, 'utf8');
  const catalog = new Set();
  for (const m of rulesText.matchAll(/^\|\s*`([a-z]+)\.r(\d+)`\s*\|\s*(?:error|warn|info)\s*\|/gm)) {
    catalog.add(m[1] + '.r' + m[2]);
  }
  const annotated = new Set();
  const walkRules = (node) => {
    if (Array.isArray(node)) return node.forEach(walkRules);
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node['x-rules'])) node['x-rules'].forEach((id) => annotated.add(id));
    for (const key of Object.keys(node)) walkRules(node[key]);
  };
  for (const [, doc] of docs) walkRules(doc);
  for (const id of annotated) {
    if (!catalog.has(id)) err('L8', 'аннотация x-rules ссылается на правило ' + id + ', которого нет в RULES.md');
  }

  // L9: производные файлы существуют и не старше источника.
  const bundle = path.join(SCHEMA_DIR, 'dist', 'metamodel-' + version + '.bundle.json');
  const types = path.join(ROOT, 'src', 'generated', 'metamodel-' + version + '.types.ts');
  const newestSource = Math.max(...[...docs.keys()].map((f) => fs.statSync(f).mtimeMs));
  for (const derived of [bundle, types]) {
    if (!fs.existsSync(derived)) {
      warn('L9', 'производный файл не найден: ' + path.relative(ROOT, derived) + ' — выполните npm run schema:all');
      continue;
    }
    if (fs.statSync(derived).mtimeMs < newestSource) {
      warn('L9', path.relative(ROOT, derived) + ' старше источника: пересоберите (npm run schema:all)');
    }
  }

  console.log(
    '[lint] версия ' + version + ': файлов схемы ' + docs.size + ', $ref ' + refCount +
    ', веток ' + branches.length + ', правил в каталоге ' + catalog.size +
    ', аннотировано правилами ' + annotated.size
  );
  finish();
}

function finish() {
  for (const w of warnings) console.log('[warn] ' + w);
  for (const e of errors) console.log('[FAIL] ' + e);
  if (errors.length) {
    console.log('\n[итог] ошибок: ' + errors.length + ', предупреждений: ' + warnings.length);
    process.exit(1);
  }
  console.log('[ok] ошибок нет' + (warnings.length ? ', предупреждений: ' + warnings.length : ''));
}

main();
