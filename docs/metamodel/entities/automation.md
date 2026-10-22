---
doc: entity
entity: Automation
type_id: automation
status: actual
metamodel_version: 0.15.0
updated: 2026-10-21
parent: null
children: []
superseded_by: null
source_refs: [docs/adr/ADR-0010-sequences-and-creation-form.md, docs/metamodel/NAME_MAPPING.md, schema/0.15.0/m1/automation.json]
schema_fragment: schema/0.15.0/m1/automation.json
canonical_example: examples/vault/automations/create_chapter (AUTO-01J8Z6M4K2Q7V9X3N5B0C1D5A3).md
---

# Сущность: Automation (`automation`)

## 1. Определение

`Automation` — определение M1 **автоматизируемого действия**: триггер (`trigger` — абстрактный
идентификатор без названий инструментов, L-1/D-0057), механизм (`mechanism`), целевые типы
(`target_types`), необязательное сужение и порядок полей формы создания (`form_fields`),
значения по умолчанию (`defaults`, включая служебные плейсхолдеры) и признак активности.
Базовая форма создания **выводится из типа** (ADR-0010 §2.2): `Automation` не заменяет вывод,
а сужает и упорядочивает поля, добавляет умолчания. Отдельные типы `Sequence` и `Form`
отклонены (ADR-0010): последовательности объявляются на `ObjectType`, форма — `Automation`.

**Проверка различимости:** заметка является `Automation`, если её `type: automation` и заполнены
`trigger`, `mechanism`, `is_active`. НЕ является `Automation`: сам тип с полями
последовательности (`ObjectType.sequential_parent`/`sequence_key` — механизм типа, не действие),
шаблон внешнего плагина (интеграции — матрица ARCHITECTURE), `View` (отображение, не действие).

## 2. Пример из жизни

- `examples/vault/automations/create_chapter (AUTO-…5A3).md`: `trigger: manual`, цель — тип
  `Глава`; `form_fields` сужает форму до `part_of`, `order` и `sys:title` (адресация поля
  системного контракта — NAME_MAPPING §7.2; wikilink-запись `sys`-поля отклоняется, F-3.13);
  `defaults: {order: "{next_sequence}", status: draft}` — номер вычисляется из последовательности
  типа (ADR-0010 §2.2); `require_confirmation: true` — файл не появляется без явного подтверждения.
- Контрпример: `title_template: "Глава {order}"` в определении типа `Глава` — шаблон заголовка
  принадлежит типу, а не автоматизации (ADR-0010 §2.1).

## 3. Место в классификации

- Слой: **M1**, определение (системный тип ядра).
- Смежные типы и отличия: `ObjectType` — цель (`target_types`) и источник базовой формы;
  `Property` — элементы `form_fields` (только свойства целевого типа либо `sys:`-поля,
  `meta.r15`); `View` — общий enum `mechanism`, разная роль (действие vs отображение).
- Роль `title` (D-0063): **ключ** (EN snake_case: `create_chapter`); подпись — `label`;
  имя файла строится по ключу (`contract.r11`).

## 4. Атрибуты

Сверяется с `schema/0.15.0/m1/automation.json` (закрытый словарь полей, A-2).

| Поле | Тип | Обяз. | Значение по умолчанию | Enum / формат | Описание | Пример |
|---|---|---|---|---|---|---|
| `type` | string | да | — | const `automation` | Ветка диспетчеризации | `automation` |
| `title` | string | да | — | ключ EN snake_case (D-0063) | Идентификатор автоматизации | `create_chapter` |
| `label` | string | да | — | `naming.r10` | Подпись в UI | `Создать главу` |
| `trigger` | enum | да | — | `manual`, `on_create`, `on_update`, `scheduled` — абстрактные идентификаторы (D-0057); `meta.r8` | Когда срабатывает; в MVP реализуется `manual` (форма создания), событийные — по плану фазы 5 | `manual` |
| `mechanism` | enum | да | — | общий enum с `View` (`meta.r8`) | Механизм выполнения | `custom` |
| `target_types` | wikilink[] | нет | — | только на `ObjectType` | Типы, к которым применяется | `[[Глава (OTYPE-…)\|Глава]]` |
| `form_fields` | (wikilink \| sys_field)[] | нет | все обязательные поля типа | элементы — ссылки на `Property` целевого типа либо `sys:<поле>` (`meta.r15`; wikilink-запись `sys`-поля отклоняется, F-3.13) | Сужение и порядок полей формы (ADR-0010 §3.3) | `[part_of, order, sys:title]` |
| `defaults` | object | нет | — | ключи — поля формы; значения — литералы или плейсхолдеры `{…}` | Значения по умолчанию; `{next_sequence}` — следующий номер последовательности (ADR-0010 §2.2) | `order: "{next_sequence}"` |
| `require_confirmation` | boolean | нет | `true` | — | Задел (A-6): подтверждение перед созданием; файл не появляется без явного действия | `true` |
| `is_active` | boolean | да | — | — | Выключенная автоматизация сохраняется, но не применяется | `true` |
| `description` | string | нет | — | = `rdfs:comment` | Описание | — |
| `lifecycle` | enum | нет | `standard` | `experimental`, `standard`, `deprecated`, `archived` | Жизненный цикл определения | `standard` |

**Производные поля** (не хранятся, вычисляются):

| Поле | Как вычисляется | Где используется |
|---|---|---|
| базовая форма | эффективный набор свойств целевого типа (алгоритм ADR-0008 §3.3) минус `form_fields`-сужение | форма создания |
| следующий номер | максимум `sequence_key` среди соседей по `sequential_parent` + `sequence_step` (вставка между = среднее, ADR-0010 §2.2) | подстановка `{next_sequence}` |

## 5. Связи

| Связь | Целевой тип | Роль (отсюда) | Обратная роль | Кардинальность | Хранение | Обяз. |
|---|---|---|---|---|---|---|
| `target_types` | `ObjectType` | применяется к типу | тип имеет автоматизации (вычисляется) | 0..n | frontmatter, wikilink | нет |
| `form_fields` | `Property` / `sys:`-поле | поле формы | свойство используется в форме | 0..n, порядок значим | frontmatter, wikilink / `sys:` | нет |

## 6. Enum и справочники

| Enum | Допустимые значения | Семантика | Где определён |
|---|---|---|---|
| `trigger` | `manual`, `on_create`, `on_update`, `scheduled` | абстрактный триггер; названия инструментов запрещены (D-0057) | `schema/0.15.0/common/enums.json` |
| `mechanism` | `bases`, `table`, `card`, `kanban`, `graph`, `query`, `custom` | абстрактный механизм | там же |
| `sys_field` | `sys:id`, `sys:type`, `sys:title`, `sys:aliases`, `sys:created_at`, `sys:updated_at`, `sys:status`, `sys:tags` | адресация полей контракта в `form_fields` | `schema/0.15.0/common/formats.json`, NAME_MAPPING §7.2 |

## 7. Даты и интервалы

Контрактные `created_at`/`updated_at` — ISO 8601 с offset, закавыченной строкой (D-0065).
`scheduled`-триггер (расписание) в MVP не реализуется; формат расписания — задел.

## 8. Ограничения и правила валидации

| ID правила | Уровень | Формулировка (кратко) | Кто проверяет |
|---|---|---|---|
| `meta.r8` | error | `trigger` и `mechanism` входят в enum | схема |
| `meta.r15` | error | элементы `form_fields` разрешимы и принадлежат целевому типу либо являются `sys`-полями | схема (формат `sys:`) + песочница |
| `contract.r6`, `r11`, `r12` | error/warn | `title` не пуст; имя файла по ключу | схема + песочница |
| `naming.r10` | error | `label` присутствует | схема |
| `meta.r13` | warn | определение не используется (неактивно и нет обращений) | песочница |
| `meta.r14` | error | плейсхолдеры `{key}` в `title_template` типа соответствуют свойствам — проверяется на `ObjectType`, но используется формой (`defaults` оперируют теми же ключами) | песочница |

## 9. Идентичность, дубли и слияние

- Ключ идентичности: `id` (ULID); ключ `title` практически неизменяем (на него опирается вызов).
- Дубль (две автоматизации одного типа с равными `form_fields`) — ревью; слияние — ADR-0009.

## 10. Представления

| Представление | Как отображается | Приоритет (фаза 4, Q-05) |
|---|---|---|
| Команда/кнопка создания | `label` в палитре команд и в контекстном меню типа | MVP |
| Форма создания | модалка: поля в порядке `form_fields`, предзаполнение `defaults`, подтверждение | MVP |

## 11. Пример заметки

```yaml
---
id: 01J8Z6M4K2Q7V9X3N5B0C1D5A3
type: automation
title: create_chapter
label: Создать главу
trigger: manual
mechanism: custom
target_types:
  - "[[Глава (OTYPE-01J8Z6M4K2Q7V9X3N5B0C1D5A1)|Глава]]"
form_fields:
  - "[[part_of (PROP-01J8Z6M4K2Q7V9X3N5B0C1D5A2)|part_of]]"
  - "[[order (PROP-01J8Z6M4K2Q7V9X3N5B0C1D2B3)|order]]"
  - sys:title
defaults:
  order: "{next_sequence}"
  status: draft
require_confirmation: true
is_active: true
description: "Форма создания главы: родительский объект, номер, имя. Имя можно пропустить — тогда заголовок вычисляется из шаблона типа (ADR-0010 §2.1, §3.4)."
lifecycle: standard
status: active
created_at: "2026-10-21T10:30:00+03:00"
updated_at: "2026-10-21T18:00:00+03:00"
---
```

## 12. Открытые вопросы и расширения

- [x] **F-3.13** — закрыто: каноническая запись `sys:`-поля в `form_fields` — `sys:title`
      (NAME_MAPPING §7.2); wikilink-запись отклоняется (пример `03_chapter_scenario` исправлен
      в фазе 3b).
- [ ] Реестр плейсхолдеров `defaults`: нормирован `{next_sequence}` (ADR-0010 §2.2); прочие
      (`{today}`, `{id}` и т.п.) — расширение через реестр решений по потребности фазы 5.
- [ ] Событийные триггеры (`on_create`, `on_update`) и `scheduled` — enum объявлен, реализация
      и семантика очереди — план фазы 5 (ROADMAP, фаза 4).

## 13. История изменений

| Версия документа | Дата | Что изменилось | Решение / ADR |
|---|---|---|---|
| 0.2.0 | 2026-10-21 | Статус `draft` → `actual`: пакетное утверждение пользователем (Q-69 = 3, Q-67 = A); формальная сверка `quality-check` — 0 расхождений; L-1 самопроверка (имена реализации вынесены в указатели на `docs/plugin/ARCHITECTURE.md`); F-3.3 закрыт (D-0074) | D-0074 |
| 0.1.0 | 2026-10-21 | Описание создано по `ENTITY_TEMPLATE` 1.1.0 (фаза 3c, пачка 3) | D-0070 |
