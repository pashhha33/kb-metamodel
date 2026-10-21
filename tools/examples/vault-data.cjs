#!/usr/bin/env node
/**
 * tools/examples/vault-data.cjs
 *
 * РЕЕСТР канонического хранилища примеров (фаза 3b). Единственный источник данных
 * для tools/examples/generate.cjs: идентификаторы, состав объектов, ссылки между ними.
 *
 * Зачем отдельный файл: идентификаторы ULID обязаны быть ровно 26 символов, а ссылки —
 * содержать стабильную часть (PREFIX-ULID). Держать реестр в одном месте — значит
 * исключить расхождение «пример ↔ пример» (тот же принцип, что в tools/fixtures/generate.cjs).
 *
 * Правки вносятся сюда, затем `npm run examples`. Файлы в examples/vault/** — производные.
 *
 * Нормативные источники: docs/metamodel/00_overview.md, NAME_MAPPING.md (§0, §7, §8),
 * TYPE_PREFIX_REGISTRY.md, docs/validation/RULES.md, ADR-0001…ADR-0011.
 */
'use strict';

/** Префиксы системных типов M1 (TYPE_PREFIX_REGISTRY §2). */
const M1_PREFIX = {
  object_type: 'OTYPE',
  property_type: 'PTYPE',
  property: 'PROP',
  relation_type: 'RTYPE',
  relation: 'REL',
  taxonomy: 'TAX',
  facet: 'FACET',
  category: 'CAT',
  media_asset: 'MEDIA',
  view: 'VIEW',
  automation: 'AUTO',
  aspect: 'ASPECT',
};

/** Префиксы конкретных предметных типов (TYPE_PREFIX_REGISTRY §4). */
const M0_PREFIX = {
  person: 'PERSON',
  character: 'CHAR',
  organization: 'ORG',
  project: 'PROJ',
  task: 'TASK',
  book: 'BOOK',
  chapter: 'CHAP',
  article: 'ARTICLE',
  gallery: 'GALLERY',
};

/**
 * Идентификаторы. Часть взята из уже принятых документов (ADR-0002, ADR-0003, ADR-0006…
 * ADR-0009, 03_chapter_scenario), чтобы примеры документов и каноническое хранилище
 * ссылались на одни и те же объекты. Остальные достраиваются в том же блоковом стиле.
 * Все значения обязаны пройти проверку /^[0-9A-HJKMNP-TV-Z]{26}$/.
 */
const ID = {
  // ── определения типов объекта (M1) ────────────────────────────────
  otype_book: '01J8Z6M4K2Q7V9X3N5B0C1D2HH', // в ADR-0003 §3.1 использован 01J8Z6M4K2Q7V9X3N5B0C1D2AC — он закреплён за экземпляром книги
  otype_chapter: '01J8Z6M4K2Q7V9X3N5B0C1D5A1', // 03_chapter_scenario §3.1
  otype_work: '01J8Z6M4K2Q7V9X3N5B0C1D2AA',
  otype_person: '01J8Z6M4K2Q7V9X3N5B0C1D2AD',
  otype_organization: '01J8Z6M4K2Q7V9X3N5B0C1D2AE',
  otype_gallery: '01J8Z6M4K2Q7V9X3N5B0C1D2AF',
  otype_context: '01J8Z6M4K2Q7V9X3N5B0C1D2G1',
  otype_activity: '01J8Z6M4K2Q7V9X3N5B0C1D2G2',
  otype_collection: '01J8Z6M4K2Q7V9X3N5B0C1D2G3',
  otype_source: '01J8Z6M4K2Q7V9X3N5B0C1D2G4',
  otype_knowledge: '01J8Z6M4K2Q7V9X3N5B0C1D2G5',

  // ── свойства (M1) ─────────────────────────────────────────────────
  prop_publisher: '01J8Z6M4K2Q7V9X3N5B0C1D2AB', // ADR-0003 §3.2
  prop_isbn: '01J8Z6M4K2Q7V9X3N5B0C1D2H1',
  prop_page_count: '01J8Z6M4K2Q7V9X3N5B0C1D2H2',
  prop_publication_date: '01J8Z6M4K2Q7V9X3N5B0C1D2H3',
  prop_language: '01J8Z6M4K2Q7V9X3N5B0C1D2H4',
  prop_part_of: '01J8Z6M4K2Q7V9X3N5B0C1D5A2', // 03_chapter_scenario §3.2 (unique_within)
  prop_order: '01J8Z6M4K2Q7V9X3N5B0C1D2B3',
  prop_chapter_label: '01J8Z6M4K2Q7V9X3N5B0C1D2H5',
  prop_cover: '01J8Z6M4K2Q7V9X3N5B0C1D2B4',
  prop_illustrations: '01J8Z6M4K2Q7V9X3N5B0C1D2H6',
  prop_portrait: '01J8Z6M4K2Q7V9X3N5B0C1D2H7',
  prop_logo: '01J8Z6M4K2Q7V9X3N5B0C1D2H8',
  prop_birth_date: '01J8Z6M4K2Q7V9X3N5B0C1D2H9',
  prop_death_date: '01J8Z6M4K2Q7V9X3N5B0C1D2HA',
  prop_pen_name: '01J8Z6M4K2Q7V9X3N5B0C1D3E2',
  prop_literary_period: '01J8Z6M4K2Q7V9X3N5B0C1D3E3',
  prop_awards: '01J8Z6M4K2Q7V9X3N5B0C1D3E4',
  prop_prompt: '01J8Z6M4K2Q7V9X3N5B0C1D2A5',
  prop_model: '01J8Z6M4K2Q7V9X3N5B0C1D3F1',
  prop_seed: '01J8Z6M4K2Q7V9X3N5B0C1D3F2',
  prop_source_image: '01J8Z6M4K2Q7V9X3N5B0C1D3F3',
  prop_role: '01J8Z6M4K2Q7V9X3N5B0C1D3C3', // ADR-0006 §3.3 (target_facet)
  prop_first_appearance: '01J8Z6M4K2Q7V9X3N5B0C1D3D6',
  prop_appears_in_work: '01J8Z6M4K2Q7V9X3N5B0C1D3D7',

  // ── типы значений (M1, устаревший механизм) ───────────────────────
  ptype_text: '01J8Z6M4K2Q7V9X3N5B0C1D2C1',
  ptype_number: '01J8Z6M4K2Q7V9X3N5B0C1D2C2',
  ptype_date: '01J8Z6M4K2Q7V9X3N5B0C1D2C3',
  ptype_datetime: '01J8Z6M4K2Q7V9X3N5B0C1D2C4',
  ptype_boolean: '01J8Z6M4K2Q7V9X3N5B0C1D2C5',
  ptype_reference: '01J8Z6M4K2Q7V9X3N5B0C1D2C6',

  // ── типы отношений (M1) ───────────────────────────────────────────
  rtype_author: '01J8Z6M4K2Q7V9X3N5B0C1D3B1', // ADR-0006 §3.2
  rtype_portrays: '01J8Z6M4K2Q7V9X3N5B0C1D3C1', // ADR-0006 §3.3
  rtype_member_of: '01J8Z6M4K2Q7V9X3N5B0C1D3D2',
  rtype_appears_in: '01J8Z6M4K2Q7V9X3N5B0C1D3D3',
  rtype_derived_from: '01J8Z6M4K2Q7V9X3N5B0C1D3D4',
  rtype_supersedes: '01J8Z6M4K2Q7V9X3N5B0C1D4F2',
  rtype_merged_into: '01J8Z6M4K2Q7V9X3N5B0C1D4F3',

  // ── экземпляры отношений (M1, системный тип) ──────────────────────
  rel_authorship: '01J8Z6M4K2Q7V9X3N5B0C1D3B2', // ADR-0006 §3.2

  // ── классификация (M1) ────────────────────────────────────────────
  tax_works: '01J8Z6M4K2Q7V9X3N5B0C1D2E1',
  tax_people: '01J8Z6M4K2Q7V9X3N5B0C1D3A1', // ADR-0006 §3.1
  tax_media: '01J8Z6M4K2Q7V9X3N5B0C1D3G1',
  facet_genre: '01J8Z6M4K2Q7V9X3N5B0C1D3A2', // ADR-0007 §3.1 (в ADR было 01J8…3E1 — коллизия с аспектом)
  facet_tone: '01J8Z6M4K2Q7V9X3N5B0C1D2E2',
  facet_profession: '01J8Z6M4K2Q7V9X3N5B0C1D3A3', // ADR-0006 §3.1 (в ADR это была категория «Писатель»)
  facet_org_type: '01J8Z6M4K2Q7V9X3N5B0C1D3D5',
  facet_creation_method: '01J8Z6M4K2Q7V9X3N5B0C1D3G2',
  facet_char_role: '01J8Z6M4K2Q7V9X3N5B0C1D3G3',
  cat_fiction: '01J8Z6M4K2Q7V9X3N5B0C1D2E3',
  cat_sf: '01J8Z6M4K2Q7V9X3N5B0C1D2E4',
  cat_fantasy: '01J8Z6M4K2Q7V9X3N5B0C1D2E5',
  cat_prose: '01J8Z6M4K2Q7V9X3N5B0C1D2E6',
  cat_poetry: '01J8Z6M4K2Q7V9X3N5B0C1D2E7',
  cat_dark: '01J8Z6M4K2Q7V9X3N5B0C1D2E8',
  cat_light: '01J8Z6M4K2Q7V9X3N5B0C1D2E9',
  cat_writer: '01J8Z6M4K2Q7V9X3N5B0C1D3A4',
  cat_novelist: '01J8Z6M4K2Q7V9X3N5B0C1D3A5',
  cat_prose_writer: '01J8Z6M4K2Q7V9X3N5B0C1D3A6',
  cat_poet: '01J8Z6M4K2Q7V9X3N5B0C1D3A7',
  cat_playwright: '01J8Z6M4K2Q7V9X3N5B0C1D3A8',
  cat_physician: '01J8Z6M4K2Q7V9X3N5B0C1D3A9',
  cat_photo: '01J8Z6M4K2Q7V9X3N5B0C1D3G4',
  cat_collage: '01J8Z6M4K2Q7V9X3N5B0C1D3G5',
  cat_drawing: '01J8Z6M4K2Q7V9X3N5B0C1D3G6',
  cat_ai: '01J8Z6M4K2Q7V9X3N5B0C1D3G7',
  cat_protagonist: '01J8Z6M4K2Q7V9X3N5B0C1D3G8',
  cat_supporting: '01J8Z6M4K2Q7V9X3N5B0C1D3G9',
  cat_mentioned: '01J8Z6M4K2Q7V9X3N5B0C1D3GA',
  cat_publisher_org: '01J8Z6M4K2Q7V9X3N5B0C1D3GB',
  cat_media_org: '01J8Z6M4K2Q7V9X3N5B0C1D3GC',

  // ── аспекты, представления, автоматизации (M1) ────────────────────
  aspect_literary: '01J8Z6M4K2Q7V9X3N5B0C1D3E1', // ADR-0008 §3.1, 00_overview §7.3
  aspect_ai_media: '01J8Z6M4K2Q7V9X3N5B0C1D3F4', // ADR-0011 §3.3
  view_book_card: '01J8Z6M4K2Q7V9X3N5B0C1D2A2',
  auto_create_chapter: '01J8Z6M4K2Q7V9X3N5B0C1D5A3', // 03_chapter_scenario §3.4

  // ── экземпляры предметных типов (M0) ──────────────────────────────
  otype_character: '01J8Z6M4K2Q7V9X3N5B0C1D2G6',
  book_bulgakov: '01J8Z6M4K2Q7V9X3N5B0C1D2AC', // ADR-0007 §3.3, 03_chapter_scenario §5
  chapter_prologue: '01J8Z6M4K2Q7V9X3N5B0C1D5B0', // 03_chapter_scenario §5
  chapter_7: '01J8Z6M4K2Q7V9X3N5B0C1D5B7', // 03_chapter_scenario §5
  chapter_9: '01J8Z6M4K2Q7V9X3N5B0C1D5B9',
  book_duplicate: '01J8Z6M4K2Q7V9X3N5B0C1D2G7',
  person_bulgakov: '01J8Z6M4K2Q7V9X3N5B0C1D2EF', // ADR-0002 §3
  char_bezdomy: '01J8Z6M4K2Q7V9X3N5B0C1D2G8',
  char_woland: '01J8Z6M4K2Q7V9X3N5B0C1D2G9',
  org_publisher: '01J8Z6M4K2Q7V9X3N5B0C1D2GA',
  gallery_illustrations: '01J8Z6M4K2Q7V9X3N5B0C1D2GB',

  // ── медиаобёртки и экземпляры отношений ───────────────────────────
  media_cover: '01J8Z6M4K2Q7V9X3N5B0C1D2GC',
  media_illustration: '01J8Z6M4K2Q7V9X3N5B0C1D2GD',
  media_portrait_bulgakov: '01J8Z6M4K2Q7V9X3N5B0C1D2GE',
  media_portrait_bezdomy: '01J8Z6M4K2Q7V9X3N5B0C1D2GF',
  rel_portrays_bezdomy: '01J8Z6M4K2Q7V9X3N5B0C1D3C2', // ADR-0006 §3.3
  rel_portrays_woland: '01J8Z6M4K2Q7V9X3N5B0C1D3C4',
  rel_merged_duplicate: '01J8Z6M4K2Q7V9X3N5B0C1D4F1', // ADR-0009 §3.1

  // ── классификация: дополнительные категории жанра ─────────────────
  cat_novel: '01J8Z6M4K2Q7V9X3N5B0C1D3E5',
  cat_novella: '01J8Z6M4K2Q7V9X3N5B0C1D3E6',
  cat_poem: '01J8Z6M4K2Q7V9X3N5B0C1D3E7',
  tax_dictionaries: '01J8Z6M4K2Q7V9X3N5B0C1D3E8',

  // ── виртуальные записи индекса типов (Q-55, находка F-3.21) ───────
  coretype_relation: '01J8Z6M4K2Q7V9X3N5B0C1000R',
  coretype_media_asset: '01J8Z6M4K2Q7V9X3N5B0C1000M',
  coretype_category: '01J8Z6M4K2Q7V9X3N5B0C1000C',
};

/** Каталоги хранилища примеров: kebab-case, EN (правило именования файлов документов). */
const FOLDER = {
  object_type: 'types',
  property: 'properties',
  property_type: 'property-types',
  relation_type: 'relation-types',
  relation: 'relations',
  taxonomy: 'taxonomy',
  facet: 'taxonomy',
  category: 'taxonomy',
  aspect: 'aspects',
  view: 'views',
  automation: 'automations',
  media_asset: 'media',
};

/**
 * Отображаемое имя объекта для имени файла и канонической ссылки.
 * Норма D-0063 (NAME_MAPPING §0): у определений, адресуемых по ключу
 * (Property, PropertyType, RelationType, Facet, Aspect, Automation), имя файла
 * строится по ключу; у остальных — по отображаемому названию.
 */
function displayName(obj) {
  const KEY_TYPES = ['property', 'property_type', 'relation_type', 'facet', 'aspect', 'automation'];
  if (KEY_TYPES.includes(obj.type)) return obj.title;
  return obj.title;
}

function prefixOf(obj) {
  if (M1_PREFIX[obj.type]) return M1_PREFIX[obj.type];
  if (M0_PREFIX[obj.type]) return M0_PREFIX[obj.type];
  throw new Error('Неизвестный тип объекта примера: ' + obj.type + ' (ключ ' + obj.key + ')');
}

module.exports = { ID, M1_PREFIX, M0_PREFIX, FOLDER, displayName, prefixOf };
