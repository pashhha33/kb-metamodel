#!/usr/bin/env node
/**
 * tools/examples/data-relations.cjs
 *
 * Часть реестра канонического хранилища примеров: типы отношений и экземпляры отношений.
 * Нормативные источники: docs/metamodel/00_overview.md §7.1, §7.4; ADR-0006 §3.2–§3.4;
 * ADR-0009 §3.1 и RULES.md §12.1. Направления, кардинальности и правила уникальности взяты
 * из таблицы 00_overview §7.4 без изменений.
 *
 * Экземпляр отношения — объект системного типа `relation`: его состав полей задан ядром
 * (схема schema/<version>/m1/relation.json), а не данными метамодели. Определение свойства
 * `role` хранится в хранилище, потому что именно оно несёт ограничение значения (target_facet).
 */
'use strict';

const RELATION_TYPES = [
  {
    key: 'rtype_author',
    title: 'author',
    label: 'Автор',
    forward_label: 'автор',
    inverse_label: 'произведение автора',
    direction: 'directed',
    subject_types: ['otype_work'],
    object_types: ['otype_person'],
    cardinality: '0..n',
    uniqueness_rule: 'unique_triple',
    is_restriction: false,
    description:
      'Авторство произведения. Направление задано таблицей 00_overview §7.4: субъект — произведение, ' +
      'объект — человек. Читается связь через подписи: forward_label «автор» относится к объекту связи.',
    shows: [
      'ссылка на абстрактный тип Work в `subject_types` означает «любой наследник» (ADR-0005)',
      '`is_restriction: false` — рекомендация, а не запрет: несоответствие даёт warn (relation.r7)',
      'экземпляр создаётся по правилу повышения X-03, как только у связи появляются атрибуты',
    ],
  },
  {
    key: 'rtype_portrays',
    title: 'portrays',
    label: 'Воплощает',
    forward_label: 'роль в произведении',
    inverse_label: 'персонаж',
    direction: 'directed',
    subject_types: ['otype_character'],
    object_types: ['otype_work'],
    cardinality: '0..n',
    uniqueness_rule: 'unique_triple',
    description:
      'Роль персонажа в произведении. Один тип отношения плюс атрибут `role` (ссылка на категорию фасета ' +
      'char_role) заменяет десятки типов отношений: роли однородны по структуре, а список ролей открыт ' +
      '(ADR-0006 §3.3, критерий выбора механизма).',
  },
  {
    key: 'rtype_member_of',
    title: 'member_of',
    label: 'Состоит в',
    forward_label: 'место работы или службы',
    inverse_label: 'сотрудник',
    direction: 'directed',
    subject_types: ['otype_person'],
    object_types: ['otype_organization'],
    cardinality: '0..n',
    uniqueness_rule: 'unique_triple',
    description:
      'Принадлежность человека к организации. Должность хранится атрибутом связи (`position`), а не категорией ' +
      'человека: она существует только в контексте организации (ADR-0006 §3.4, D-0028).',
  },
  {
    key: 'rtype_appears_in',
    title: 'appears_in',
    label: 'Появляется в',
    forward_label: 'произведение с участием',
    inverse_label: 'участник',
    direction: 'directed',
    subject_types: ['otype_character'],
    object_types: ['otype_work'],
    cardinality: '0..n',
    uniqueness_rule: 'unique_triple',
    description:
      'Появление персонажа в произведении без указания роли. Объявлен для полноты таблицы 00_overview §7.4; ' +
      'экземпляров в этом сценарии нет.',
  },
  {
    key: 'rtype_derived_from',
    title: 'derived_from',
    label: 'Производно от',
    forward_label: 'исходный источник',
    inverse_label: 'производное произведение',
    direction: 'directed',
    subject_types: ['otype_work'],
    object_types: ['otype_source'],
    cardinality: '0..n',
    uniqueness_rule: 'unique_triple',
    description:
      'Произведение создано на основе источника. Применяется, когда значимы обе роли: два объекта и связь ' +
      'между ними (00_overview §5.3, D-0019).',
  },
  {
    key: 'rtype_supersedes',
    title: 'supersedes',
    label: 'Заменяет',
    forward_label: 'заменяющий объект',
    inverse_label: 'заменённый объект',
    direction: 'directed',
    subject_types: [],
    object_types: [],
    cardinality: '0..1',
    uniqueness_rule: 'unique_subject',
    description:
      'Новый объект заменяет старый (ADR-0009 §3.1). Пустые списки типов означают «любой тип». ' +
      'Цепочки замен запрещены (lifecycle.r1): у объекта не более одной исходящей связи замены (lifecycle.r3).',
  },
  {
    key: 'rtype_merged_into',
    title: 'merged_into',
    label: 'Слито в',
    forward_label: 'основной объект',
    inverse_label: 'влитый дубликат',
    direction: 'directed',
    subject_types: [],
    object_types: [],
    cardinality: '0..1',
    uniqueness_rule: 'unique_subject',
    description:
      'Дубликат влит в основной объект (ADR-0009 §3.1). Процедура слияния из семи шагов нормативна — ' +
      'docs/validation/RULES.md §12.1: предпросмотр, резервная копия, перевод ссылок, связь, архивация дубликата.',
  },
];

/** Экземпляры отношений (системный тип M1 `relation`). */
const RELATIONS = [
  {
    key: 'rel_authorship',
    title: 'Авторство «Мастера и Маргариты»',
    subject: 'book_bulgakov',
    relation_type: 'rtype_author',
    relation_type_label: 'Автор',
    object: 'person_bulgakov',
    order: 1,
    is_primary: true,
    body:
      'Связь повышена до объекта по правилу X-03 (ADR-0006 §3.2): у авторства есть атрибуты — порядок среди ' +
      'соавторов и признак основного автора.\n\n' +
      '**Про период действия.** Поля `valid_from` и `valid_to` оставлены пустыми: точные даты работы над романом ' +
      'в примере не утверждаются. Пустое `valid_to` означает незакрытый интервал (00_overview §9). Нормативный ' +
      'формат значения — `YYYY-MM-DD`, записанный строкой (NAME_MAPPING §8). Запись целым годом ' +
      '(`valid_from: 1921`), встречающаяся в примерах ADR-0006 и ADR-0009, историческая: схема её принимает ' +
      '(находка F-3.5), канонические примеры используют дату.\n\n' +
      'Ссылка в свойстве объекта при этом отсутствует: одна связь не существует в двух формах (relation.r6).',
    shows: [
      '`subject`, `relation_type`, `object` обязательны (relation.r1)',
      'атрибуты `order` и `is_primary` — причина повышения связи до объекта',
      'тип субъекта и объекта соответствует `subject_types` / `object_types` с учётом наследования: ' +
        'Книга является наследником абстрактного типа Произведение (relation.r2, relation.r3)',
    ],
  },
  {
    key: 'rel_portrays_bezdomy',
    title: 'Иван Бездомный — главный герой «Мастера и Маргариты»',
    subject: 'char_bezdomy',
    relation_type: 'rtype_portrays',
    relation_type_label: 'Воплощает',
    object: 'book_bulgakov',
    role: 'cat_protagonist',
    body:
      'Значение `role` — ссылка на категорию словаря `char_role`, а не свободная строка. Ограничение задаёт ' +
      'определение свойства role через `target_facet` (ADR-0006 §3.3): без него значением роли могла бы стать ' +
      'любая категория, например «Научная фантастика».\n\n' +
      'Категория «Главный герой» является корневой в словаре: у неё нет родителя.',
    shows: [
      'один тип отношения плюс атрибут-словарь вместо отдельного типа на каждую роль',
      'таксономия-словарь: категории назначаются не объекту, а используются как значение свойства (D-0064)',
    ],
  },
  {
    key: 'rel_portrays_woland',
    title: 'Воланд — главный герой «Мастера и Маргариты»',
    subject: 'char_woland',
    relation_type: 'rtype_portrays',
    relation_type_label: 'Воплощает',
    object: 'book_bulgakov',
    role: 'cat_protagonist',
    body:
      'Второй экземпляр того же типа отношения с тем же значением роли: правило уникальности `unique_triple` ' +
      'не нарушено, потому что различается субъект связи (relation.r4).',
  },
  {
    key: 'rel_merged_duplicate',
    title: 'Слияние дубликата «Мастер и Маргарита (рукопись)»',
    subject: 'book_duplicate',
    relation_type: 'rtype_merged_into',
    relation_type_label: 'Слито в',
    object: 'book_bulgakov',
    valid_from: '2026-10-21',
    description: 'Перенесены свойства publication_date и назначения категорий; ссылки переведены на основной объект.',
    body:
      'Шаг 5 нормативной процедуры слияния (RULES.md §12.1): связь создаётся после перевода ссылок, а дубликату ' +
      'присваивается `status: archived` — файл при этом не перемещается и не удаляется (ADR-0009).\n\n' +
      'Цепочка замен запрещена: архивный дубликат не может быть целью другой связи слияния.\n\n' +
      '> **Замечание о формулировке `lifecycle.r1`.** Каталог формулирует правило как «цель `merged_into` и ' +
      '`supersedes` не имеет `status: archived`», тогда из текста ADR-0009 следует, что архивным не должен быть ' +
      '**источник** связи (заменяющий объект): именно это запрещает цепочки. В примере архивным является ' +
      'источник, цель активна — расхождение зафиксировано как находка F-3.22, правка формулировки редакционная.',
    shows: [
      'архивирование выражается только полем `status` (ADR-0009): имя файла и ссылки сохраняются',
      '`valid_from` записан строкой в формате YYYY-MM-DD',
    ],
  },
];

module.exports = { RELATION_TYPES, RELATIONS };
