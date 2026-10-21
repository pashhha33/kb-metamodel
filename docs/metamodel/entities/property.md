---
doc: entity
entity: Property
type_id: property
status: draft
metamodel_version: 0.14.0
updated: 2026-10-21
parent: null
children: []
superseded_by: null
source_refs: [docs/adr/ADR-0003-property-attachment.md, docs/adr/ADR-0006-roles-and-professions.md, docs/adr/ADR-0010-sequences-and-creation-form.md, docs/adr/ADR-0011-media-asset.md, schema/0.14.0/m1/property.json]
schema_fragment: schema/0.14.0/m1/property.json
canonical_example: examples/vault/properties/cover (PROP-01J8Z6M4K2Q7V9X3N5B0C1D2B4).md
---

# Сущность: Property (`property`)

## 1. Определение

`Property` — определение M1 одного поля объектов: имя (`title` — ключ, становящийся именем поля
в YAML экземпляра), смысл (`definition`), форма значения (`value_type`, `cardinality`,
`allowed_values`), область применения (`scope`, `applies_to`) и ограничения
(`target_types`, `target_facet`, `expected_media_roles`, `unique_within`). Определение хранит
значения по умолчанию; ужесточения в типах — через `ObjectType.property_overrides` (ADR-0003).
Не является значением свойства и не является самим полем в frontmatter экземпляра.

**Проверка различимости:** заметка является `Property`, если её `type: property`, а `title` —
ключ поля (`cover`, `part_of`), и она описывает, каким может быть значение этого поля у объектов.
НЕ является `Property`: поле `cat_profession` экземпляра (это назначение категории фасета,
ADR-0007, отдельного определения не имеет), контрактные поля (`tags`, `status`), определение
типа значения (`PropertyType` — устаревший механизм, D-0071).

## 2. Пример из жизни

- **Ссылочное свойство на медиаобёртку** — `examples/vault/properties/cover (PROP-…2B4).md`:
  `value_type: reference`, `target_types: [media_asset]` (голое имя системного типа, D-0067),
  `expected_media_roles: [cover]` — фильтр кандидатов (ADR-0011 §3.1).
- **Свойство семейства** — `examples/vault/properties/part_of (PROP-…5A2).md`: `scope: family`,
  `applies_to: [Work, Activity]` — глава часть книги, задача часть проекта; служит областью
  уникальности для `order` (`unique_within`, ADR-0010 §3.2).
- **Свойство-словарь** — `examples/vault/properties/role (PROP-…3C3).md`: `target_types: [category]`
  + `target_facet: char_role` — значение ограничено одним фасетом (ADR-0006 §3.3, D-0031).
- **Контрпример** — `examples/vault/properties/…` vs поле `isbn: "…"` в заметке книги:
  определение и значение — разные сущности.

## 3. Место в классификации

- Слой: **M1**, определение (системный тип ядра).
- Смежные типы и отличия: `ObjectType` связывает свойства в тип (плоский список `properties`);
  `Aspect` активирует свойства по триггерным категориям; `PropertyType` — устаревший словарь
  типов значений, заменён enum `value_type` (D-0071); `Facet` — цель `target_facet` для
  свойств-словарей.
- Роль `title` (D-0063): **ключ** (EN snake_case) — именно он становится именем поля в YAML
  экземпляра; отображаемая подпись — `label`. Имя файла строится по ключу (`contract.r11`).

## 4. Атрибуты

Сверяется с `schema/0.14.0/m1/property.json`.

| Поле | Тип | Обяз. | Значение по умолчанию | Enum / формат | Описание | Пример |
|---|---|---|---|---|---|---|
| `type` | string | да | — | const `property` | Ветка диспетчеризации | `property` |
| `title` | string | да | — | ключ `^[a-z][a-z0-9_]{0,63}$`; без `cat_`, `label_`, `sb_` (`naming.r1`, `r2`); уникален среди свойств (`naming.r3`) | Имя поля в YAML экземпляра | `cover` |
| `label` | string | да | — | `naming.r10` | Подпись в модалке свойств, `displayName` в представлениях | `Обложка` |
| `value_type` | enum | да | — | `text`, `number`, `date`, `datetime`, `boolean`, `reference` (закрыт на уровне M2, `meta.r1`) | Тип значения; не меняется в наследнике (`inherit.r2`) | `reference` |
| `cardinality` | enum | да | — | `0..1`, `1`, `0..n`, `1..n` | Мощность значения (`property.r2`); не расширяется в наследнике (`inherit.r4`) | `0..1` |
| `required` | boolean | да | — | — | Обязательность; хранится явно, не понижается в наследнике (`inherit.r3`) | `false` |
| `scope` | enum | да | — | `universal`, `family`, `specific` | Область применения: `universal` — все типы автоматически, не перечисляется в `properties`, не ослабляется (`property.r7`); `family` — ветви иерархии; `specific` — только перечислившие его типы | `specific` |
| `applies_to` | wikilink[] | **да при `scope: family`** (`meta.r16`, D-0072) | — | ссылки на абстрактные `ObjectType` | Ветви применения семейного свойства; **пустой список — явное «все ветви»**; потомки ветвей включаются | `[[Произведение (OTYPE-…)\|Произведение]]` |
| `target_types` | (wikilink \| system_type_name)[] | да при `value_type: reference` (`meta.r2`) | — | `ObjectType` — wikilink; системный тип — голая строка (D-0067) | Допустимые типы цели; пустой список — «любой тип»; абстрактный тип — «любой наследник» (`link.r2`) | `[media_asset]` |
| `target_facet` | wikilink | нет | — | только при `target_types: [category]` (`meta.r3`) | Ограничение значений одним фасетом (ADR-0006 §3.3) | `[[char_role (FACET-…)\|char_role]]` |
| `expected_media_roles` | enum[] | нет | — | `media_role` (8 значений) | Фильтр кандидатов-обёрток (`media.r5`, ADR-0011 §3.2) | `[cover]` |
| `unique_within` | wikilink | нет | — | ссылка на другое `Property` | Область действия уникальности: пара (значение области, значение этого свойства) уникальна (`unique.r1`, `r2`) | `[[part_of (PROP-…)\|part_of]]` |
| `allowed_values` | string[] | нет | — | в MVP только строки | Перечень допустимых значений (`property.r4`) | — |
| `definition` | string | нет | — | = `rdfs:comment` | Смысл свойства; не меняется в наследнике (`inherit.r1`) | — |
| `lifecycle` | enum | нет | `standard` | `experimental`, `standard`, `deprecated`, `archived` | `deprecated` не удаляет определение | `standard` |

**Производные** (не хранятся, вычисляются):

| Поле | Как вычисляется | Где используется |
|---|---|---|
| эффективная кардинальность/обязательность | override ?? default (ADR-0003 §3.4) | валидация экземпляров |
| эффективный набор свойств типа | inherited → own → universal → triggered → override ?? default (ADR-0008 §3.3) | формы, `property.r1…r6` |

## 5. Связи

| Связь | Целевой тип | Роль (отсюда) | Обратная роль | Кардинальность | Хранение | Обяз. |
|---|---|---|---|---|---|---|
| `target_types` | `ObjectType` / системный тип | допустимые цели значения | — | 0..n | frontmatter, wikilink / голая строка | при `reference` |
| `target_facet` | `Facet` | ограничение значений фасетом | — | 0..1 | frontmatter, wikilink | нет |
| `unique_within` | `Property` | свойство — область уникальности | свойство-ключ уникальности | 0..1 | frontmatter, wikilink | нет |
| `applies_to` | `ObjectType` (абстрактный) | ветвь применения | тип-ветвь включает свойство | 0..n | frontmatter, wikilink | при `family` |

Обратные (хранятся у других типов): `ObjectType.properties`, `ObjectType.property_overrides`,
`ObjectType.sequential_parent`/`sequence_key`, `Aspect.properties`/`property_overrides`.

## 6. Enum и справочники

| Enum | Допустимые значения | Семантика | Где определён |
|---|---|---|---|
| `value_type` | `text`, `number`, `date`, `datetime`, `boolean`, `reference` | закрытый набор типов значений (M2) | `schema/0.14.0/common/enums.json` |
| `cardinality` | `0..1`, `1`, `0..n`, `1..n` | мощность (строчная `n` — F-3.9) | там же |
| `scope` | `universal`, `family`, `specific` | область применения | там же |
| `media_role` | `cover`, `banner`, `logo`, `portrait`, `avatar`, `preview`, `background`, `other` | роли обёрток (ADR-0011) | там же |
| `system_type_name` | `category`, `media_asset`, `relation` | запись системных типов (D-0067) | `schema/0.14.0/common/formats.json` |

## 7. Даты и интервалы

Контрактные `created_at`/`updated_at` — ISO 8601 с offset, закавыченной строкой (D-0065).
Свойства-интервалы экземпляров (`valid_from`/`valid_to`) — не поля определения; их формат
задаёт `NAME_MAPPING` §8 (`YYYY-MM-DD`, целый год — переходный слой, F-3.5).

## 8. Ограничения и правила валидации

| ID правила | Уровень | Формулировка (кратко) | Кто проверяет |
|---|---|---|---|
| `naming.r1`, `r2`, `r3` | error | формат ключа, зарезервированные префиксы, уникальность ключа | схема (формат) + песочница (уникальность) |
| `meta.r1` | error | `value_type` из закрытого набора | схема (enum) |
| `meta.r2` | error | `target_types` присутствует при `reference` | схема |
| `meta.r3` | error | `target_facet` только при `target_types: [category]` | схема |
| `meta.r13` | warn | определение не используется ни типом, ни аспектом (universal/family и deprecated не помечаются; для `role` — намеренное исключение-носитель ограничения, D-0069) | песочница |
| `meta.r16` | error | `scope: family` ⇒ `applies_to` присутствует (D-0072) | песочница (условие схемы — в 0.15.0) |
| `inherit.r1…r4` | error | overrides: смысл, `value_type`, обязательность, кардинальность не ослабляются | песочница |
| `property.r1…r6` | error/warn | правила значений на экземплярах (источник норм — это определение) | песочница / валидатор фазы 5 |
| `property.r7` | error | `universal` не ослабляется в типе | песочница |
| `unique.r1`, `r2` | error | уникальность пары; `unique_within` ссылается на свойство | песочница |
| `link.r2`, `r3` | error | тип цели из `target_types`; значение `role` — категория указанного фасета | песочница |
| `media.r5` | error | значение-обёртка имеет роль из `expected_media_roles` | песочница |

## 9. Идентичность, дубли и слияние

- Ключ идентичности: `id` (ULID). Ключ `title` глобально уникален (`naming.r3`); переименование
  ключа = миграция поля во всех экземплярах (миграции отложены до после-MVP).
- Дубли смысла (два свойства об одном) — `meta.r13`/ревью; слияние определений — процедура
  ADR-0009 с переводом ссылок из `properties`/`overrides`.

## 10. Представления

| Представление | Как отображается | Приоритет (фаза 4, Q-05) |
|---|---|---|
| Форма создания/свойств | `label` + значение по типу; порядок — по `properties` типа | MVP |
| Выбор значения-ссылки | кандидаты по `target_types`/`target_facet`/`expected_media_roles` | MVP |
| Таблицы/карточки | колонка `label`, `displayName` | MVP |

## 11. Пример заметки

```yaml
---
id: 01J8Z6M4K2Q7V9X3N5B0C1D2B4
type: property
title: cover
label: Обложка
value_type: reference
cardinality: 0..1
required: false
scope: specific
target_types:
  - media_asset
expected_media_roles:
  - cover
definition: "Медиаобёртка обложки. Значение — ссылка на объект media_asset, а не путь к файлу: у связи файла с объектом есть атрибуты (роли, источник, автор, лицензия, метод создания), поэтому связь реифицирована (ADR-0011 §3.1). Тип цели — системный тип `media_asset`, записан голой строкой snake_case (D-0067); кандидаты дополнительно отбираются по ролям."
lifecycle: standard
status: active
created_at: "2026-10-21T09:15:00+03:00"
updated_at: "2026-10-21T18:00:00+03:00"
---
```

## 12. Открытые вопросы и расширения

- [x] **A-7 / F-3.23** — закрыто D-0072 (Q-64 = B): `applies_to` обязательно для `family`,
      пустой список — явное «все ветви»; правило `meta.r16`. Условное ограничение схемы —
      в перевыпуске 0.15.0.
- [ ] `allowed_values` — только список строк (MVP); перечислимые объекты (справочники) — задел
      через таксономию-словарь (`target_facet`).
- [ ] Зависимые фильтры значений (v1.1 §18.3) — фаза 4 (RULES §16).

## 13. История изменений

| Версия документа | Дата | Что изменилось | Решение / ADR |
|---|---|---|---|
| 0.1.0 | 2026-10-21 | Описание создано по `ENTITY_TEMPLATE` 1.1.0 (фаза 3c, пачка 1); норма `applies_to`/`meta.r16` | D-0070, D-0072 |
