#!/usr/bin/env node
/**
 * tools/examples/generate.cjs
 *
 * Пересоздаёт каноническое хранилище примеров examples/vault/** (фаза 3b).
 *
 *   вход:   tools/examples/vault-data.cjs (реестр идентификаторов)
 *           tools/examples/data-*.cjs (состав объектов)
 *   выход:  examples/vault/**\/*.md          — заметки (frontmatter + тело)
 *           examples/vault/assets/*.png      — заглушки медиафайлов
 *           examples/vault-manifest.json     — производный реестр (вход для check.cjs)
 *
 * Почему примеры генерируются:
 *   1. идентификаторы ULID — ровно 26 символов, руками их легко написать с ошибкой;
 *   2. каждая ссылка обязана содержать стабильную часть (PREFIX-ULID) и совпадать с именем файла
 *      цели (link.r4, link.r5, contract.r10, contract.r11) — генератор собирает ссылки из одного
 *      реестра, поэтому расхождение «пример ↔ пример» невозможно по построению;
 *   3. имена файлов строятся по норме D-0063: ключ у определений, адресуемых по ключу,
 *      отображаемое название у остальных;
 *   4. даты записываются закавыченными строками (D-0065), а не значениями типа Date.
 *
 * Правки вносятся в файлы данных, затем `npm run examples`. Файлы в examples/** — производные
 * и руками не редактируются. Проверка результата: `npm run examples:check`.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const YAML = require('yaml');

const { ID, M1_PREFIX, M0_PREFIX, FOLDER, displayName } = require('./vault-data.cjs');
const { ABSTRACT_TYPES, CONCRETE_TYPES } = require('./data-types.cjs');
const { PROPERTIES_1 } = require('./data-properties-1.cjs');
const { PROPERTIES_2, PROPERTY_TYPES } = require('./data-properties-2.cjs');
const { RELATION_TYPES, RELATIONS } = require('./data-relations.cjs');
const { TAXONOMIES, FACETS, CATEGORIES } = require('./data-classification.cjs');
const { CORE_TYPE_REFS, ASPECTS, VIEWS, AUTOMATIONS } = require('./data-m1-extra.cjs');
const { INSTANCES } = require('./data-instances.cjs');
const { MEDIA_ASSETS } = require('./data-media.cjs');

const ROOT = path.join(__dirname, '..', '..');
const OUT = path.join(ROOT, 'examples', 'vault');
const MANIFEST = path.join(ROOT, 'examples', 'vault-manifest.json');

const CROCKFORD = /^[0-9A-HJKMNP-TV-Z]{26}$/;

/** Минимальный корректный PNG 1×1 px — заглушка медиафайла. */
const PNG_1PX = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==',
  'base64'
);

// ─────────────────────────────────────────────────────────────────────────────
// Реестр объектов
// ─────────────────────────────────────────────────────────────────────────────

const BY_KEY = new Map();

function register(rec) {
  if (BY_KEY.has(rec.key)) throw new Error('Дублирующийся ключ объекта примера: ' + rec.key);
  if (!ID[rec.key] && !rec.virtualId) throw new Error('Для ключа ' + rec.key + ' нет идентификатора в vault-data.cjs');
  rec.id = rec.virtualId || ID[rec.key];
  if (!CROCKFORD.test(rec.id)) {
    throw new Error('Идентификатор ' + rec.key + ' не ULID: ' + rec.id + ' (длина ' + rec.id.length + ')');
  }
  BY_KEY.set(rec.key, rec);
  return rec;
}

function prefixOf(rec) {
  if (rec.prefix) return rec.prefix;
  if (M1_PREFIX[rec.type]) return M1_PREFIX[rec.type];
  if (M0_PREFIX[rec.type]) return M0_PREFIX[rec.type];
  throw new Error('Не определён префикс для объекта ' + rec.key + ' (type: ' + rec.type + ')');
}

/** Каноническая ссылка ADR-0002 п.4: [[{имя} ({PREFIX}-{id})|{подпись}]]. */
function link(key, alias) {
  const rec = BY_KEY.get(key);
  if (!rec) throw new Error('Ссылка на незарегистрированный объект: ' + key);
  return '[[' + rec.display + ' (' + prefixOf(rec) + '-' + rec.id + ')|' + (alias || rec.display) + ']]';
}

/** Имя файла заметки: {имя} ({PREFIX}-{id}).md (ADR-0002 п.3, contract.r11, contract.r12). */
function fileName(rec) {
  return rec.display.slice(0, 60) + ' (' + prefixOf(rec) + '-' + rec.id + ').md';
}

/** Значение, которое YAML обязан сериализовать закавыченной строкой (D-0065). */
function q(s) {
  const sc = new YAML.Scalar(String(s));
  sc.type = YAML.Scalar.QUOTE_DOUBLE;
  return sc;
}

function quoted(value) {
  return value === null || value === undefined ? null : q(String(value));
}

function linkList(keys, aliases) {
  return keys.map((k, i) => link(k, aliases ? aliases[i] : undefined));
}

// ─────────────────────────────────────────────────────────────────────────────
// Сборка записей: определения M1
// ─────────────────────────────────────────────────────────────────────────────

const records = [];

for (const t of ABSTRACT_TYPES) {
  records.push(
    register({
      kind: 'object_type',
      typeId: t.type_id,
      key: t.key,
      type: 'object_type',
      display: t.title,
      folder: FOLDER.object_type,
      purpose:
        'Абстрактный предметный тип. Экземпляры не создаются (contract.r5), в выборе типа не предлагается; ' +
        'может быть целью `subject_types` / `object_types` в значении «любой наследник».',
      data: t,
    })
  );
}

for (const t of CONCRETE_TYPES) {
  records.push(
    register({
      kind: 'object_type',
      typeId: t.type_id,
      key: t.key,
      type: 'object_type',
      display: t.title,
      folder: FOLDER.object_type,
      purpose: 'Конкретный предметный тип: экземпляры создаются, тип имеет собственный префикс.',
      data: t,
    })
  );
}

for (const p of PROPERTIES_1.concat(PROPERTIES_2)) {
  records.push(
    register({
      kind: 'property',
      key: p.key,
      type: 'property',
      display: p.title, // D-0063: title свойства является ключом поля
      heading: p.title + ' — ' + p.label,
      folder: FOLDER.property,
      purpose: 'Определение свойства: хранит значения по умолчанию ограничений, которые тип может ужесточить.',
      data: p,
    })
  );
}

for (const p of PROPERTY_TYPES) {
  records.push(
    register({
      kind: 'property_type',
      key: p.key,
      type: 'property_type',
      display: p.title,
      heading: p.title + ' — ' + p.label,
      folder: FOLDER.property_type,
      purpose:
        'Объект устаревшего типа PropertyType: набор значений закрыт перечислением `value_type` на уровне ядра ' +
        '(находка F-3.2, D-0066). Объекты сохранены, чтобы префикс PTYPE не переиспользовался.',
      data: p,
    })
  );
}

for (const r of RELATION_TYPES) {
  records.push(
    register({
      kind: 'relation_type',
      key: r.key,
      type: 'relation_type',
      display: r.title, // D-0063: title типа отношения является ключом
      heading: r.title + ' — ' + r.label,
      folder: FOLDER.relation_type,
      purpose: 'Семантика связи: допустимые типы субъекта и объекта, направленность, кардинальность, уникальность.',
      data: r,
    })
  );
}

for (const r of RELATIONS) {
  records.push(
    register({
      kind: 'relation',
      key: r.key,
      type: 'relation',
      display: r.title,
      folder: FOLDER.relation,
      purpose:
        'Экземпляр связи с атрибутами. Создаётся по правилу повышения X-03: как только у связи появляется ' +
        'хотя бы один атрибут, ссылка в свойстве обязана стать объектом Relation.',
      data: r,
    })
  );
}

for (const t of TAXONOMIES) {
  records.push(
    register({
      kind: 'taxonomy',
      key: t.key,
      type: 'taxonomy',
      display: t.title,
      folder: FOLDER.taxonomy,
      purpose:
        'Область классификации: контейнер осей (фасетов), а не иерархия категорий. Состав фасетов вычисляется ' +
        'из ссылок `Facet.taxonomy` и не хранится.',
      data: t,
    })
  );
}

for (const f of FACETS) {
  records.push(
    register({
      kind: 'facet',
      key: f.key,
      type: 'facet',
      display: f.title, // D-0063 + NAME_MAPPING §0 п.3: имя файла строится по ключу, подпись — в label
      heading: f.title + ' — ' + f.label,
      folder: FOLDER.facet,
      purpose:
        'Ось классификации внутри таксономии. Обязательный `key` образует имя поля назначений `cat_<key>` ' +
        'на объектах (ADR-0007).',
      data: f,
    })
  );
}

for (const c of CATEGORIES) {
  records.push(
    register({
      kind: 'category',
      key: c.key,
      type: 'category',
      display: c.label,
      folder: FOLDER.category,
      purpose: 'Значение внутри фасета. Категория принадлежит ровно одному фасету; ссылка хранится только вверх.',
      data: c,
    })
  );
}

for (const a of ASPECTS) {
  records.push(
    register({
      kind: 'aspect',
      key: a.key,
      type: 'aspect',
      display: a.title, // D-0063: title аспекта является ключом
      heading: a.title + ' — ' + a.label,
      folder: FOLDER.aspect,
      purpose:
        'Набор свойств, активируемых назначенными категориями. Активация включает потомков категории, ' +
        'значения хранятся в плоском frontmatter самого объекта.',
      data: a,
    })
  );
}

for (const v of VIEWS) {
  records.push(
    register({
      kind: 'view',
      key: v.key,
      type: 'view',
      display: v.label,
      folder: FOLDER.view,
      purpose:
        'Определение представления. Значение `mechanism` — абстрактный идентификатор: названия инструментов ' +
        'в метамодели запрещены (правило расслоения L-1…L-4).',
      data: v,
    })
  );
}

for (const a of AUTOMATIONS) {
  records.push(
    register({
      kind: 'automation',
      key: a.key,
      type: 'automation',
      display: a.title, // D-0063: title автоматизации является ключом
      heading: a.title + ' — ' + a.label,
      folder: FOLDER.automation,
      purpose:
        'Автоматизация и форма создания объекта. Форма выводится из типа объекта: отдельный тип Form отклонён ' +
        'как дублирование данных (ADR-0010 §3.4).',
      data: a,
    })
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Сборка записей: экземпляры (M0 и системные типы-экземпляры)
// ─────────────────────────────────────────────────────────────────────────────

for (const i of INSTANCES) {
  records.push(
    register({
      kind: 'instance',
      key: i.key,
      type: i.type,
      display: i.title,
      folder: 'objects',
      purpose: 'Экземпляр предметного типа (M0): системный контракт плюс поля, состав которых задан метамоделью.',
      data: i,
    })
  );
}

for (const m of MEDIA_ASSETS) {
  records.push(
    register({
      kind: 'media_asset',
      key: m.key,
      type: 'media_asset',
      display: m.title,
      folder: FOLDER.media_asset,
      asset: 'assets/' + m.title.slice(0, 60) + ' (MEDIA-' + ID[m.key] + ').' + m.ext,
      purpose:
        'Медиаобёртка: реификация ссылки на файл, потому что у связи файла с объектом есть атрибуты ' +
        '(роли, источник, автор, лицензия, метод создания).',
      data: m,
    })
  );
}

for (const c of CORE_TYPE_REFS) {
  records.push(register({
    kind: 'core_type_ref',
    key: c.key,
    type: c.systemType,
    display: c.title,
    prefix: c.prefix,
    virtualId: c.id,
    note: c.note,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Frontmatter по видам объектов
// ─────────────────────────────────────────────────────────────────────────────

function fmObjectType(rec, stamp) {
  const d = rec.data;
  const isAbstract = !d.type_prefix;
  const fm = [
    ['id', rec.id],
    ['type', 'object_type'],
    ['title', d.title],
    ['label', d.label],
    ['type_prefix', isAbstract ? null : d.type_prefix],
    ['is_abstract', isAbstract],
    ['layer', 'domain'],
    ['parent_type', d.parent ? link(d.parent) : null],
    ['properties', linkList(d.properties || [])],
  ];
  if (d.overrides) {
    fm.push([
      'property_overrides',
      d.overrides.map((o) => {
        const item = { property: link(o.property) };
        if (o.required !== undefined) item.required = o.required;
        if (o.cardinality !== undefined) item.cardinality = o.cardinality;
        return item;
      }),
    ]);
  }
  if (d.sequential_parent) fm.push(['sequential_parent', link(d.sequential_parent)]);
  if (d.sequence_key) fm.push(['sequence_key', link(d.sequence_key)]);
  if (d.sequence_step !== undefined) fm.push(['sequence_step', d.sequence_step]);
  if (d.sequence_direction) fm.push(['sequence_direction', d.sequence_direction]);
  if (d.title_template) fm.push(['title_template', d.title_template]);
  fm.push(['description', d.description]);
  fm.push(['lifecycle', 'standard']);
  return withStamp(fm, stamp);
}

function fmProperty(rec, stamp) {
  const d = rec.data;
  const fm = [
    ['id', rec.id],
    ['type', 'property'],
    ['title', d.title],
    ['label', d.label],
    ['value_type', d.value_type],
    ['cardinality', d.cardinality],
    ['required', d.required],
    ['scope', d.scope],
  ];
  if (d.applies_to) fm.push(['applies_to', linkList(d.applies_to)]);
  if (d.value_type === 'reference') fm.push(['target_types', linkList(d.target_types || [])]);
  if (d.target_facet) fm.push(['target_facet', link(d.target_facet)]);
  if (d.expected_media_roles) fm.push(['expected_media_roles', d.expected_media_roles]);
  if (d.unique_within) fm.push(['unique_within', link(d.unique_within)]);
  if (d.allowed_values) fm.push(['allowed_values', d.allowed_values]);
  fm.push(['definition', d.definition]);
  fm.push(['lifecycle', 'standard']);
  return withStamp(fm, stamp);
}

function fmPropertyType(rec, stamp) {
  const d = rec.data;
  return withStamp(
    [
      ['id', rec.id],
      ['type', 'property_type'],
      ['title', d.title],
      ['label', d.label],
      ['description', 'Значение закрытого перечисления `value_type` (ADR-0003, закрывает C-22). Объект сохранён как артефакт устаревшего механизма: префикс PTYPE не переиспользуется.'],
      ['lifecycle', 'deprecated'],
    ],
    stamp
  );
}

function fmRelationType(rec, stamp) {
  const d = rec.data;
  const fm = [
    ['id', rec.id],
    ['type', 'relation_type'],
    ['title', d.title],
    ['label', d.label],
    ['forward_label', d.forward_label],
    ['inverse_label', d.inverse_label],
    ['direction', d.direction],
    ['subject_types', linkList(d.subject_types || [])],
    ['object_types', linkList(d.object_types || [])],
    ['cardinality', d.cardinality],
    ['uniqueness_rule', d.uniqueness_rule],
  ];
  if (d.is_restriction !== undefined) fm.push(['is_restriction', d.is_restriction]);
  if (d.description) fm.push(['description', d.description]);
  fm.push(['lifecycle', 'standard']);
  return withStamp(fm, stamp);
}

function fmRelation(rec, stamp) {
  const d = rec.data;
  const fm = [
    ['id', rec.id],
    ['type', 'relation'],
    ['title', d.title],
    ['subject', link(d.subject)],
    ['relation_type', link(d.relation_type, d.relation_type_label)],
    ['object', link(d.object)],
  ];
  if (d.order !== undefined) fm.push(['order', d.order]);
  if (d.is_primary !== undefined) fm.push(['is_primary', d.is_primary]);
  if (d.role) fm.push(['role', link(d.role)]);
  if (d.position !== undefined) fm.push(['position', d.position]);
  if (d.valid_from !== undefined && d.valid_from !== null) fm.push(['valid_from', quoted(d.valid_from)]);
  if (d.valid_to !== undefined && d.valid_to !== null) fm.push(['valid_to', quoted(d.valid_to)]);
  if (d.source_ref) fm.push(['source_ref', d.source_ref]);
  if (d.context) fm.push(['context', d.context]);
  if (d.description) fm.push(['description', d.description]);
  return withStamp(fm, stamp);
}

function fmTaxonomy(rec, stamp) {
  const d = rec.data;
  const fm = [
    ['id', rec.id],
    ['type', 'taxonomy'],
    ['title', d.title],
    ['label', d.label],
    ['applicable_types', linkList(d.applicable_types)],
  ];
  if (d.hierarchy_mode) fm.push(['hierarchy_mode', d.hierarchy_mode]);
  if (d.assignment_cardinality) fm.push(['assignment_cardinality', d.assignment_cardinality]);
  if (d.root_requirement) fm.push(['root_requirement', d.root_requirement]);
  if (d.description) fm.push(['description', d.description]);
  fm.push(['lifecycle', 'standard']);
  return withStamp(fm, stamp);
}

function fmFacet(rec, stamp) {
  const d = rec.data;
  const fm = [
    ['id', rec.id],
    ['type', 'facet'],
    ['title', d.title],
    ['label', d.label],
    ['key', d.title],
    ['taxonomy', link(d.taxonomy)],
  ];
  if (d.hierarchy_mode) fm.push(['hierarchy_mode', d.hierarchy_mode]);
  if (d.assignment_cardinality) fm.push(['assignment_cardinality', d.assignment_cardinality]);
  if (d.root_requirement) fm.push(['root_requirement', d.root_requirement]);
  if (d.description) fm.push(['description', d.description]);
  fm.push(['lifecycle', 'standard']);
  return withStamp(fm, stamp);
}

function fmCategory(rec, stamp) {
  const d = rec.data;
  const fm = [
    ['id', rec.id],
    ['type', 'category'],
    ['title', d.label],
    ['label', d.label],
    ['facet', link(d.facet)],
  ];
  if (d.parent) fm.push(['parent', link(d.parent)]);
  if (d.description) fm.push(['description', d.description]);
  fm.push(['lifecycle', 'standard']);
  return withStamp(fm, stamp, d.status);
}

function fmAspect(rec, stamp) {
  const d = rec.data;
  const fm = [
    ['id', rec.id],
    ['type', 'aspect'],
    ['title', d.title],
    ['label', d.label],
    ['layer', d.layer],
    ['trigger_categories', linkList(d.trigger_categories)],
    ['properties', linkList(d.properties)],
  ];
  if (d.overrides) {
    fm.push([
      'property_overrides',
      d.overrides.map((o) => {
        const item = { property: link(o.property) };
        if (o.required !== undefined) item.required = o.required;
        if (o.cardinality !== undefined) item.cardinality = o.cardinality;
        return item;
      }),
    ]);
  }
  fm.push(['is_active', d.is_active]);
  if (d.description) fm.push(['description', d.description]);
  fm.push(['lifecycle', d.lifecycle || 'standard']);
  return withStamp(fm, stamp);
}

function fmView(rec, stamp) {
  const d = rec.data;
  const fm = [
    ['id', rec.id],
    ['type', 'view'],
    ['title', d.title],
    ['label', d.label],
    ['target_types', linkList(d.target_types, d.type_refs)],
    ['mechanism', d.mechanism],
    ['definition', q(d.definition)],
    ['is_active', d.is_active],
  ];
  if (d.description) fm.push(['description', d.description]);
  fm.push(['lifecycle', d.lifecycle || 'standard']);
  return withStamp(fm, stamp);
}

function fmAutomation(rec, stamp) {
  const d = rec.data;
  const fm = [
    ['id', rec.id],
    ['type', 'automation'],
    ['title', d.title],
    ['label', d.label],
    ['trigger', d.trigger],
    ['mechanism', d.mechanism],
    ['target_types', linkList(d.target_types)],
    ['form_fields', d.form_fields.map((f) => (f.startsWith('sys:') ? f : link(f)))],
    ['defaults', d.defaults],
    ['require_confirmation', d.require_confirmation],
    ['is_active', d.is_active],
  ];
  if (d.description) fm.push(['description', d.description]);
  fm.push(['lifecycle', d.lifecycle || 'standard']);
  return withStamp(fm, stamp);
}

function fmInstance(rec, stamp) {
  const d = rec.data;
  const fm = [
    ['id', rec.id],
    ['type', d.type],
    ['title', d.title],
  ];
  if (d.aliases) fm.push(['aliases', d.aliases]);
  for (const [k, v] of Object.entries(d.fields || {})) {
    if (Array.isArray(v)) {
      fm.push([k, v.every((item) => isKeyRef(item)) ? linkList(v) : v]);
    } else {
      fm.push([k, isKeyRef(v) ? link(v) : v]);
    }
  }
  for (const [k, v] of Object.entries(d)) {
    if (k.startsWith('cat_')) fm.push([k, linkList(v)]);
  }
  if (d.tags) fm.push(['tags', d.tags]);
  return withStamp(fm, stamp, d.status);
}

function fmMediaAsset(rec, stamp) {
  const d = rec.data;
  const fm = [
    ['id', rec.id],
    ['type', 'media_asset'],
    ['title', d.title],
    ['file', rec.asset],
    ['media_kind', d.media_kind],
    ['roles', d.roles],
    ['galleries', linkList(d.galleries || [])],
  ];
  if (d.cat_creation_method) fm.push(['cat_creation_method', linkList(d.cat_creation_method)]);
  if ('source_url' in d) fm.push(['source_url', d.source_url === null ? null : d.source_url]);
  if (d.author) fm.push(['author', link(d.author)]);
  if (d.license) fm.push(['license', d.license]);
  for (const [k, v] of Object.entries(d.fields || {})) fm.push([k, v]);
  if (d.description) fm.push(['description', d.description]);
  return withStamp(fm, stamp);
}

/** Значение поля экземпляра является ключом объекта реестра — заменяем канонической ссылкой. */
function isKeyRef(value) {
  return typeof value === 'string' && BY_KEY.has(value) && !value.includes(' ');
}

const DATE_FIELDS = new Set([
  'created_at',
  'updated_at',
  'birth_date',
  'death_date',
  'publication_date',
  'valid_from',
  'valid_to',
]);

/** Системный контракт в конце frontmatter; даты — закавыченными строками (D-0065). */
function withStamp(pairs, stamp, status) {
  const out = pairs.filter(([k]) => k !== 'status');
  out.push(['status', status || 'active']);
  out.push(['created_at', quoted(stamp.created)]);
  out.push(['updated_at', quoted(stamp.updated)]);
  return out
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => [k, DATE_FIELDS.has(k) && typeof v === 'string' ? quoted(v) : v]);
}

const BUILDERS = {
  object_type: fmObjectType,
  property: fmProperty,
  property_type: fmPropertyType,
  relation_type: fmRelationType,
  relation: fmRelation,
  taxonomy: fmTaxonomy,
  facet: fmFacet,
  category: fmCategory,
  aspect: fmAspect,
  view: fmView,
  automation: fmAutomation,
  instance: fmInstance,
  media_asset: fmMediaAsset,
};

// ─────────────────────────────────────────────────────────────────────────────
// Тело заметки
// ─────────────────────────────────────────────────────────────────────────────

const KIND_LABEL = {
  object_type: 'определение типа объекта (M1)',
  property: 'определение свойства (M1)',
  property_type: 'объект устаревшего типа PropertyType (M1)',
  relation_type: 'определение типа отношения (M1)',
  relation: 'экземпляр отношения (системный тип M1)',
  taxonomy: 'таксономия (M1)',
  facet: 'фасет классификации (M1)',
  category: 'категория (M1)',
  aspect: 'аспект (M1)',
  view: 'представление (M1)',
  automation: 'автоматизация (M1)',
  instance: 'экземпляр предметного типа (M0)',
  media_asset: 'медиаобёртка (системный тип M1)',
};

function bodyOf(rec, fm) {
  const d = rec.data || {};
  const lines = [];
  lines.push('# ' + (rec.heading || rec.display));
  lines.push('');
  lines.push('> **Канонический пример** (фаза 3b): ' + KIND_LABEL[rec.kind] + '.');
  lines.push('>');
  lines.push('> ' + (rec.purpose || ''));
  lines.push('');
  lines.push('| | |');
  lines.push('|---|---|');
  lines.push('| Имя файла | `' + fileName(rec) + '` |');
  lines.push('| Префикс типа | `' + prefixOf(rec) + '` |');
  lines.push('| Идентификатор | `' + rec.id + '` (ULID, 26 символов) |');
  if (d.type_prefix) lines.push('| `type_prefix` | `' + d.type_prefix + '` |');
  if (d.children) lines.push('| Наследники в MVP | ' + d.children + ' |');
  if (rec.asset) lines.push('| Медиафайл | `' + rec.asset + '` (заглушка 1×1 px) |');
  lines.push('| Роль поля `title` | ' + (isKeyTitle(rec) ? 'ключ (D-0063)' : 'отображаемое название (D-0063)') + ' |');
  lines.push('');
  if (d.body) {
    lines.push(d.body.trim());
    lines.push('');
  }
  if (d.shows && d.shows.length) {
    lines.push('## Что демонстрирует пример');
    lines.push('');
    for (const s of d.shows) lines.push('- ' + s);
    lines.push('');
  }
  if (d.note) {
    lines.push('> ' + d.note);
    lines.push('');
  }
  lines.push('---');
  lines.push('');
  lines.push('Файл сгенерирован `tools/examples/generate.cjs` из реестра `tools/examples/vault-data.cjs` — производный артефакт, руками не редактируется. Проверка: `npm run examples:check` (схема ' + SCHEMA_VERSION + ' + межобъектные правила каталога).');
  lines.push('');
  return lines.join('\n');
}

const KEY_TITLE_KINDS = new Set(['property', 'property_type', 'relation_type', 'facet', 'aspect', 'automation']);
function isKeyTitle(rec) {
  return KEY_TITLE_KINDS.has(rec.kind);
}

// ─────────────────────────────────────────────────────────────────────────────
// Запись
// ─────────────────────────────────────────────────────────────────────────────

function activeSchemaVersion() {
  const schemaDir = path.join(ROOT, 'schema');
  const roots = fs
    .readdirSync(schemaDir)
    .filter((f) => /^metamodel-\d+\.\d+\.\d+\.schema\.json$/.test(f))
    .map((f) => ({ file: f, doc: JSON.parse(fs.readFileSync(path.join(schemaDir, f), 'utf8')) }))
    .filter((r) => !r.doc['x-superseded-by']);
  if (roots.length !== 1) throw new Error('Ожидалась ровно одна точка входа схемы без x-superseded-by');
  return roots[0].file.match(/^metamodel-(\d+\.\d+\.\d+)\.schema\.json$/)[1];
}

const SCHEMA_VERSION = activeSchemaVersion();

function resetDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

function main() {
  resetDir(OUT);
  fs.mkdirSync(path.join(OUT, 'assets'), { recursive: true });

  const manifest = [];
  let minute = 0;
  for (const rec of records) {
    if (rec.kind === 'core_type_ref') {
      manifest.push({
        key: rec.key,
        id: rec.id,
        type: rec.type,
        prefix: prefixOf(rec),
        display: rec.display,
        file: null,
        virtual: true,
        note: rec.note,
      });
      continue;
    }
    const stamp = {
      created: '2026-10-21T' + String(9 + Math.floor(minute / 60)).padStart(2, '0') + ':' + String(minute % 60).padStart(2, '0') + ':00+03:00',
      updated: '2026-10-21T18:00:00+03:00',
    };
    minute += 1;

    const pairs = BUILDERS[rec.kind](rec, stamp);
    // lineWidth: 0 — ссылки и описания не переносятся: каноническая wikilink-запись обязана
    // читаться одной строкой (перенос допустим для YAML-парсера, но ломает копирование и поиск).
    const fmText = YAML.stringify(new Map(pairs), { lineWidth: 0 }).trimEnd();

    const rel = path.join(rec.folder, fileName(rec));
    const abs = path.join(OUT, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, '---\n' + fmText + '\n---\n\n' + bodyOf(rec, pairs), 'utf8');

    if (rec.asset) {
      const assetAbs = path.join(OUT, rec.asset);
      fs.mkdirSync(path.dirname(assetAbs), { recursive: true });
      fs.writeFileSync(assetAbs, PNG_1PX);
    }

    manifest.push({
      key: rec.key,
      id: rec.id,
      type: rec.type,
      prefix: prefixOf(rec),
      display: rec.display,
      file: 'examples/vault/' + rel.split(path.sep).join('/'),
      virtual: false,
      kind: rec.kind,
    });
  }

  fs.writeFileSync(
    MANIFEST,
    JSON.stringify(
      {
        generated_by: 'tools/examples/generate.cjs',
        schema_version: SCHEMA_VERSION,
        note: 'Производный реестр канонического хранилища примеров. virtual: true — запись индекса типов, у которой нет файла (Q-55, находка F-3.21).',
        objects: manifest,
      },
      null,
      2
    ) + '\n',
    'utf8'
  );

  const byKind = {};
  for (const m of manifest) byKind[m.kind || 'core_type_ref'] = (byKind[m.kind || 'core_type_ref'] || 0) + 1;
  console.log('[ok] канонических примеров: ' + manifest.filter((m) => !m.virtual).length + ' в examples/vault/');
  console.log('[info] состав: ' + Object.entries(byKind).map(([k, v]) => k + ' ' + v).join(', '));
  console.log('[info] записей индекса типов без файла: ' + manifest.filter((m) => m.virtual).length);
  console.log('[info] схема: ' + SCHEMA_VERSION + ', реестр: examples/vault-manifest.json');
}

main();
