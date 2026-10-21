#!/usr/bin/env node
/**
 * tools/fixtures/generate.cjs
 *
 * Пересоздаёт контрольные примеры песочницы валидации (tools/fixtures/valid,
 * tools/fixtures/invalid). Примеры генерируются, а не пишутся руками, по двум причинам:
 *
 * 1. Идентификаторы ULID должны быть ровно 26 символов — руками их легко написать
 *    с ошибкой (в ADR-примерах использованы 28-символьные «ULID», см. находку F-3.14).
 * 2. Ссылки обязаны содержать стабильную часть (PREFIX-ULID): генератор собирает их
 *    из одного реестра идентификаторов, поэтому примеры не расходятся между собой.
 *
 * Правки вносятся в этот файл, затем `npm run fixtures`. Сами .md-файлы — производные.
 *
 * Это НЕ примеры для хранилища: канонические примеры заметок создаются в фазе 3b
 * в каталоге examples/. Здесь — контрольные входы схемы: минимум по одному валидному
 * примеру на каждую ветку диспетчеризации и набор невалидных на каждое условное
 * ограничение схемы.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const YAML = require('yaml');

const OUT = path.join(__dirname);
const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

// Идентификаторы фиксированы, чтобы ссылки между примерами были согласованы.
// Первый символ «01» — начало временной метки ULID; хвост дополнен до 26 символов.
const ID = {
  work: '01J8Z6M4K2Q7V9X3N5B0C1D2AA',
  chapter: '01J8Z6M4K2Q7V9X3N5B0C1D2AB',
  book: '01J8Z6M4K2Q7V9X3N5B0C1D2AC',
  person: '01J8Z6M4K2Q7V9X3N5B0C1D2AD',
  organization: '01J8Z6M4K2Q7V9X3N5B0C1D2AE',
  gallery: '01J8Z6M4K2Q7V9X3N5B0C1D2AF',
  publisher: '01J8Z6M4K2Q7V9X3N5B0C1D2B1',
  part_of: '01J8Z6M4K2Q7V9X3N5B0C1D2B2',
  order: '01J8Z6M4K2Q7V9X3N5B0C1D2B3',
  cover: '01J8Z6M4K2Q7V9X3N5B0C1D2B4',
  role: '01J8Z6M4K2Q7V9X3N5B0C1D2B5',
  text_ptype: '01J8Z6M4K2Q7V9X3N5B0C1D2C1',
  author: '01J8Z6M4K2Q7V9X3N5B0C1D2D1',
  rel: '01J8Z6M4K2Q7V9X3N5B0C1D2D2',
  taxonomy_works: '01J8Z6M4K2Q7V9X3N5B0C1D2E1',
  facet_genre: '01J8Z6M4K2Q7V9X3N5B0C1D2E2',
  cat_sf: '01J8Z6M4K2Q7V9X3N5B0C1D2E3',
  cat_prose: '01J8Z6M4K2Q7V9X3N5B0C1D2E4',
  media_cover: '01J8Z6M4K2Q7V9X3N5B0C1D2F1',
  taxonomy_media: '01J8Z6M4K2Q7V9X3N5B0C1D2F2',
  facet_creation: '01J8Z6M4K2Q7V9X3N5B0C1D2F3',
  cat_ai: '01J8Z6M4K2Q7V9X3N5B0C1D2F4',
  view_book_card: '01J8Z6M4K2Q7V9X3N5B0C1D2A2',
  auto_chapter: '01J8Z6M4K2Q7V9X3N5B0C1D2A3',
  aspect_ai: '01J8Z6M4K2Q7V9X3N5B0C1D2A4',
  prompt: '01J8Z6M4K2Q7V9X3N5B0C1D2A5',
  book_instance: '01J8Z6M4K2Q7V9X3N5B0C1D2A6',
  chapter_instance: '01J8Z6M4K2Q7V9X3N5B0C1D2A7',
  idea_instance: '01J8Z6M4K2Q7V9X3N5B0C1D2A8',
};

const PREFIX = {
  work: 'OTYPE',
  chapter: 'OTYPE',
  book: 'OTYPE',
  person: 'OTYPE',
  organization: 'OTYPE',
  gallery: 'OTYPE',
  publisher: 'PROP',
  part_of: 'PROP',
  order: 'PROP',
  cover: 'PROP',
  role: 'PROP',
  text_ptype: 'PTYPE',
  author: 'RTYPE',
  rel: 'REL',
  taxonomy_works: 'TAX',
  facet_genre: 'FACET',
  cat_sf: 'CAT',
  cat_prose: 'CAT',
  media_cover: 'MEDIA',
  taxonomy_media: 'TAX',
  facet_creation: 'FACET',
  cat_ai: 'CAT',
  view_book_card: 'VIEW',
  auto_chapter: 'AUTO',
  aspect_ai: 'ASPECT',
  prompt: 'PROP',
  book_instance: 'BOOK',
  chapter_instance: 'CHAP',
  idea_instance: 'IDEA',
};

const TITLE = {
  work: 'Произведение',
  chapter: 'Глава',
  book: 'Книга',
  person: 'Человек',
  organization: 'Организация',
  gallery: 'Галерея',
  publisher: 'publisher',
  part_of: 'part_of',
  order: 'order',
  cover: 'cover',
  role: 'role',
  text_ptype: 'Текст',
  author: 'Автор',
  rel: 'Авторство «Мастера и Маргариты»',
  taxonomy_works: 'Произведения',
  facet_genre: 'Жанр',
  cat_sf: 'Научная фантастика',
  cat_prose: 'Прозаик',
  media_cover: 'Обложка «Мастера и Маргариты»',
  taxonomy_media: 'Медиа',
  facet_creation: 'Метод создания',
  cat_ai: 'Генерация ИИ',
  view_book_card: 'Карточка книги',
  auto_chapter: 'Создать главу',
  aspect_ai: 'Генерация ИИ',
  prompt: 'prompt',
  book_instance: 'Мастер и Маргарита',
  chapter_instance: 'Глава 7',
  idea_instance: 'Идея каталога',
};

/**
 * Активная версия схемы — та, у точки входа которой нет `x-superseded-by`
 * (то же правило, что в tools/schema-lint.cjs и tools/validate.cjs).
 */
function activeSchemaVersion() {
  const schemaDir = path.join(OUT, '..', '..', 'schema');
  const roots = fs
    .readdirSync(schemaDir)
    .filter((f) => /^metamodel-\d+\.\d+\.\d+\.schema\.json$/.test(f))
    .map((f) => ({ file: f, doc: JSON.parse(fs.readFileSync(path.join(schemaDir, f), 'utf8')) }))
    .filter((r) => !r.doc['x-superseded-by']);
  if (roots.length !== 1) {
    throw new Error('Ожидалась ровно одна точка входа схемы без x-superseded-by');
  }
  return roots[0].file.match(/^metamodel-(\d+\.\d+\.\d+)\.schema\.json$/)[1];
}

/** Проверка, что идентификаторы соответствуют формату ULID (26 символов, Crockford). */
function assertIds() {
  for (const [name, id] of Object.entries(ID)) {
    if (!/^[0-9A-HJKMNP-TV-Z]{26}$/.test(id)) {
      throw new Error('Идентификатор ' + name + ' не ULID: ' + id + ' (длина ' + id.length + ')');
    }
  }
  if (process.env.GENERATE_ULID) {
    const now = Date.now();
    console.log('[info] шаблон нового ULID: ' + timePart(now) + 'XXXXXXXXXXXXXXXXXX');
  }
}

function timePart(ms) {
  let out = '';
  for (let i = 0; i < 10; i += 1) {
    out = CROCKFORD[ms % 32] + out;
    ms = Math.floor(ms / 32);
  }
  return out;
}

function link(key, alias) {
  return '[[' + TITLE[key] + ' (' + PREFIX[key] + '-' + ID[key] + ')|' + (alias || TITLE[key]) + ']]';
}

const CREATED = '2026-10-21T10:00:00Z';
const UPDATED = '2026-10-21T12:30:00Z';

function contract(key, extra) {
  return Object.assign(
    {
      id: ID[key],
      type: null,
      title: TITLE[key],
      created_at: CREATED,
      updated_at: UPDATED,
      status: 'active',
    },
    extra
  );
}

/** Валидные примеры: минимум один на каждую ветку диспетчеризации корневой схемы. */
const VALID = [
  {
    name: '01_object_type_abstract',
    heading: 'ObjectType: абстрактный тип (Work)',
    note: 'Проверяет ветку naming.r7 для is_abstract: true — type_prefix обязан быть null.',
    fm: contract('work', {
      type: 'object_type',
      type_id: 'work',
      label: 'Произведение',
      type_prefix: null,
      is_abstract: true,
      layer: 'domain',
      properties: [],
      description: 'Абстрактный тип: самостоятельное произведение. Экземпляры не создаются.',
      lifecycle: 'standard',
      aliases: ['Работа'],
      tags: ['metamodel/core'],
    }),
  },
  {
    name: '02_object_type_sequence',
    heading: 'ObjectType: конкретный тип-последовательность (Chapter)',
    note: 'Проверяет пару sequential_parent + sequence_key (sequence.r1), sequence_step > 0 (sequence.r6) и property_overrides с ужесточением.',
    fm: contract('chapter', {
      type: 'object_type',
      type_id: 'chapter',
      label: 'Глава',
      type_prefix: 'CHAP',
      is_abstract: false,
      layer: 'domain',
      parent_type: link('work'),
      properties: [link('part_of', 'Часть произведения'), link('order', 'Порядковый номер')],
      property_overrides: [{ property: link('order'), required: true, cardinality: '1' }],
      sequential_parent: link('part_of'),
      sequence_key: link('order'),
      sequence_step: 10,
      sequence_direction: 'ascending',
      title_template: 'Глава {order}',
      lifecycle: 'standard',
    }),
  },
  {
    name: '03_property_reference',
    heading: 'Property: ссылочное свойство (publisher)',
    note: 'Проверяет условное ограничение meta.r2: при value_type: reference поле target_types обязательно.',
    fm: contract('publisher', {
      type: 'property',
      label: 'Издательство',
      value_type: 'reference',
      target_types: [link('organization')],
      cardinality: '0..1',
      required: false,
      scope: 'universal',
      definition: 'Организация, выпустившая издание.',
      lifecycle: 'standard',
    }),
  },
  {
    name: '04_property_number_unique_within',
    heading: 'Property: числовое свойство с областью уникальности (order)',
    note: 'Первое межобъектное ограничение модели (ADR-0010 §3.2): unique_within задаёт область действия уникальности.',
    fm: contract('order', {
      type: 'property',
      label: 'Порядковый номер',
      value_type: 'number',
      cardinality: '1',
      required: true,
      scope: 'specific',
      unique_within: link('part_of'),
      definition: 'Номер главы в пределах произведения.',
    }),
  },
  {
    name: '05_property_type_legacy',
    heading: 'PropertyType: устаревший механизм',
    note: 'Ветвь property_type оставлена в схеме, чтобы префикс PTYPE не переиспользовался (TYPE_PREFIX_REGISTRY §1 R8).',
    fm: contract('text_ptype', {
      type: 'property_type',
      title: 'text',
      label: 'Текст',
      lifecycle: 'deprecated',
      description: 'Заменён закрытым перечислением value_type на уровне ядра.',
    }),
  },
  {
    name: '06_relation_type',
    heading: 'RelationType: автор',
    note: 'subject_types ссылается на абстрактный тип в значении «любой наследник» (ADR-0005).',
    fm: contract('author', {
      type: 'relation_type',
      title: 'author',
      label: 'Автор',
      forward_label: 'автор',
      inverse_label: 'произведение автора',
      direction: 'directed',
      subject_types: [link('work')],
      object_types: [link('person')],
      cardinality: '0..n',
      uniqueness_rule: 'unique_triple',
      is_restriction: false,
    }),
  },
  {
    name: '07_relation_instance',
    heading: 'Relation: экземпляр связи с атрибутами',
    note: 'Связь повышена до объекта по правилу X-03: появились атрибуты order, is_primary, valid_from, valid_to.',
    fm: contract('rel', {
      type: 'relation',
      title: 'Авторство «Мастера и Маргариты»',
      subject: link('book_instance'),
      relation_type: link('author'),
      object: link('person', 'Михаил Булгаков'),
      order: 1,
      is_primary: true,
      valid_from: '1928-01-01',
      valid_to: '1940-03-18',
      source_ref: 'Письмо издателю',
    }),
  },
  {
    name: '08_taxonomy',
    heading: 'Taxonomy: область классификации',
    note: 'applicable_types обязателен и непуст (meta.r5). Значения hierarchy_mode и root_requirement — значения по умолчанию для фасетов (ADR-0005 §3.1 п.6).',
    fm: contract('taxonomy_works', {
      type: 'taxonomy',
      label: 'Произведения',
      applicable_types: [link('book'), link('chapter')],
      hierarchy_mode: 'strict',
      assignment_cardinality: '0..n',
      root_requirement: 'multiple',
    }),
  },
  {
    name: '09_facet',
    heading: 'Facet: ось классификации',
    note: 'key обязателен, соответствует ^(?!cat_)[a-z][a-z0-9_]{1,30}$ (naming.r8) и образует имя поля cat_genre.',
    fm: contract('facet_genre', {
      type: 'facet',
      title: 'genre',
      label: 'Жанр',
      key: 'genre',
      taxonomy: link('taxonomy_works'),
      hierarchy_mode: 'strict',
      assignment_cardinality: '0..n',
      root_requirement: 'multiple',
    }),
  },
  {
    name: '10_category_root',
    heading: 'Category: корневая категория',
    note: 'Корень определяется пустым parent. Пустой список допущен как способ записи (находка F-3.11).',
    fm: contract('cat_prose', {
      type: 'category',
      title: 'Прозаик',
      label: 'Прозаик',
      facet: link('facet_genre'),
      parent: [],
    }),
  },
  {
    name: '11_category_child',
    heading: 'Category: дочерняя категория',
    note: 'Ссылка только вверх: category → facet → taxonomy (ADR-0005 §3.1).',
    fm: contract('cat_sf', {
      type: 'category',
      label: 'Научная фантастика',
      facet: link('facet_genre'),
      parent: link('cat_prose'),
    }),
  },
  {
    name: '12_media_asset',
    heading: 'MediaAsset: обёртка изображения',
    note: 'file обязателен (media.r1), media_kind и roles — из закрытых перечислений (media.r2), назначение метода создания — в поле cat_creation_method.',
    fm: contract('media_cover', {
      type: 'media_asset',
      label: 'Обложка «Мастера и Маргариты»',
      file: 'attachments/Обложка Мастера и Маргариты (MEDIA-' + ID.media_cover + ').jpg',
      media_kind: 'image',
      roles: ['cover', 'preview'],
      galleries: [link('gallery')],
      cat_creation_method: [link('cat_ai')],
      author: link('person', 'Михаил Булгаков'),
      license: 'CC BY 4.0',
      description: 'Обложка издания 1973 года.',
    }),
  },
  {
    name: '13_view',
    heading: 'View: представление',
    note: 'target_types непуст (view.r1), mechanism — абстрактный идентификатор без названий инструментов (D-0057).',
    fm: contract('view_book_card', {
      type: 'view',
      label: 'Карточка книги',
      target_types: [link('book')],
      mechanism: 'card',
      definition: 'filters:\n  status: active\ncolumns: [title, cover, author]',
      is_active: true,
    }),
  },
  {
    name: '14_automation',
    heading: 'Automation: форма создания главы',
    note: 'form_fields смешивает ссылки на Property и sys-поля (meta.r15); defaults поддерживает плейсхолдер {next_sequence}.',
    fm: contract('auto_chapter', {
      type: 'automation',
      title: 'create_chapter',
      label: 'Создать главу',
      trigger: 'manual',
      mechanism: 'custom',
      target_types: [link('chapter')],
      form_fields: [link('part_of'), link('order'), 'sys:title'],
      defaults: { order: '{next_sequence}', status: 'draft' },
      require_confirmation: true,
      is_active: true,
    }),
  },
  {
    name: '15_aspect',
    heading: 'Aspect: свойства, активируемые категорией',
    note: 'trigger_categories и properties непустые (aspect.r3, aspect.r4 — часть про непустоту).',
    fm: contract('aspect_ai', {
      type: 'aspect',
      title: 'ai_generated_media',
      label: 'Генерация ИИ',
      layer: 'system',
      trigger_categories: [link('cat_ai')],
      properties: [link('prompt', 'Промпт')],
      property_overrides: [{ property: link('prompt'), required: true }],
      is_active: true,
      description: 'Свойства метода создания изображения, применимые при категории «Генерация ИИ» и её потомках.',
    }),
  },
  {
    name: '16_m0_book',
    heading: 'M0: экземпляр предметного типа (book)',
    note: 'Конверт экземпляра: системный контракт + поля cat_* + свойства типа. Состав свойств проверяется производной схемой, а не этим конвертом.',
    fm: contract('book_instance', {
      type: 'book',
      title: 'Мастер и Маргарита',
      aliases: ['Мастеръ и Маргарита'],
      tags: ['fiction'],
      cat_genre: [link('cat_prose')],
      cover: link('media_cover'),
      publication_date: '1967-01-01',
      pages: 480,
    }),
  },
  {
    name: '17_m0_chapter',
    heading: 'M0: экземпляр типа-последовательности (chapter)',
    note: 'Значение sequence_key (order) присутствует: sequence.r4 проверяется валидатором, но форма корректна.',
    fm: contract('chapter_instance', {
      type: 'chapter',
      title: 'Глава 7',
      part_of: link('book_instance'),
      order: 70,
      chapter_label: '',
      status: 'draft',
    }),
  },
  {
    name: '18_m0_custom_type',
    heading: 'M0: тип, добавленный пользователем как данные (idea)',
    note: 'Набор значений type открыт: остальные 27 предметных типов добавляются как данные M1 без ADR и релиза (ADR-0005 §3.3), поэтому ветка M0 принимает неизвестный type.',
    fm: contract('idea_instance', {
      type: 'idea',
      title: 'Идея каталога',
      status: 'capture',
      tags: ['inbox'],
    }),
  },
];

/** Невалидные примеры: каждое условное ограничение схемы и каждое обязательное поле. */
const INVALID = [
  {
    name: 'n01_bad_ulid',
    heading: 'id не соответствует формату ULID',
    note: 'contract.r2: 26 символов, алфавит Crockford Base32. Здесь 28 символов. Уточнение: в примерах ADR полных 28-символьных идентификаторов нет — там использованы укороченные записи вида (OTYPE-01J8Z6…), которые нарушают каноническую форму ссылки (link.r4), а не формат id. См. находку F-3.14 в редакции фазы 3b.',
    errors: ['/id'],
    fm: contract('book_instance', { type: 'book', id: '01J8Z6M4K2Q7V9X3N5B0C1D2EF00' }),
  },
  {
    name: 'n02_missing_title',
    heading: 'Нет title',
    note: 'contract.r6: title присутствует и не пуст после trim.',
    errors: ['title'],
    fm: (() => {
      const fm = contract('idea_instance', { type: 'idea' });
      delete fm.title;
      return fm;
    })(),
  },
  {
    name: 'n03_unknown_status',
    heading: 'Неизвестный статус',
    note: 'contract.r8: status входит в закрытое перечисление из 6 значений.',
    errors: ['/status'],
    fm: contract('idea_instance', { type: 'idea', status: 'published' }),
  },
  {
    name: 'n04_abstract_with_prefix',
    heading: 'Абстрактный тип с префиксом',
    note: 'naming.r7: у абстрактного типа type_prefix обязан быть null.',
    errors: ['type_prefix'],
    fm: contract('work', {
      type: 'object_type',
      type_id: 'work',
      label: 'Произведение',
      type_prefix: 'WORK',
      is_abstract: true,
      layer: 'domain',
      properties: [],
    }),
  },
  {
    name: 'n05_concrete_bad_prefix',
    heading: 'Конкретный тип с префиксом вне формата',
    note: 'naming.r4 и naming.r5: только ASCII A-Z и 0-9, длина 3–12. Дефис запрещён (R4 реестра).',
    errors: ['type_prefix'],
    fm: contract('book', {
      type: 'object_type',
      type_id: 'book',
      label: 'Книга',
      type_prefix: 'BOOK-1',
      is_abstract: false,
      layer: 'domain',
      properties: [],
    }),
  },
  {
    name: 'n06_sequence_unpaired',
    heading: 'Последовательность объявлена частично',
    note: 'sequence.r1: sequential_parent и sequence_key задаются только парой. Выражено через dependentRequired.',
    errors: ['sequential_parent'],
    fm: contract('chapter', {
      type: 'object_type',
      label: 'Глава',
      type_prefix: 'CHAP',
      is_abstract: false,
      layer: 'domain',
      properties: [link('part_of')],
      sequential_parent: link('part_of'),
      sequence_step: 10,
    }),
  },
  {
    name: 'n07_property_reference_without_target',
    heading: 'Ссылочное свойство без target_types',
    note: 'meta.r2: при value_type: reference поле target_types обязательно. Пустой список означает «любой тип», отсутствие поля — нарушение.',
    errors: ['target_types'],
    fm: contract('cover', {
      type: 'property',
      label: 'Обложка',
      value_type: 'reference',
      cardinality: '0..1',
      required: false,
      scope: 'specific',
    }),
  },
  {
    name: 'n08_property_target_facet_misuse',
    heading: 'target_facet при value_type: text',
    note: 'meta.r3: target_facet задан только при target_types: [category]. Здесь value_type: text — поле недопустимо.',
    errors: ['target_facet'],
    fm: contract('role', {
      type: 'property',
      label: 'Роль',
      value_type: 'text',
      cardinality: '0..1',
      required: false,
      scope: 'specific',
      target_facet: link('facet_genre'),
    }),
  },
  {
    name: 'n09_taxonomy_empty_applicable_types',
    heading: 'Таксономия без применимых типов',
    note: 'meta.r5 (часть про непустоту): applicable_types не пуст.',
    errors: ['applicable_types'],
    fm: contract('taxonomy_works', { type: 'taxonomy', label: 'Произведения', applicable_types: [] }),
  },
  {
    name: 'n10_media_bad_kind',
    heading: 'Недопустимый media_kind',
    note: 'media.r2: media_kind и каждое значение roles входят в закрытые перечисления.',
    errors: ['media_kind'],
    fm: contract('media_cover', {
      type: 'media_asset',
      file: 'attachments/cover.jpg',
      media_kind: 'hologram',
      roles: ['cover'],
    }),
  },
  {
    name: 'n11_m0_type_collides_with_m1',
    heading: 'Экземпляр M0 с типом системного уровня',
    note: 'contract.r4: значение type экземпляра M0 не может совпадать с идентификатором системного типа M1 — у тех свои ветки диспетчеризации.',
    errors: ['/type'],
    fm: contract('idea_instance', { type: 'object_type' }),
  },
  {
    name: 'n13_relation_type_title_not_key',
    heading: 'RelationType: title записан отображаемым названием',
    note: 'Норма D-0063 (Q-51 = A): title является ключом для определений, адресуемых по ключу. Отображаемое название хранится в label.',
    errors: ['/title'],
    fm: contract('author', {
      type: 'relation_type',
      title: 'Автор произведения',
      label: 'Автор',
      direction: 'directed',
      cardinality: '0..n',
      uniqueness_rule: 'unique_triple',
    }),
  },
  {
    name: 'n14_facet_title_not_key',
    heading: 'Facet: title записан подписью вместо ключа',
    note: 'Норма D-0063: title фасета — ключ EN snake_case. Отдельное поле key обязательно, потому что образует имя поля назначений cat_<key> (ADR-0007).',
    errors: ['/title'],
    fm: contract('facet_genre', {
      type: 'facet',
      title: 'Жанр',
      label: 'Жанр',
      key: 'genre',
      taxonomy: link('taxonomy_works'),
    }),
  },
  {
    name: 'n15_aspect_bad_layer',
    heading: 'Aspect: layer вне закрытого перечисления',
    note: 'Поле layer объявлено во фрагменте aspect с выпуска 0.14.0 (находка F-3.20): до этого пример ADR-0008 §3.1 с layer: system отклонялся схемой как неизвестное поле. Значение ограничено перечислением layer (system, domain).',
    errors: ['/layer'],
    fm: contract('aspect_ai', {
      type: 'aspect',
      title: 'ai_generated_media',
      label: 'Генерация ИИ',
      layer: 'core',
      trigger_categories: [link('cat_ai')],
      properties: [link('prompt', 'Промпт')],
      is_active: true,
    }),
  },
  {
    name: 'n16_object_type_without_type_id',
    heading: 'ObjectType без type_id',
    note: 'ADR-0012 / naming.r12: type_id обязателен — индекс типов строится по полю определения, а не по соответствию префиксов.',
    errors: ['type_id'],
    fm: contract('book', {
      type: 'object_type',
      label: 'Книга',
      type_prefix: 'BOOK',
      is_abstract: false,
      layer: 'domain',
      properties: [],
    }),
  },
  {
    name: 'n12_facet_reserved_key',
    heading: 'Ключ фасета в зарезервированном пространстве имён',
    note: 'naming.r8: key фасета не начинается с cat_ — префикс зарезервирован за именами полей назначений (ADR-0007).',
    errors: ['/key'],
    fm: contract('facet_genre', {
      type: 'facet',
      label: 'Жанр',
      key: 'cat_genre',
      taxonomy: link('taxonomy_works'),
    }),
  },
];

function writeFixture(dir, fx) {
  const fmText = YAML.stringify(fx.fm, { lineWidth: 0 }).trimEnd();
  const expect = fx.expectation
    ? 'expect: invalid, errors: ' + fx.errors.join(', ')
    : 'expect: valid';
  const body = [
    '# ' + fx.heading,
    '',
    expect,
    '',
    fx.note ? '> ' + fx.note : '',
    fx.note ? '' : null,
    'Контрольный пример сгенерирован `tools/fixtures/generate.cjs`. Вручную не правится.',
    'Ожидаемое поведение схемы версии ' + activeSchemaVersion() + ' описано в строке `expect:` выше.',
    '',
  ]
    .filter((l) => l !== null)
    .join('\n');
  const file = path.join(dir, fx.name + '.md');
  fs.writeFileSync(file, '---\n' + fmText + '\n---\n\n' + body, 'utf8');
  return file;
}

function main() {
  assertIds();
  const validDir = path.join(OUT, 'valid');
  const invalidDir = path.join(OUT, 'invalid');
  for (const dir of [validDir, invalidDir]) {
    fs.mkdirSync(dir, { recursive: true });
    for (const f of fs.readdirSync(dir)) {
      if (f.endsWith('.md')) fs.unlinkSync(path.join(dir, f));
    }
  }
  const written = [];
  for (const fx of VALID) written.push(writeFixture(validDir, { ...fx, expectation: null }));
  for (const fx of INVALID) written.push(writeFixture(invalidDir, { ...fx, expectation: 'invalid' }));
  console.log(
    '[ok] контрольных примеров: ' + written.length + ' (валидных ' + VALID.length +
    ', невалидных ' + INVALID.length + ') в tools/fixtures/'
  );
  const branches = new Set(VALID.map((f) => f.fm.type));
  console.log('[info] покрытые значения type: ' + [...branches].sort().join(', '));
}

main();
