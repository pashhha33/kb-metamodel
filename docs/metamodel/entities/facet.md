---
doc: entity
entity: Facet
type_id: facet
status: actual
metamodel_version: 0.15.0
updated: 2026-10-21
parent: null
children: []
superseded_by: null
source_refs: [docs/adr/ADR-0005-classification.md, docs/adr/ADR-0007-category-assignment-storage.md, docs/adr/ADR-0006-roles-and-professions.md, schema/0.15.0/m1/facet.json]
schema_fragment: schema/0.15.0/m1/facet.json
canonical_example: examples/vault/taxonomy/profession (FACET-01J8Z6M4K2Q7V9X3N5B0C1D3A3).md
---

# Сущность: Facet (`facet`)

## 1. Определение

`Facet` — определение M1, **ось классификации** с собственной иерархией и настройками:
режим иерархии (`hierarchy_mode`), кардинальность назначений (`assignment_cardinality`),
требование к корням (`root_requirement`). Фасет принадлежит ровно одной таксономии
(`taxonomy`, ссылка только вверх) и владеет категориями (`Category.facet`). Ключ фасета (`key`)
образует имя поля назначений на объектах: `cat_<key>` (ADR-0007). Особый род — **фасет-словарь**
(D-0064): его категории не назначаются объектам, а используются как значения свойства
(пример: `char_role` → `Relation.role`).

**Проверка различимости:** заметка является `Facet`, если её `type: facet`, есть обязательный
`key` и ссылка `taxonomy`. НЕ является `Facet`: контейнер осей (`Taxonomy`), значение оси
(`Category`), ограничение значений свойства (`Property.target_facet` — лишь ссылка на фасет).

## 2. Пример из жизни

- **Ось назначений** — `examples/vault/taxonomy/profession (FACET-…3A3).md`: `key: profession` →
  поле `cat_profession` на людях; `assignment_cardinality: 0..n` — можно быть одновременно
  писателем и врачом (ADR-0006 §3.1).
- **Фасет-словарь** — `examples/vault/taxonomy/char_role (FACET-…3G3).md`: принадлежит таксономии
  «Словари значений» с `applicable_types: [relation]`; `assignment_cardinality: 0..1` описывает
  кардинальность свойства `Relation.role`, поле `cat_char_role` не создаётся (D-0064).
- **Ось медиа** — `examples/vault/taxonomy/creation_method (FACET-…3G2).md`: назначения на
  медиаобёртках (`cat_creation_method`), категории активируют аспект `ai_generated_media`
  (ADR-0011 §3.3).
- **Контрпример** — `examples/vault/taxonomy/Люди и организации (TAX-…3A1).md` (`type: taxonomy`):
  контейнер осей, а не ось.

## 3. Место в классификации

- Слой: **M1**, определение (системный тип ядра). Уровень 2 из 4 цепочки
  `Taxonomy → Facet → Category → Object` (ADR-0005).
- Смежные типы и отличия: `Taxonomy` — владелец (настройки фасета наследуют её значения по
  умолчанию при пустых собственных полях, A-5); `Category` — значения оси; `Aspect` — активируется
  категориями (`trigger_categories`); `Property.target_facet` — ограничивает значения свойства
  одним фасетом (словарём).
- Роль `title` (D-0063): **ключ** (EN snake_case: `profession`, `genre`, `char_role`) — совпадает
  по значению с обязательным полем `key`; расхождение `title` ≠ `key` — `error` (D-0063).
  Отображаемая подпись — `label`. Имя файла строится по ключу (`contract.r11`).

## 4. Атрибуты

Сверяется с `schema/0.15.0/m1/facet.json`.

| Поле | Тип | Обяз. | Значение по умолчанию | Enum / формат | Описание | Пример |
|---|---|---|---|---|---|---|
| `type` | string | да | — | const `facet` | Ветка диспетчеризации | `facet` |
| `title` | string | да | — | ключ EN snake_case (D-0063) | Совпадает с `key`; расхождение — `error` | `profession` |
| `label` | string | да | — | `naming.r10` | Подпись оси в UI | `Профессия` |
| `key` | string | да | — | `^[a-z][a-z0-9_]{1,30}$`, не начинается с `cat_` (`naming.r8`); глобально уникален (`naming.r9`); **неизменяем** (ADR-0007) | Образует имя поля назначений `cat_<key>` | `profession` |
| `taxonomy` | wikilink | да | — | только на `Taxonomy`, ссылка вверх (`meta.r6`) | Таксономия-владелец | `[[Люди и организации (TAX-…)\|Люди и организации]]` |
| `hierarchy_mode` | enum | нет | из таксономии (A-5) | `strict`, `polyhierarchical` | Режим иерархии категорий оси | `strict` |
| `assignment_cardinality` | enum | нет | из таксономии (A-5) | `0..1`, `1`, `0..n`, `1..n` | Сколько категорий оси можно назначить объекту (`classif.r3`); у словаря — кардинальность свойства (D-0064 п.4) | `0..n` |
| `root_requirement` | enum | нет | из таксономии (A-5) | `single`, `multiple`, `none` | Требование к числу корней (`classif.r6`) | `multiple` |
| `description` | string | нет | — | = `rdfs:comment` | Описание оси | — |
| `lifecycle` | enum | нет | `standard` | `experimental`, `standard`, `deprecated`, `archived` | Жизненный цикл определения | `standard` |

**Производные поля** (не хранятся, вычисляются):

| Поле | Как вычисляется | Где используется |
|---|---|---|
| имя поля назначений | `cat_` + `key` (префикс зарезервирован, ADR-0007) | frontmatter объектов, `classif.r10…r12` |
| список категорий | выборка `Category` со ссылкой `facet` | навигация, `classif.r6…r9` |
| признак словаря | таксономия-владелец имеет `applicable_types: [relation]` (D-0064) | отключение `classif.r3` и оси назначений |

## 5. Связи

| Связь | Целевой тип | Роль (отсюда) | Обратная роль | Кардинальность | Хранение | Обяз. |
|---|---|---|---|---|---|---|
| `taxonomy` | `Taxonomy` | ось принадлежит контейнеру | таксономия содержит ось (вычисляется) | 1 | frontmatter, wikilink | да |

Обратные (хранятся у других типов): `Category.facet`; `Property.target_facet`;
`Aspect.trigger_categories` (через категории).

## 6. Enum и справочники

| Enum | Допустимые значения | Семантика | Где определён |
|---|---|---|---|
| `hierarchy_mode` | `strict`, `polyhierarchical` | `strict`: у категории ≤ 1 `parent` (`classif.r4`); polyhierarchical — задел | `schema/0.15.0/common/enums.json` |
| `assignment_cardinality` | `0..1`, `1`, `0..n`, `1..n` | кардинальность назначений | там же |
| `root_requirement` | `single`, `multiple`, `none` | число корней оси | там же |

Фасеты ядра MVP (NAME_MAPPING §7.1): `profession` (Person), `creation_method` (media_asset),
`char_role` (relation, словарь, D-0064), `org_type` (Organization, D-0037).

## 7. Даты и интервалы

Контрактные `created_at`/`updated_at` — ISO 8601 с offset, закавыченной строкой (D-0065).

## 8. Ограничения и правила валидации

| ID правила | Уровень | Формулировка (кратко) | Кто проверяет |
|---|---|---|---|
| `naming.r8` | error | `key`: формат, без префикса `cat_` | схема |
| `naming.r9` | error | `key` глобально уникален | песочница |
| `naming.r10` | error | `label` присутствует | схема |
| `meta.r6` | error | `taxonomy` разрешима, ссылка только вверх | песочница |
| `classif.r3` | error | длина `cat_<key>` соответствует `assignment_cardinality` (к словарю не применяется, D-0064) | песочница |
| `classif.r6` | warn | число корней против `root_requirement` | песочница |
| `classif.r10`, `r12` | error/warn | поле `cat_<key>` существует только для фасета с таким `key` | песочница |
| `contract.r6`, `r11`, `r12` | error/warn | `title` не пуст; имя файла по ключу | схема + песочница |
| `meta.r13` | warn | фасет без категорий и назначений — возможно, мёртвый | песочница |
| `title` = `key` | error | расхождение дублей ключа (D-0063) | песочница |

## 9. Идентичность, дубли и слияние

- Ключ идентичности: `id` (ULID). **`key` неизменяем** (ADR-0007): переименование оси = новая ось
  и миграция полей `cat_<key>` во всех объектах (отложено до после-MVP).
- Дубли осей ловит `naming.r9` (уникальность `key`); слияние фасетов = переназначение категорий
  (`Category.facet`) и архивация дубля.

## 10. Представления

| Представление | Как отображается | Приоритет (фаза 4, Q-05) |
|---|---|---|
| Форма назначения категорий | колонки/секции по осям с подписями `label` | MVP |
| Панель объекта | блок `cat_<key>` с подписями категорий | MVP |
| Таблицы | колонка на ось: поле назначений `cat_<key>`, подпись из `label` (механизм — `docs/plugin/ARCHITECTURE.md`) | MVP |

## 11. Пример заметки

```yaml
---
id: 01J8Z6M4K2Q7V9X3N5B0C1D3A3
type: facet
title: profession
label: Профессия
key: profession
taxonomy: "[[Люди и организации (TAX-01J8Z6M4K2Q7V9X3N5B0C1D3A1)|Люди и организации]]"
hierarchy_mode: strict
assignment_cardinality: 0..n
root_requirement: multiple
description: Профессия человека. Устойчивый факт об объекте сам по себе — категория фасета, а не тип объекта и не отношение (ADR-0006 §3.1, правило роли D-0026). Множественность позволяет быть одновременно писателем и врачом.
lifecycle: standard
status: active
created_at: "2026-10-21T09:59:00+03:00"
updated_at: "2026-10-21T18:00:00+03:00"
---
```

## 12. Открытые вопросы и расширения

- [x] **F-3.3** — закрыт D-0074 (Q-68 = A): `layer` у фасетов не вводится (область: `ObjectType`
      и объявленное исключение `Aspect`).
- [x] **F-3.10** — закрыта D-0064: словарь значений легализован как таксономия с
      `applicable_types: [relation]`.
- Задел: `hierarchy_mode: polyhierarchical` (enum объявлен, `classif.r4` ограничивает `strict`).

## 13. История изменений

| Версия документа | Дата | Что изменилось | Решение / ADR |
|---|---|---|---|
| 0.2.0 | 2026-10-21 | Статус `draft` → `actual`: пакетное утверждение пользователем (Q-69 = 3, Q-67 = A); формальная сверка `quality-check` — 0 расхождений; L-1 самопроверка (имена реализации вынесены в указатели на `docs/plugin/ARCHITECTURE.md`); F-3.3 закрыт (D-0074) | D-0074 |
| 0.1.0 | 2026-10-21 | Описание создано по `ENTITY_TEMPLATE` 1.1.0 (фаза 3c, пачка 2) | D-0070 |
