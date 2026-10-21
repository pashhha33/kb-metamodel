#!/usr/bin/env node
/**
 * tools/examples/data-properties-1.cjs
 *
 * Часть реестра канонического хранилища примеров: свойства (M1), первая половина —
 * структура произведения, медиа, издания, человек. Нормативные источники:
 * docs/metamodel/00_overview.md §6, §7.5; ADR-0003 §3.2; ADR-0010 §3.2; ADR-0011 §3.1, §3.2.
 *
 * Про `target_types` у свойств, цель которых — медиаобёртка: `MediaAsset` является системным
 * типом M1, определения `ObjectType` с `type: media_asset` в хранилище нет (форма обёртки задана
 * ядром). Поэтому `target_types` оставлен пустым («любой тип»), а ограничение обеспечивают
 * `expected_media_roles` и валидатор (media.r5). Расхождение зафиксировано как находка F-3.21.
 */
'use strict';

const PROPERTIES_1 = [
  {
    key: 'prop_part_of',
    title: 'part_of',
    label: 'Часть целого',
    value_type: 'reference',
    target_types: ['otype_work', 'otype_activity'],
    cardinality: '0..1',
    required: false,
    scope: 'family',
    applies_to: ['otype_work', 'otype_activity'],
    definition:
      'Родительский объект, частью которого является данный объект: глава — часть книги, задача — часть проекта. ' +
      'Свойство семейства: наследуется конкретными типами ветвей Work и Activity. Служит областью действия ' +
      'уникальности для свойства order (ADR-0010 §3.2).',
    shows: [
      'ссылка на абстрактный тип означает «любой наследник» (ADR-0005)',
      'свойство со `scope: family` не перечисляется в `properties` конкретных типов',
      'на это свойство ссылается `unique_within` свойства order — первое межобъектное ограничение модели',
    ],
  },
  {
    key: 'prop_order',
    title: 'order',
    label: 'Порядковый номер',
    value_type: 'number',
    cardinality: '0..1',
    required: false,
    scope: 'family',
    applies_to: ['otype_work', 'otype_activity'],
    unique_within: 'prop_part_of',
    definition:
      'Порядковый номер объекта внутри родителя. Пара (значение part_of, значение order) уникальна в хранилище ' +
      '(unique.r1). Тип Глава ужесточает свойство до обязательного с кардинальностью 1 — допустимое ' +
      'переопределение (ADR-0003 §3.5).',
    shows: [
      '`unique_within` — область действия уникальности (ADR-0010 §3.2, закрывает пробел G-2)',
      'значение по умолчанию кардинальности шире, чем ужесточение в типе-наследнике',
      'свойство является ключом порядка последовательности (`sequence_key`)',
    ],
  },
  {
    key: 'prop_chapter_label',
    title: 'chapter_label',
    label: 'Обозначение главы',
    value_type: 'text',
    cardinality: '0..1',
    required: false,
    scope: 'specific',
    definition:
      'Отображаемое обозначение главы: «Пролог», «Глава седьмая». Непустое значение имеет приоритет перед ' +
      'шаблоном заголовка (ADR-0010 §2.1).',
  },
  {
    key: 'prop_cover',
    title: 'cover',
    label: 'Обложка',
    value_type: 'reference',
    target_types: [],
    cardinality: '0..1',
    required: false,
    scope: 'specific',
    expected_media_roles: ['cover'],
    definition:
      'Медиаобёртка обложки. Значение — ссылка на объект media_asset, а не путь к файлу: у связи файла с объектом ' +
      'есть атрибуты (роли, источник, автор, лицензия, метод создания), поэтому связь реифицирована (ADR-0011 §3.1). ' +
      'Тип цели не ограничивается списком target_types: media_asset — системный тип без определения ObjectType; ' +
      'кандидаты отбираются по ролям (см. находку F-3.21).',
    shows: [
      '`expected_media_roles` — фильтр кандидатов: предлагаются обёртки, у которых роль совпадает (ADR-0011 §3.1)',
      'пустой `target_types` означает «любой тип» при обязательном присутствии поля (meta.r2)',
      'значение свойства — единственное место, где хранится связь объекта с обёрткой (Q-37 = C)',
    ],
  },
  {
    key: 'prop_illustrations',
    title: 'illustrations',
    label: 'Иллюстрации',
    value_type: 'reference',
    target_types: [],
    cardinality: '0..n',
    required: false,
    scope: 'specific',
    definition:
      'Медиаобёртки иллюстраций произведения. Фильтр ролей не задан: в подборку может попасть обёртка с любой ролью.',
    shows: ['кардинальность `0..n`: множественность выражается кардинальностью, а не отдельным типом значения (C-22)'],
  },
  {
    key: 'prop_portrait',
    title: 'portrait',
    label: 'Портрет',
    value_type: 'reference',
    target_types: [],
    cardinality: '0..1',
    required: false,
    scope: 'specific',
    expected_media_roles: ['portrait', 'avatar'],
    definition: 'Медиаобёртка портрета человека или персонажа.',
  },
  {
    key: 'prop_logo',
    title: 'logo',
    label: 'Логотип',
    value_type: 'reference',
    target_types: [],
    cardinality: '0..1',
    required: false,
    scope: 'specific',
    expected_media_roles: ['logo'],
    definition: 'Медиаобёртка логотипа организации.',
  },
  {
    key: 'prop_publisher',
    title: 'publisher',
    label: 'Издательство',
    value_type: 'reference',
    target_types: ['otype_organization'],
    cardinality: '0..1',
    required: false,
    scope: 'universal',
    definition: 'Организация, выпустившая издание. Универсальное свойство: применяется ко всем типам автоматически.',
    shows: [
      'пример ADR-0003 §3.2: `target_types` обязателен при `value_type: reference` (meta.r2)',
      'универсальное свойство не перечисляется в `ObjectType.properties` и не может быть ослаблено в типе (property.r7)',
    ],
  },
  {
    key: 'prop_isbn',
    title: 'isbn',
    label: 'ISBN',
    value_type: 'text',
    cardinality: '0..1',
    required: false,
    scope: 'universal',
    definition: 'Международный стандартный номер книги (ADR-0003 §3.1).',
  },
  {
    key: 'prop_page_count',
    title: 'page_count',
    label: 'Количество страниц',
    value_type: 'number',
    cardinality: '0..1',
    required: false,
    scope: 'universal',
    definition: 'Объём издания в страницах (ADR-0003 §3.1).',
  },
  {
    key: 'prop_publication_date',
    title: 'publication_date',
    label: 'Дата публикации',
    value_type: 'date',
    cardinality: '0..1',
    required: false,
    scope: 'universal',
    definition:
      'Дата первой публикации. Формат YYYY-MM-DD совпадает с нативным типом свойства Date, поэтому поле получает ' +
      'штатный выбор даты (00_overview §9).',
  },
  {
    key: 'prop_language',
    title: 'language',
    label: 'Язык',
    value_type: 'text',
    cardinality: '0..1',
    required: false,
    scope: 'universal',
    definition: 'Язык произведения или издания. В MVP — текст; переход на категорию фасета аддитивен.',
  },
  {
    key: 'prop_birth_date',
    title: 'birth_date',
    label: 'Дата рождения',
    value_type: 'date',
    cardinality: '0..1',
    required: false,
    scope: 'family',
    applies_to: ['otype_context'],
    definition: 'Дата рождения. Свойство семейства Context: применимо к типам Человек и Персонаж.',
  },
  {
    key: 'prop_death_date',
    title: 'death_date',
    label: 'Дата смерти',
    value_type: 'date',
    cardinality: '0..1',
    required: false,
    scope: 'family',
    applies_to: ['otype_context'],
    definition: 'Дата смерти. Свойство семейства Context; отсутствие означает, что дата неизвестна или неприменима.',
  },
];

module.exports = { PROPERTIES_1 };
