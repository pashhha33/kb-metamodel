#!/usr/bin/env node
/**
 * tools/examples/data-classification.cjs
 *
 * Часть реестра канонического хранилища примеров: таксономии, фасеты, категории (M1).
 * Нормативные источники: docs/metamodel/00_overview.md §4; ADR-0005 §3.1; ADR-0006 §3.1;
 * ADR-0007 (обязательный key фасета); ADR-0011 §3.3 (фасет метода создания);
 * NAME_MAPPING §7.1 (состав фасетов и таксономия-словарь, D-0064).
 *
 * Правило иерархии: ссылка `parent` хранится только вверх — от частного к общему
 * («Романист» → parent «Прозаик» → parent «Писатель»). Активация аспекта обходит parent вниз,
 * поэтому назначение потомка активирует аспект, триггером которого является предок (ADR-0008 §3.2).
 */
'use strict';

const TAXONOMIES = [
  {
    key: 'tax_works',
    title: 'Классификация произведений',
    label: 'Классификация произведений',
    applicable_types: ['otype_book', 'otype_chapter'],
    hierarchy_mode: 'strict',
    assignment_cardinality: '0..n',
    root_requirement: 'multiple',
    description:
      'Оси классификации произведений: жанр и тональность. Таксономия является контейнером осей, а не иерархией ' +
      'категорий; иерархию задаёт фасет со значением `hierarchy_mode: strict` (02_concept_alignment §2.1).',
    shows: [
      '`applicable_types` обязателен и непуст (meta.r5): границы области задаёт таксономия, уровень Domain в MVP не вводится (D-0023)',
      'значения `hierarchy_mode`, `assignment_cardinality`, `root_requirement` — значения по умолчанию для фасетов (ADR-0005 §3.1 п.6)',
    ],
  },
  {
    key: 'tax_people',
    title: 'Люди и организации',
    label: 'Люди и организации',
    applicable_types: ['otype_person', 'otype_organization'],
    hierarchy_mode: 'strict',
    assignment_cardinality: '0..n',
    root_requirement: 'multiple',
    description: 'Оси классификации людей и организаций: профессия и тип организации (ADR-0006 §3.1, Q-28 = A).',
  },
  {
    key: 'tax_media',
    title: 'Медиа',
    label: 'Медиа',
    applicable_types: ['media_asset'],
    hierarchy_mode: 'strict',
    assignment_cardinality: '0..n',
    root_requirement: 'multiple',
    description:
      'Оси классификации медиаобёрток. В MVP одна ось — метод создания (ADR-0011 §3.3, требование T9). ' +
      'Тип `media_asset` — системный: в `applicable_types` записывается голой строкой snake_case, ' +
      'а не wikilink-ссылкой, поскольку определения ObjectType у него нет (D-0067).',
  },
  {
    key: 'tax_dictionaries',
    title: 'Словари значений',
    label: 'Словари значений',
    applicable_types: ['relation'],
    hierarchy_mode: 'strict',
    root_requirement: 'multiple',
    description:
      'Таксономия-словарь (D-0064): её категории не назначаются объектам в поля `cat_*`, а используются как ' +
      'значения свойств — например, `Relation.role`. `applicable_types` содержит ровно один элемент, тип `relation` ' +
      '(голое имя системного типа, D-0067), поэтому правило meta.r5 (список непуст и разрешим) не ослабляется, ' +
      'а поле `cat_char_role` не создаётся.',
    shows: [
      'словарь отделён от осей назначения: у таксономии свой набор применимых типов',
      '`assignment_cardinality` у фасета-словаря описывает кардинальность свойства, а не поля назначений (NAME_MAPPING §7.1 п.4)',
    ],
  },
];

const FACETS = [
  {
    key: 'facet_genre',
    title: 'genre',
    label: 'Жанр',
    taxonomy: 'tax_works',
    hierarchy_mode: 'strict',
    assignment_cardinality: '0..n',
    root_requirement: 'multiple',
    description:
      'Жанр произведения. Несколько значений допустимы: произведение может одновременно относиться '
      + 'к «Фантастике» и к «Роману». Два корня оси — «Фантастика» и «Проза», остальные значения — их потомки.',
    shows: [
      '`key` обязателен и образует имя поля назначений `cat_genre` (ADR-0007)',
      '`title` совпадает со значением `key`: расхождение — ошибка (D-0063, NAME_MAPPING §0 п.2)',
    ],
  },
  {
    key: 'facet_tone',
    title: 'tone',
    label: 'Тональность',
    taxonomy: 'tax_works',
    hierarchy_mode: 'strict',
    assignment_cardinality: '0..1',
    root_requirement: 'multiple',
    description: 'Тональность произведения. Одно значение: ось ортогональна жанру (02_concept_alignment §4.1).',
  },
  {
    key: 'facet_profession',
    title: 'profession',
    label: 'Профессия',
    taxonomy: 'tax_people',
    hierarchy_mode: 'strict',
    assignment_cardinality: '0..n',
    root_requirement: 'multiple',
    description:
      'Профессия человека. Устойчивый факт об объекте сам по себе — категория фасета, а не тип объекта и не ' +
      'отношение (ADR-0006 §3.1, правило роли D-0026). Множественность позволяет быть одновременно писателем и врачом.',
    shows: [
      'назначение категории активирует аспект literary_person (ADR-0008)',
      'иерархия «Писатель → Прозаик → Романист» работает штатно через `Category.parent`',
    ],
  },
  {
    key: 'facet_org_type',
    title: 'org_type',
    label: 'Тип организации',
    taxonomy: 'tax_people',
    hierarchy_mode: 'strict',
    assignment_cardinality: '0..n',
    root_requirement: 'multiple',
    description: 'Тип организации: издательство, редакция, учреждение (Q-28 = A).',
  },
  {
    key: 'facet_creation_method',
    title: 'creation_method',
    label: 'Метод создания',
    taxonomy: 'tax_media',
    hierarchy_mode: 'strict',
    assignment_cardinality: '0..n',
    root_requirement: 'multiple',
    description:
      'Метод создания медиафайла: фото, коллаж, рисунок, генерация ИИ (ADR-0011 §3.3, требование T9). ' +
      'Значение «Генерация ИИ» активирует аспект ai_generated_media.',
  },
  {
    key: 'facet_char_role',
    title: 'char_role',
    label: 'Роли персонажей',
    taxonomy: 'tax_dictionaries',
    hierarchy_mode: 'strict',
    assignment_cardinality: '0..1',
    root_requirement: 'multiple',
    description:
      'Словарь ролей персонажей: значения свойства `Relation.role` (ADR-0006 §3.3). Фасет не является осью ' +
      'назначения категорий объекту, поэтому поле `cat_char_role` не создаётся, а правило classif.r3 к нему ' +
      'не применяется (D-0064, NAME_MAPPING §7.1).',
  },
];

/**
 * Категории. `parent` отсутствует у корней: корень определяется пустым родителем,
 * искусственный объект «Корень» не создаётся (00_overview §4.1 п.5). Запись `parent: null`
 * равнозначна; пустой список `parent: []` допустим схемой, но является исторической формой
 * (находка F-3.11) и в канонических примерах не используется.
 */
const CATEGORIES = [
  { key: 'cat_fiction', label: 'Фантастика', facet: 'facet_genre' },
  { key: 'cat_sf', label: 'Научная фантастика', facet: 'facet_genre', parent: 'cat_fiction' },
  { key: 'cat_fantasy', label: 'Фэнтези', facet: 'facet_genre', parent: 'cat_fiction',
    status: 'archived',
  },
  { key: 'cat_prose', label: 'Проза', facet: 'facet_genre' },
  { key: 'cat_novel', label: 'Роман', facet: 'facet_genre', parent: 'cat_prose' },
  { key: 'cat_novella', label: 'Повесть', facet: 'facet_genre', parent: 'cat_prose',
    status: 'archived',
  },
  { key: 'cat_poem', label: 'Поэма', facet: 'facet_genre', parent: 'cat_prose',
    status: 'archived',
  },

  { key: 'cat_dark', label: 'Мрачная', facet: 'facet_tone' },
  { key: 'cat_light', label: 'Светлая', facet: 'facet_tone',
    status: 'archived',
  },

  {
    key: 'cat_writer',
    label: 'Писатель',
    facet: 'facet_profession',
    note: 'Корневая категория ветки литературных профессий: триггер аспекта literary_person.',
  },
  { key: 'cat_prose_writer', label: 'Прозаик', facet: 'facet_profession', parent: 'cat_writer' },
  { key: 'cat_novelist', label: 'Романист', facet: 'facet_profession', parent: 'cat_prose_writer' },
  { key: 'cat_poet', label: 'Поэт', facet: 'facet_profession', parent: 'cat_writer' },
  { key: 'cat_playwright', label: 'Драматург', facet: 'facet_profession', parent: 'cat_writer',
    status: 'archived',
  },
  { key: 'cat_physician', label: 'Врач', facet: 'facet_profession' },

  { key: 'cat_publisher_org', label: 'Издательство', facet: 'facet_org_type' },
  { key: 'cat_media_org', label: 'Редакция и СМИ', facet: 'facet_org_type',
    status: 'archived',
  },

  { key: 'cat_photo', label: 'Фото', facet: 'facet_creation_method' },
  { key: 'cat_collage', label: 'Коллаж', facet: 'facet_creation_method',
    status: 'archived',
  },
  { key: 'cat_drawing', label: 'Рисунок', facet: 'facet_creation_method' },
  {
    key: 'cat_ai',
    label: 'Генерация ИИ',
    facet: 'facet_creation_method',
    note: 'Триггер аспекта ai_generated_media: назначение активирует свойства метода генерации (ADR-0011 §3.3).',
  },

  { key: 'cat_protagonist', label: 'Главный герой', facet: 'facet_char_role' },
  { key: 'cat_supporting', label: 'Второстепенный персонаж', facet: 'facet_char_role',
    status: 'archived',
  },
  { key: 'cat_mentioned', label: 'Упомянут', facet: 'facet_char_role',
    status: 'archived',
  },
];

module.exports = { TAXONOMIES, FACETS, CATEGORIES };
