#!/usr/bin/env node
/**
 * tools/examples/data-types.cjs
 *
 * Часть реестра канонического хранилища примеров: абстрактные и конкретные типы объекта (M1).
 * Состав и формулировки — из docs/metamodel/00_overview.md §5, TYPE_PREFIX_REGISTRY §3–§4,
 * ADR-0003, ADR-0010, ADR-0011. Файл читается tools/examples/generate.cjs.
 */
'use strict';

/** Абстрактные предметные типы: is_abstract: true, type_prefix: null (naming.r7). */
const ABSTRACT_TYPES = [
  {
    key: 'otype_context',
    type_id: 'context',
    title: 'Контекст',
    label: 'Контекст',
    description:
      'Абстрактный тип: то, в контексте чего существуют объекты (люди, персонажи, организации). ' +
      'Экземпляры не создаются; может быть целью subject_types/object_types в значении «любой наследник».',
    children: 'Person, Character, Organization',
  },
  {
    key: 'otype_activity',
    type_id: 'activity',
    title: 'Деятельность',
    label: 'Деятельность',
    description: 'Абстрактный тип: проектная и рабочая активность. Экземпляры не создаются.',
    children: 'Project, Task',
  },
  {
    key: 'otype_work',
    type_id: 'work',
    title: 'Произведение',
    label: 'Произведение',
    description:
      'Абстрактный тип: самостоятельное произведение. Экземпляры не создаются. Граница с типом Source — ' +
      '«откуда извлечена информация» против «самостоятельное произведение».',
    children: 'Book, Chapter',
  },
  {
    key: 'otype_collection',
    type_id: 'collection',
    title: 'Подборка',
    label: 'Подборка',
    description: 'Абстрактный тип: кураторская подборка объектов. Экземпляры не создаются.',
    children: 'Gallery',
  },
  {
    key: 'otype_source',
    type_id: 'source',
    title: 'Источник',
    label: 'Источник',
    description: 'Абстрактный тип: то, откуда извлечена информация. Экземпляры не создаются.',
    children: 'Article',
  },
  {
    key: 'otype_knowledge',
    type_id: 'knowledge',
    title: 'Знание',
    label: 'Знание',
    description:
      'Абстрактный тип: единицы знания (понятия, идеи, гипотезы, выводы). Экземпляры не создаются; ' +
      'наследники в MVP отложены, тип объявлен, чтобы иерархия ветвей была полной.',
    children: 'отложено: Concept, Idea, Note, Hypothesis, Conclusion, Decision',
  },
];

/** Конкретные предметные типы, используемые сценарием «Книга + главы + обложка». */
const CONCRETE_TYPES = [
  {
    key: 'otype_person',
    type_id: 'person',
    title: 'Человек',
    label: 'Человек',
    type_prefix: 'PERSON',
    parent: 'otype_context',
    properties: ['prop_portrait'],
    description: 'Реальный человек. Профессия и другие устойчивые факты — категории фасетов, а не подтипы.',
    shows: [
      'портрет — свойство со ссылкой на медиаобёртку и фильтром ролей (`expected_media_roles`)',
      'профессии хранятся в поле `cat_profession` (ADR-0006 §3.1, ADR-0007), а не в иерархии типов',
      'свойства литературной деятельности добавляет аспект, а не определение типа (ADR-0008)',
      'даты рождения и смерти получены наследованием от семейства Context',
    ],
  },
  {
    key: 'otype_organization',
    type_id: 'organization',
    title: 'Организация',
    label: 'Организация',
    type_prefix: 'ORG',
    parent: 'otype_context',
    properties: ['prop_logo'],
    description: 'Организация: издательство, редакция, учреждение. Тип организации — категория фасета `org_type`.',
    shows: [
      'логотип — медиаобёртка с ролью `logo`',
      'тип организации — назначение категории `cat_org_type` (Q-28 = A)',
      'организация является целью универсального свойства `publisher`',
    ],
  },
  {
    key: 'otype_character',
    type_id: 'character',
    title: 'Персонаж',
    label: 'Персонаж',
    type_prefix: 'CHAR',
    parent: 'otype_context',
    properties: ['prop_portrait', 'prop_first_appearance'],
    description:
      'Вымышленный персонаж произведения. Роль персонажа в произведении не является свойством персонажа: ' +
      'она хранится в отношении portrays вместе с атрибутом role (ADR-0006 §3.3).',
    shows: [
      'префикс CHAR: значение CHARACTЕR с кириллической «Е» запрещено реестром (правило R9, диагноз C-06)',
      'свойство `first_appearance` демонстрирует область уникальности: пара (персонаж, произведение) уникальна',
      'персонаж является субъектом типов отношений portrays и appears_in',
    ],
  },
  {
    key: 'otype_book',
    type_id: 'book',
    title: 'Книга',
    label: 'Книга',
    type_prefix: 'BOOK',
    parent: 'otype_work',
    properties: ['prop_cover', 'prop_illustrations'],
    description: 'Книга как самостоятельное произведение. Издательство, ISBN, объём и дата издания — универсальные свойства.',
    shows: [
      'порядок ссылок в `properties` задаёт порядок полей формы и колонок таблицы (ADR-0003 §3.1)',
      'обложка — ссылка на медиаобёртку, а не встраивание файла (ADR-0011, Q-37 = C)',
      'универсальные свойства (`publisher`, `isbn`, `page_count`, `publication_date`, `language`) здесь не перечисляются',
      'связь с автором хранится объектом `Relation`, потому что у неё есть атрибуты (правило повышения X-03)',
    ],
  },
  {
    key: 'otype_chapter',
    type_id: 'chapter',
    title: 'Глава',
    label: 'Глава',
    type_prefix: 'CHAP',
    parent: 'otype_work',
    properties: ['prop_chapter_label'],
    overrides: [{ property: 'prop_order', required: true, cardinality: '1' }],
    sequential_parent: 'prop_part_of',
    sequence_key: 'prop_order',
    sequence_step: 10,
    sequence_direction: 'ascending',
    title_template: 'Глава {order}',
    description:
      'Глава произведения. Тип объявлен упорядоченной последовательностью внутри родителя: пара ' +
      '(sequential_parent, sequence_key) даёт переходы к соседям и к родителю, создание следующей главы ' +
      'и заголовок по умолчанию — без специальных знаний о конкретном типе.',
    shows: [
      'объявление последовательности (ADR-0010 §3.1, закрывает пробел G-1)',
      'свойство `part_of` получено наследованием от семейства, `order` ужесточено переопределением (ADR-0003 §3.3)',
      'шаблон заголовка «Глава {order}»: имя при создании можно пропустить (ADR-0010 §2.1, требование T5)',
      'разреженная нумерация с шагом 10 делает вставку локальной операцией (Q-34 = C)',
      'область уникальности номера — родительский объект (unique.r1, ADR-0010 §3.2)',
    ],
  },
  {
    key: 'otype_gallery',
    type_id: 'gallery',
    title: 'Галерея',
    label: 'Галерея',
    type_prefix: 'GALLERY',
    parent: 'otype_collection',
    properties: [],
    description:
      'Кураторская подборка медиаобёрток. У галереи нет поля состава: состав вычисляется из обратных ссылок ' +
      '`MediaAsset.galleries`, а порядок является свойством представления (Q-42 = B, D-0052).',
    shows: [
      'ссылки хранятся только вверх: обёртка ссылается на галерею, а не наоборот (ADR-0005 §3.1)',
      'пустой список свойств допустим: обязательность поля `properties` означает наличие поля, а не непустоту',
    ],
  },
];

module.exports = { ABSTRACT_TYPES, CONCRETE_TYPES };
