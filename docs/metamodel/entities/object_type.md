---
doc: entity
entity: ObjectType
type_id: object_type
status: actual
metamodel_version: 0.15.0
updated: 2026-10-21
parent: null
children: []
superseded_by: null
source_refs: [docs/adr/ADR-0012-object-type-identifier.md, docs/adr/ADR-0005-classification.md, docs/adr/ADR-0003-property-attachment.md, docs/adr/ADR-0010-sequences-and-creation-form.md, schema/0.14.0/m1/object_type.json]
schema_fragment: schema/0.15.0/m1/object_type.json
canonical_example: examples/vault/types/Книга (OTYPE-01J8Z6M4K2Q7V9X3N5B0C1D2HH).md
---

# Сущность: ObjectType (`object_type`)

## 1. Определение

`ObjectType` — определение M1, задающее структуру и смысл для экземпляров (объектов M0):
состав полей (`properties`), наследование (`parent_type`), ужесточения унаследованных свойств
(`property_overrides`), префикс идентичности (`type_prefix`), механизмы последовательностей
(`sequential_parent`, `sequence_key`, `sequence_step`, `sequence_direction`, `title_template`).
Не является экземпляром и не является классом в коде реализации (L-1, D-0057): это заметка
в хранилище, «всё как данные» (X-04).

**Проверка различимости:** заметка является `ObjectType`, если её `type: object_type` и она описывает
другие заметки (её экземпляры несут `type: <идентификатор типа>`). Заметка НЕ является `ObjectType`,
если она сама представляет объект знаний (`type: book`, `type: person`, …) — это экземпляр M0;
определения полей — `Property`, типов связей — `RelationType`.

## 2. Пример из жизни

- **Конкретный тип** — `examples/vault/types/Книга (OTYPE-01J8Z6M4K2Q7V9X3N5B0C1D2HH).md`:
  `type_prefix: BOOK`, наследник абстрактного `Произведение`, собственные свойства `cover`,
  `illustrations` (издательские свойства — универсальные, в списке не перечисляются).
- **Абстрактный тип** — `examples/vault/types/Контекст (OTYPE-01J8Z6M4K2Q7V9X3N5B0C1D2G1).md`:
  `is_abstract: true`, `type_prefix: null`, `properties: []`; экземпляры не создаются (`contract.r5`),
  может быть целью `subject_types`/`object_types` и `applies_to` в значении «любой наследник».
- **Контрпример** — `examples/vault/objects/Мастер и Маргарита (BOOK-01J8Z6M4K2Q7V9X3N5B0C1D2AC).md`
  (`type: book`): похожая структура frontmatter, но это экземпляр M0, а не определение типа.

## 3. Место в классификации

- Слой: **M1**, определение (системный тип ядра; `layer` самого определения — `system`).
- Родитель: нет (базовый тип метамодели).
- Смежные типы и отличия: `Property` — определяет поле, `ObjectType` — связывает поля в тип;
  `RelationType` — определяет связь между объектами, а не их состав; `Taxonomy.applicable_types`
  ссылается на `ObjectType` как на границу классификации; `Aspect` активирует свойства на
  экземплярах по категориям, не меняя определение типа.
- Роль `title` (D-0063): **отображаемое название** (`Книга`), не ключ. Идентификатор типа,
  который экземпляры носят в поле `type` (`book`), хранится в обязательном поле **`type_id`**
  (ADR-0012, D-0073): индекс типов строится из данных, а не из соответствия префиксов.

## 4. Атрибуты

Сверяется с `schema/0.14.0/m1/object_type.json`. Системный контракт (8 полей) — по `NAME_MAPPING`
и `00_overview` §2; ниже — специфика типа.

| Поле | Тип | Обяз. | Значение по умолчанию | Enum / формат | Описание | Пример |
|---|---|---|---|---|---|---|
| `type` | string | да | — | const `object_type` | Ветка диспетчеризации схемы | `object_type` |
| `type_id` | string | да | — | `^[a-z][a-z0-9_]*$`, ≤ 64 (`naming.r12`); уникален среди `ObjectType`, не совпадает с M1-типами (`naming.r13`); неизменяем | Идентификатор типа: значение поля `type` экземпляров (ADR-0005 §3.6, ADR-0012) | `book` |
| `title` | string | да | — | отображаемое название (D-0063); длина ≤ 60 в имени файла (`contract.r12`) | Название типа | `Книга` |
| `label` | string | да | — | `naming.r10` | Подпись в UI и отображаемое имя в представлениях (ADR-0001) | `Книга` |
| `label_ru`, `label_en` | string | нет | — | задел локализаций (A-4) | Не заполняются в MVP | — |
| `type_prefix` | string \| null | да | — | `^[A-Z][A-Z0-9]{2,11}$`; null только у абстрактных (`naming.r7`) | Префикс идентичности; уникален (`naming.r6`), неизменяем, не переиспользуется (реестр D-0018) | `BOOK` |
| `is_abstract` | boolean | да | — | — | Абстрактный тип: экземпляры не создаются (`contract.r5`), не предлагается в выборе типа | `false` |
| `layer` | enum | да | — | `system` \| `domain` | `system` — тип метамодели; `domain` — знания пользователя. На прочие определения M1 не распространяется (D-0074) | `domain` |
| `parent_type` | wikilink \| null | нет | null | 0..1, только на `ObjectType` | Наследование по spec §14 / ADR-0003; циклы запрещены (`inherit.r5`), глубина > 5 — `warn` (`inherit.r7`) | `[[Произведение (OTYPE-…)\|Произведение]]` |
| `properties` | wikilink[] | да | — | упорядоченный список ссылок на `Property` | Плоский список полей типа (ADR-0003); порядок задаёт порядок полей в форме создания | `[[cover (PROP-…)\|cover]]` |
| `property_overrides` | object[] | нет | — | только ужесточения (ADR-0003 §3.3) | Вложенный список переопределений унаследованных свойств; ослабления запрещены (`inherit.r1…r4`) | — |
| `description` | string | нет | — | = `rdfs:comment` | Описание типа | — |
| `lifecycle` | enum | нет | `standard` | `experimental`, `standard`, `deprecated`, `archived` | `deprecated` не удаляет определение (S6) | `standard` |
| `sequential_parent` | wikilink | нет* | — | *только парой с `sequence_key` (`sequence.r1`) | Свойство-родитель последовательности: `value_type: reference`, `cardinality ∈ {1, 0..1}` (`sequence.r2`; расхождение с description фрагмента — F-3.26) | `[[part_of (PROP-…)\|part_of]]` |
| `sequence_key` | wikilink | нет* | — | *только парой | Свойство-ключ порядка: `value_type: number`, `cardinality: 1` (ADR-0010 §3.1) | `[[order (PROP-…)\|order]]` |
| `sequence_step` | number | нет | 10 | > 0 | Разреженная нумерация: вставка между = среднее (ADR-0010 §2.2) | `10` |
| `sequence_direction` | enum | нет | `ascending` | `ascending` \| `descending` | Направление сортировки | `ascending` |
| `title_template` | string | нет | — | плейсхолдеры `{key}` — существующие свойства типа (`meta.r14`) | Шаблон `title` при создании без явного имени | — |

**Производные поля** (не хранятся, вычисляются):

| Поле | Как вычисляется | Где используется |
|---|---|---|
| индекс типов | строится по полю `type_id` определений (ADR-0012) | значение `type` экземпляров, `contract.r5`, разрешение `target_types`, `relation.r2/r3`, эффективный набор свойств |
| эффективный набор свойств | inherited → own → universal → triggered → override ?? default (ADR-0003, ADR-0008 §3.3) | формы, валидация экземпляров (`property.r1…r6`) |

## 5. Связи

| Связь | Целевой тип | Роль (отсюда) | Обратная роль | Кардинальность | Хранение | Обяз. |
|---|---|---|---|---|---|---|
| `properties` | `Property` | тип владеет полем | поле входит в тип (`specific`) | 0..n, порядок значим | frontmatter, wikilink | да (может быть пустым) |
| `parent_type` | `ObjectType` | наследник | предок | 0..1 | frontmatter, wikilink | нет |
| `property_overrides` | `Property` | ужесточение | — | 0..n | frontmatter, вложенный список | нет |
| `sequential_parent`, `sequence_key` | `Property` | механизм последовательности | — | 0..1, только парой | frontmatter, wikilink | нет |

Экземпляры ссылаются на тип **строкой** `type: <type_id>` (ADR-0005 §3.6, D-0020), а не wikilink:
в стандартном графе Obsidian нет рёбер «экземпляр → тип» (осознанная потеря ADR-0005); иерархию
и индекс типов плагин строит сам.

## 6. Enum и справочники

| Enum | Допустимые значения | Семантика | Где определён |
|---|---|---|---|
| `layer` | `system`, `domain` | слой определения | `schema/0.14.0/common/enums.json` |
| `lifecycle` | `experimental`, `standard`, `deprecated`, `archived` | жизненный цикл определения | там же |
| `sequence_direction` | `ascending`, `descending` | сортировка последовательности | там же |
| `type_prefix` | формат `^[A-Z][A-Z0-9]{2,11}$` | 9 правил реестра (D-0018) | `TYPE_PREFIX_REGISTRY.md` |

## 7. Даты и интервалы

Контрактные `created_at`/`updated_at`: ISO 8601 с offset, закавыченной строкой (D-0065,
`NAME_MAPPING` §8). Интервалы тип не использует.

## 8. Ограничения и правила валидации

Выписка из `docs/validation/RULES.md` (идентификаторы — группы каталога).

| ID правила | Уровень | Формулировка (кратко) | Кто проверяет |
|---|---|---|---|
| `contract.r5` | error | Экземпляры абстрактных типов не создаются | валидатор фазы 5 (нужен индекс типов) |
| `contract.r6`, `r11`, `r12` | error/warn | `title` не пуст; имя файла `{title} ({PREFIX}-{id}).md`; `title` в имени ≤ 60 | схема (частично) + песочница |
| `naming.r4`, `r5`, `r6`, `r7` | error | формат, ASCII, уникальность, обязательность/`null` префикса | схема (формат, r7) + песочница (уникальность) |
| `naming.r10` | error | `label` присутствует у каждого определения M1 | схема |
| `naming.r12` | error | `type_id` — формат EN snake_case (ADR-0012) | схема |
| `naming.r13` | error | `type_id` уникален среди `ObjectType`, не совпадает с M1-типами | песочница / валидатор |
| `inherit.r1…r4` | error | overrides только ужесточают: смысл, `value_type`, обязательность, кардинальность | песочница |
| `inherit.r5`, `r6`, `r7` | error/warn | нет циклов; `parent_type` существует; глубина ≤ 5 | песочница |
| `sequence.r1`, `r2` | error | пара полей; требования к свойствам последовательности | схема (r1) + песочница (r2) |
| `meta.r13` | warn | определение не используется — возможно, мёртвое (deprecated не помечается) | песочница |
| `meta.r14` | error | плейсхолдеры `{key}` в `title_template` соответствуют свойствам типа | песочница |

## 9. Идентичность, дубли и слияние

- Ключ идентичности: `id` (ULID); переименование `title` допустимо (имя файла меняется, `id` — нет).
- Дубли определений ловят `naming.r6` (префикс) и `meta.r12` (`id`); слияние определений — процедура
  ADR-0009 с переносом ссылок из `properties`/`parent_type` экземпляров определения.
- Смена типа экземпляром: `id` экземпляра сохраняется (ADR-0002).

## 10. Представления

| Представление | Как отображается | Приоритет (фаза 4, Q-05) |
|---|---|---|
| Выбор типа при создании | `label` + иерархия; абстрактные не предлагаются | MVP |
| Панель объекта | тип экземпляра с подписью `label` | MVP |
| Таблицы/карточки | фильтр по типу, отображаемое имя из `label` | MVP |

## 11. Пример заметки

Сверен с каноническим хранилищем (`canonical_example`); хранилище производное — пример берётся
из `examples/vault/`, а не сочиняется.

```yaml
---
id: 01J8Z6M4K2Q7V9X3N5B0C1D2HH
type: object_type
type_id: book
title: Книга
label: Книга
type_prefix: BOOK
is_abstract: false
layer: domain
parent_type: "[[Произведение (OTYPE-01J8Z6M4K2Q7V9X3N5B0C1D2AA)|Произведение]]"
properties:
  - "[[cover (PROP-01J8Z6M4K2Q7V9X3N5B0C1D2B4)|cover]]"
  - "[[illustrations (PROP-01J8Z6M4K2Q7V9X3N5B0C1D2H6)|illustrations]]"
description: Книга как самостоятельное произведение. Издательство, ISBN, объём и дата издания — универсальные свойства.
lifecycle: standard
status: active
created_at: "2026-10-21T09:09:00+03:00"
updated_at: "2026-10-21T18:00:00+03:00"
---
```

## 12. Открытые вопросы и расширения

- [x] **Q-65 (F-3.27)** — закрыт **ADR-0012** (D-0073): обязательное поле `type_id` (§4);
      схема 0.15.0, правила `naming.r12`/`naming.r13`; индекс типов строится из данных.
- [x] **F-3.26** — description `sequential_parent` приведён к `sequence.r2` в схеме 0.15.0.
- [x] **F-3.3** — закрыт D-0074 (Q-68 = A): `layer` не распространяется на прочие определения M1 (область: `ObjectType` — обязательно, `Aspect` — объявленное исключение).
- [ ] **F-3.26:** description `sequential_parent` во фрагменте схемы говорит «`cardinality: 1`»,
      правило `sequence.r2` — «∈ {1, 0..1}»; редакционная правка в схеме 0.15.0.
- [ ] **F-3.7:** нормативный предел длины `title` (сейчас `maxLength: 300` технический).

## 13. История изменений

| Версия документа | Дата | Что изменилось | Решение / ADR |
|---|---|---|---|
| 0.3.0 | 2026-10-21 | Статус `draft` → `actual`: пакетное утверждение пользователем (Q-69 = 3, Q-67 = A); формальная сверка `quality-check` — 0 расхождений; L-1 самопроверка (имена реализации вынесены в указатели на `docs/plugin/ARCHITECTURE.md`); F-3.3 закрыт (D-0074) | D-0074 |
| 0.2.0 | 2026-10-21 | Поле `type_id` (обязательное) перенесено из «не хранится» в §4; правила `naming.r12`/`naming.r13`; Q-65 и F-3.26 закрыты; сверка с фрагментом 0.15.0 | ADR-0012, D-0073 |
| 0.1.0 | 2026-10-21 | Описание создано по `ENTITY_TEMPLATE` 1.1.0 (фаза 3c, пачка 1); зафиксирована находка F-3.27 (Q-65) | D-0070 |
