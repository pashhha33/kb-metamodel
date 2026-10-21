#!/usr/bin/env node
/**
 * tools/examples/data-properties-2.cjs
 *
 * Часть реестра канонического хранилища примеров: свойства аспектов (ADR-0008 §3.2, ADR-0011 §3.3),
 * свойство-словарь роли персонажа (ADR-0006 §3.3) и объекты устаревшего типа PropertyType.
 */
'use strict';

/** Свойства, активируемые аспектом literary_person (ADR-0008 §3.1). */
const PROPERTIES_2 = [
  {
    key: 'prop_pen_name',
    title: 'pen_name',
    label: 'Псевдоним',
    value_type: 'text',
    cardinality: '0..1',
    required: false,
    scope: 'specific',
    definition:
      'Имя, под которым человек публиковался. Свойство активируется аспектом literary_person при назначении ' +
      'категории «Писатель», «Поэт», «Драматург» или любого их потомка (ADR-0008 §3.2).',
    shows: [
      'значение хранится в плоском frontmatter самого объекта: отдельный объект-«профиль» не создаётся',
      'аспект ужесточает свойство до обязательного через `property_overrides` — допустимое ужесточение',
    ],
  },
  {
    key: 'prop_literary_period',
    title: 'literary_period',
    label: 'Литературный период',
    value_type: 'text',
    cardinality: '0..1',
    required: false,
    scope: 'specific',
    definition: 'Период литературной деятельности: годы активной публикации произведений.',
  },
  {
    key: 'prop_awards',
    title: 'awards',
    label: 'Премии',
    value_type: 'text',
    cardinality: '0..n',
    required: false,
    scope: 'specific',
    definition: 'Премии и награды. В MVP — список строк; переход на тип Event аддитивен.',
  },
  {
    key: 'prop_prompt',
    title: 'prompt',
    label: 'Промпт',
    value_type: 'text',
    cardinality: '0..1',
    required: false,
    scope: 'specific',
    definition:
      'Текст запроса, по которому создано изображение. Свойство активируется аспектом ai_generated_media ' +
      'при назначении категории «Генерация ИИ» или её потомка (ADR-0011 §3.3, требование T9).',
  },
  {
    key: 'prop_model',
    title: 'model',
    label: 'Модель',
    value_type: 'text',
    cardinality: '0..1',
    required: false,
    scope: 'specific',
    definition: 'Название и версия модели, создавшей изображение.',
  },
  {
    key: 'prop_seed',
    title: 'seed',
    label: 'Seed',
    value_type: 'number',
    cardinality: '0..1',
    required: false,
    scope: 'specific',
    definition: 'Значение инициализации генератора: позволяет воспроизвести результат.',
  },
  {
    key: 'prop_source_image',
    title: 'source_image',
    label: 'Исходное изображение',
    value_type: 'reference',
    target_types: ['media_asset'],
    cardinality: '0..1',
    required: false,
    scope: 'specific',
    definition:
      'Медиаобёртка изображения, послужившего основой. Фильтр ролей не задан: исходником может быть обёртка ' +
      'с любой ролью. Тип цели — системный `media_asset`, запись голая строкой (D-0067).',
  },
  {
    key: 'prop_first_appearance',
    title: 'first_appearance',
    label: 'Первое появление',
    value_type: 'reference',
    target_types: ['otype_work'],
    cardinality: '0..1',
    required: false,
    scope: 'specific',
    unique_within: 'prop_appears_in_work',
    definition:
      'Произведение, в котором персонаж появился впервые. Область уникальности — произведение: ' +
      'пара (персонаж, произведение) не может повторяться (unique.r1).',
    shows: ['второй случай `unique_within` после пары (order, part_of): механизм общий, а не специфичный для глав'],
  },
  {
    key: 'prop_appears_in_work',
    title: 'appears_in_work',
    label: 'Произведение с участием',
    value_type: 'reference',
    target_types: ['otype_work'],
    cardinality: '0..n',
    required: false,
    scope: 'specific',
    definition:
      'Произведения, в которых появляется персонаж. Свойство служит областью уникальности для `first_appearance`. ' +
      'Связь с ролью персонажа хранится отношением portrays, а не этим свойством.',
  },
  {
    key: 'prop_role',
    title: 'role',
    label: 'Роль',
    value_type: 'reference',
    target_types: ['category'],
    target_facet: 'facet_char_role',
    cardinality: '0..1',
    required: false,
    scope: 'specific',
    definition:
      'Роль персонажа в произведении: ссылка на категорию фасета char_role. Поле `target_facet` ограничивает ' +
      'допустимые значения одним фасетом: без него значением роли могла бы стать любая категория, например ' +
      '«Научная фантастика» (ADR-0006 §3.3, D-0031).',
    shows: [
      'один тип отношения `portrays` плюс атрибут `role` вместо десятков типов отношений',
      'фасет char_role принадлежит таксономии-словарю с `applicable_types: [relation]` (D-0064)',
      'каноническая запись условия meta.r3: `target_facet` задан при `target_types: [category]` — ' +
        'голое имя системного типа (D-0067, RULES.md §3)',
      'поле предназначено для экземпляров системного типа `relation`: состав таких полей задан ядром, ' +
        'а определение свойства хранит ограничение значения',
    ],
  },
];

/**
 * Объекты устаревшего типа PropertyType (находка F-3.2, D-0066): набор значений закрыт
 * перечислением `value_type` на уровне ядра, объекты сохранены, чтобы префикс PTYPE не
 * переиспользовался (TYPE_PREFIX_REGISTRY §1 R8). Судьба типа в ядре решается в фазе 3c.
 */
const PROPERTY_TYPES = [
  { key: 'ptype_text', title: 'text', label: 'Текст' },
  { key: 'ptype_number', title: 'number', label: 'Число' },
  { key: 'ptype_date', title: 'date', label: 'Дата' },
  { key: 'ptype_datetime', title: 'datetime', label: 'Дата и время' },
  { key: 'ptype_boolean', title: 'boolean', label: 'Логическое' },
  { key: 'ptype_reference', title: 'reference', label: 'Ссылка' },
];

module.exports = { PROPERTIES_2, PROPERTY_TYPES };
