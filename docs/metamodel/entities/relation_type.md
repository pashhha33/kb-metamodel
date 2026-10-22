---
doc: entity
entity: RelationType
type_id: relation_type
status: actual
metamodel_version: 0.14.0
updated: 2026-10-21
parent: null
children: []
superseded_by: null
source_refs: [docs/adr/ADR-0006-roles-and-professions.md, docs/adr/ADR-0009-lifecycle-archive-merge.md, docs/adr/ADR-0011-media-asset.md, schema/0.14.0/m1/relation_type.json]
schema_fragment: schema/0.14.0/m1/relation_type.json
canonical_example: examples/vault/relation-types/author (RTYPE-01J8Z6M4K2Q7V9X3N5B0C1D3B1).md
---

# Сущность: RelationType (`relation_type`)

## 1. Определение

`RelationType` — определение M1 семантики связи между объектами: направление (`direction`),
мощность (`cardinality`), правило уникальности (`uniqueness_rule`), допустимые типы концов
(`subject_types`, `object_types`), человекочитаемые подписи (`forward_label`, `inverse_label`)
и характер ограничения (`is_restriction`: запрет или рекомендация). Экземпляры связей — объекты
системного типа `Relation`. Не является самой связью и не является свойством: «правило повышения»
(X-03, D-0026): устойчивый факт об объекте — категория фасета; факт между объектами или
с атрибутами — `Relation` данного типа.

**Проверка различимости:** заметка является `RelationType`, если её `type: relation_type`,
а `title` — ключ связи (`author`, `portrays`, `member_of`). НЕ является `RelationType`:
конкретная связь («Авторство „Мастера и Маргариты"», `type: relation`), свойство-ссылка
(`cover` — связь без атрибутов хранится свойством объекта; реификация — только `MediaAsset`,
ADR-0011 §3.1).

## 2. Пример из жизни

- `examples/vault/relation-types/author (RTYPE-…3B1).md`: `direction: directed`, субъект —
  `Произведение` (абстрактный: любой наследник), объект — `Человек`, `cardinality: 0..n`,
  `uniqueness_rule: unique_triple`, подписи «автор» / «произведение автора».
- `examples/vault/relation-types/merged_into (RTYPE-…4F3).md`: пустые списки концов —
  «любой → любой» (ADR-0009), `uniqueness_rule: unique_subject` (N:1).
- `examples/vault/relation-types/portrays (RTYPE-…3C1).md`: роль персонажа — не отдельный тип
  связи, а атрибут `role` экземпляра (свойство со словарём `char_role`, ADR-0006 §3.3):
  один тип вместо десятков.
- Контрпример: `examples/vault/relations/Авторство «Мастера и Маргариты» (REL-…3B2).md` —
  экземпляр `Relation`, а не тип.

## 3. Место в классификации

- Слой: **M1**, определение (системный тип ядра).
- Смежные типы и отличия: `Relation` — экземпляр связи (системный тип, форма задана ядром);
  `ObjectType` — концы связи (`subject_types`/`object_types` — только wikilink-ссылки на
  определения; системные типы концами не бывают: `Relation` поверх `MediaAsset` был бы двойной
  реификацией, ADR-0011 §3.1 — поэтому запись D-0067 на `subject_types`/`object_types`
  не распространяется); `Property` — атрибуты экземпляров связи (например, `role`) определяются
  как свойства, применяемые к `Relation`.
- Роль `title` (D-0063): **ключ** (EN snake_case: `author`, `portrays`, `member_of`,
  `supersedes`, `merged_into`, …); подпись — `label`.

## 4. Атрибуты

Сверяется с `schema/0.14.0/m1/relation_type.json`.

| Поле | Тип | Обяз. | Значение по умолчанию | Enum / формат | Описание | Пример |
|---|---|---|---|---|---|---|
| `type` | string | да | — | const `relation_type` | Ветка диспетчеризации | `relation_type` |
| `title` | string | да | — | ключ EN snake_case (схема ограничивает форматом ключа; `n13_relation_type_title_not_key`) | Идентификатор типа связи | `author` |
| `label` | string | да | — | `naming.r10` | Подпись типа | `Автор` |
| `forward_label` | string | нет | — | — | Прямое название связи (читается от субъекта к объекту) | `автор` |
| `inverse_label` | string | нет | — | — | Обратное название | `произведение автора` |
| `direction` | enum | да | — | `directed` \| `symmetric` (закрывает C-29) | Направленность | `directed` |
| `subject_types` | wikilink[] | нет | — | только `ObjectType`; абстрактный = «любой наследник»; пустой/отсутствует = любой тип | Допустимые типы субъекта (`meta.r4`, `relation.r2`) | `[[Произведение (OTYPE-…)\|Произведение]]` |
| `object_types` | wikilink[] | нет | — | то же | Допустимые типы объекта связи (`meta.r4`, `relation.r3`) | `[[Человек (OTYPE-…)\|Человек]]` |
| `cardinality` | enum | да | — | `0..1`, `1`, `0..n`, `1..n` | Мощность экземпляров связи для субъекта | `0..n` |
| `uniqueness_rule` | enum | да | — | `none`, `unique_triple`, `unique_subject`, `unique_object` (закрывает C-28) | Правило уникальности экземпляров; `merged_into` — `unique_subject` (N:1), `supersedes` — `unique_subject` (1:1 по паре) | `unique_triple` |
| `is_restriction` | boolean | нет | false | — | `true` — запрет, `false` — рекомендация («рекомендация ≠ запрет», из черновиков) | `false` |
| `description` | string | нет | — | = `rdfs:comment` | Описание | — |
| `lifecycle` | enum | нет | `standard` | `experimental`, `standard`, `deprecated`, `archived` | Жизненный цикл определения | `standard` |

**Производные поля** (не хранятся, вычисляются):

| Поле | Как вычисляется | Где используется |
|---|---|---|
| список экземпляров типа | выборка `Relation` со ссылкой на данное определение | обратные связи в панели, отчёты |

## 5. Связи

| Связь | Целевой тип | Роль (отсюда) | Обратная роль | Кардинальность | Хранение | Обяз. |
|---|---|---|---|---|---|---|
| `subject_types` | `ObjectType` | допустимый субъект | тип — конец связи | 0..n | frontmatter, wikilink | нет |
| `object_types` | `ObjectType` | допустимый объект | тип — конец связи | 0..n | frontmatter, wikilink | нет |

Обратные (хранятся у экземпляров): `Relation.relation_type` — wikilink на данное определение
(`relation.r1`).

## 6. Enum и справочники

| Enum | Допустимые значения | Семантика | Где определён |
|---|---|---|---|
| `direction` | `directed`, `symmetric` | направленность связи | `schema/0.14.0/common/enums.json` |
| `cardinality` | `0..1`, `1`, `0..n`, `1..n` | мощность | там же |
| `uniqueness_rule` | `none`, `unique_triple`, `unique_subject`, `unique_object` | уникальность экземпляров | там же |
| `lifecycle` | `experimental`, `standard`, `deprecated`, `archived` | жизненный цикл | там же |

## 7. Даты и интервалы

Контрактные `created_at`/`updated_at` — ISO 8601 с offset, закавыченной строкой (D-0065).
Период действия связи — поля экземпляра `Relation` (`valid_from`/`valid_to`, `YYYY-MM-DD`),
не поля типа.

## 8. Ограничения и правила валидации

| ID правила | Уровень | Формулировка (кратко) | Кто проверяет |
|---|---|---|---|
| `contract.r6`, `r11`, `r12` | error/warn | `title` не пуст; имя файла по ключу | схема + песочница |
| `naming.r10` | error | `label` присутствует | схема |
| ключевой формат `title` | error | EN snake_case (ограничение схемы 0.13.0+; фикстура `n13`) | схема |
| `meta.r4` | error | `subject_types`/`object_types` ссылаются на существующие `ObjectType` | песочница |
| `meta.r13` | warn | определение не используется экземплярами `Relation` | песочница |
| `relation.r1` | error | у экземпляра заполнены `subject`, `relation_type`, `object` | песочница |
| `relation.r2`, `r3` | error | типы концов соответствуют спискам (с учётом наследования) | песочница |
| `unique.*` по `uniqueness_rule` | error | уникальность экземпляров (тройка/субъект/объект) | песочница / валидатор |
| `lifecycle.r1…r3` | error/warn | для типов `supersedes`/`merged_into`: цель не архивная, warn на ссылки активных, не более одной связи замены | песочница |

## 9. Идентичность, дубли и слияние

- Ключ идентичности: `id` (ULID). Ключ `title` практически неизменяем: на него опираются
  подписи и выборки; переименование = миграция ссылок всех экземпляров (отложено до после-MVP).
- Два типа об одной семантике (дубли) — ревью `meta.r13`/`classif`-ортогональность не применяется;
  слияние — процедура ADR-0009 с переводом `relation_type` у экземпляров.

## 10. Представления

| Представление | Как отображается | Приоритет (фаза 4, Q-05) |
|---|---|---|
| Создание связи | выбор типа, затем субъект/объект с фильтром по `subject_types`/`object_types` | MVP |
| Панель объекта | связи с `forward_label`/`inverse_label` | MVP |
| Граф/таблицы | рёбра и колонки по типам связей | MVP |

## 11. Пример заметки

```yaml
---
id: 01J8Z6M4K2Q7V9X3N5B0C1D3B1
type: relation_type
title: author
label: Автор
forward_label: автор
inverse_label: произведение автора
direction: directed
subject_types:
  - "[[Произведение (OTYPE-01J8Z6M4K2Q7V9X3N5B0C1D2AA)|Произведение]]"
object_types:
  - "[[Человек (OTYPE-01J8Z6M4K2Q7V9X3N5B0C1D2AD)|Человек]]"
cardinality: 0..n
uniqueness_rule: unique_triple
is_restriction: false
description: "Авторство произведения. Направление задано таблицей 00_overview §7.4: субъект — произведение, объект — человек. Читается связь через подписи: forward_label «автор» относится к объекту связи."
lifecycle: standard
status: active
created_at: "2026-10-21T09:42:00+03:00"
updated_at: "2026-10-21T18:00:00+03:00"
---
```

## 12. Открытые вопросы и расширения

- [ ] Контекстные и зависимые ограничения связей (v1.1 §18.3) — фаза 4 (RULES §16).
- Задел: `trigger_relation_types` у `Aspect` (активация по факту связи) объявлен в схеме
  как поле-задел (A-6), семантика не нормирована.

## 13. История изменений

| Версия документа | Дата | Что изменилось | Решение / ADR |
|---|---|---|---|
| 0.2.0 | 2026-10-21 | Статус `draft` → `actual`: пакетное утверждение пользователем (Q-69 = 3, Q-67 = A); формальная сверка `quality-check` — 0 расхождений; L-1 самопроверка (имена реализации вынесены в указатели на `docs/plugin/ARCHITECTURE.md`); F-3.3 закрыт (D-0074) | D-0074 |
| 0.1.0 | 2026-10-21 | Описание создано по `ENTITY_TEMPLATE` 1.1.0 (фаза 3c, пачка 1) | D-0070 |
