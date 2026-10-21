---
doc: validation-rules-coverage
status: actual
version: 0.13.0
updated: 2026-10-21
metamodel_version: 0.13.0
generated_by: tools/rule-coverage.cjs
adr: [ADR-0001, ADR-0002, ADR-0003, ADR-0005, ADR-0006, ADR-0007, ADR-0008, ADR-0009, ADR-0010, ADR-0011]
decision: [D-0061, D-0062]
---

# Покрытие правил валидации JSON Schema

Документ отвечает на один вопрос: **какие правила каталога обеспечивает машина,
а какие остаются обязанностью валидатора плагина**.

Основание — решение **Q-50 = C (D-0062)**: JSON Schema нормативна для формы объекта и является
источником генерации TypeScript-типов; межобъектные ограничения (ссылочная целостность,
наследование, активация аспектов, уникальность в области действия, соответствие имени файла)
в JSON Schema невыразимы в принципе и реализуются валидатором.

## Политика аннотирования (нормативная)

Аннотация `x-rules` ставится в схеме на поле, перечисление или условие, которое правило
обеспечивает. Значение аннотации — **полное покрытие**: данные, прошедшие схему, не могут
нарушить правило. Три следствия:

1. **Частичное покрытие не аннотируется.** Если схема отсекает грубые нарушения, а тонкие
   требуют индекса хранилища, правило попадает в список «только валидатор», а частичное
   покрытие описывается в `x-notes` поля и в `SCHEMA_VALIDATION_REPORT.md` §4.
   Пример: `meta.r5` требует непустого `applicable_types` (схема) **и** разрешимости ссылок
   (валидатор) → правило в списке валидатора, `minItems: 1` описан в `x-notes`.
2. **Два исключения из п.1 — соглашения каталога**, а не ограничения схемы:
   - `format.r2` («значения всех enum-полей входят в справочники») аннотируется на определениях
     перечислений в `common/enums.json`: каждое поле схемы, чьё значение является enum,
     ссылается на эти определения.
   - `meta.r1` (`value_type` — значение из закрытого набора 6) аннотируется на `enums.json#/$defs/value_type`.
     Исходная формулировка говорит о «существующем `PropertyType`», но объекты `PropertyType` —
     устаревший механизм (находка F-3.2), поэтому правило обеспечено перечислением.
3. **Пропустить правило молча нельзя.** Скрипт сверяет аннотации с каталогом: правило из каталога
   без аннотации автоматически попадает в список «только валидатор» с указанием причины,
   а аннотация на правило, которого в каталоге нет, приводит к ненулевому коду возврата.

## Что даёт покрытие схемой, а что нет

| Обеспечивает схема | Обеспечивает только валидатор |
|---|---|
| Присутствие обязательных полей, типы значений, границы строк | Существование цели ссылки, тип цели |
| Закрытые перечисления (`status`, `value_type`, `cardinality`, `mechanism`, `trigger`, роли и классы медиа) | Уникальность: `id`, `key`, `type_prefix`, названия категорий |
| Форматы: ULID, `type_prefix`, `Facet.key`, `Property.key` (включая запрет зарезервированных префиксов) | Циклы: `Category.parent`, `ObjectType.parent_type` |
| Условные ограничения внутри одного объекта: `naming.r7`, `sequence.r1`, `meta.r2`, `meta.r3` | Наследование: допустимость ужесточений, эффективный набор свойств |
| Запрет `definition` и `value_type` в `property_overrides` (`inherit.r1`, `inherit.r2`) | Активация аспектов, конфликты аспектов |
| Непустота списков там, где она нормативна (`trigger_categories`, `properties` аспекта, `applicable_types`, `View.target_types`) | Соответствие имени файла и `id`, усечение `title` |
| Запрет дублирования `aliases` внутри объекта | Всё, что сравнивает два объекта или требует состояния хранилища |

## Команды

| Команда | Действие |
|---|---|
| `npm run schema:coverage` | пересчитать покрытие, перезаписать генерируемый раздел и `rules-coverage.json` |
| `npm run schema:bundle` | собрать производный единый файл схемы из раздельных фрагментов (Q-49 = B) |
| `npm run schema:types` | перегенерировать `src/generated/metamodel-<version>.types.ts` из схемы |
| `npm run fixtures` | пересоздать контрольные примеры песочницы |
| `npm run schema:validate` | прогнать контрольные примеры через схему и сверить с ожиданиями |
| `npm run schema:all` | всё перечисленное по порядку |

<!-- BEGIN GENERATED: rule-coverage (tools/rule-coverage.cjs) -->
> Раздел сгенерирован `tools/rule-coverage.cjs`. Все числа пересчитаны программно, а не вписаны вручную.

Схема версии **0.15.0** (17 файлов), каталог правил — `docs/validation/RULES.md`.

## Покрытие по группам

| Группа | Всего | error | warn | info | Покрывает схема | Только валидатор |
|---|---|---|---|---|---|---|
| `contract` | 12 | 10 | 2 | 0 | 6 | 6 |
| `naming` | 13 | 13 | 0 | 0 | 7 | 6 |
| `format` | 3 | 2 | 0 | 1 | 2 | 1 |
| `property` | 7 | 6 | 1 | 0 | 0 | 7 |
| `link` | 6 | 4 | 2 | 0 | 1 | 5 |
| `relation` | 8 | 6 | 2 | 0 | 1 | 7 |
| `classif` | 12 | 8 | 4 | 0 | 0 | 12 |
| `inherit` | 7 | 6 | 1 | 0 | 2 | 5 |
| `aspect` | 6 | 3 | 2 | 1 | 1 | 5 |
| `meta` | 16 | 14 | 2 | 0 | 7 | 9 |
| `view` | 2 | 1 | 1 | 0 | 0 | 2 |
| `alias` | 3 | 1 | 2 | 0 | 1 | 2 |
| `lifecycle` | 5 | 2 | 2 | 1 | 0 | 5 |
| `sequence` | 6 | 5 | 1 | 0 | 2 | 4 |
| `unique` | 2 | 2 | 0 | 0 | 0 | 2 |
| `media` | 9 | 3 | 5 | 1 | 1 | 8 |
| **Итого** | **117** | **86** | **27** | **4** | **31** | **86** |

## Итог

- Всего правил в каталоге: **117** (86 error, 27 warn, 4 info).
- Полностью покрывает JSON Schema: **31** (30 error, 0 warn, 1 info) — **26 %** каталога.
- Остаются обязанностью валидатора: **86** (56 error, 27 warn, 3 info).
- Из 86 правил уровня error схема обеспечивает **30**; 56 проверяются только валидатором. Это прямое следствие решения Q-50 = C (D-0062): межобъектные ограничения в JSON Schema невыразимы.

## Правила, которые покрывает схема (31)

| ID | Уровень | Файлы схемы с аннотацией |
|---|---|---|
| `contract.r1` | error | `schema/0.15.0/common/system_contract.json` |
| `contract.r2` | error | `schema/0.15.0/common/formats.json` |
| `contract.r4` | error | `schema/0.15.0/common/m0_instance.json` |
| `contract.r6` | error | `schema/0.15.0/common/system_contract.json` |
| `contract.r7` | error | `schema/0.15.0/common/system_contract.json` |
| `contract.r8` | error | `schema/0.15.0/common/enums.json` |
| `naming.r1` | error | `schema/0.15.0/common/formats.json` |
| `naming.r2` | error | `schema/0.15.0/common/formats.json` |
| `naming.r4` | error | `schema/0.15.0/common/formats.json` |
| `naming.r5` | error | `schema/0.15.0/common/formats.json` |
| `naming.r7` | error | `schema/0.15.0/m1/object_type.json` |
| `naming.r8` | error | `schema/0.15.0/common/formats.json` |
| `naming.r12` | error | `schema/0.15.0/m1/object_type.json` |
| `format.r1` | error | `schema/0.15.0/common/enums.json`, `schema/0.15.0/m1/property.json` |
| `format.r2` | error | `schema/0.15.0/common/enums.json` |
| `link.r4` | error | `schema/0.15.0/common/formats.json` |
| `relation.r1` | error | `schema/0.15.0/m1/relation.json` |
| `inherit.r1` | error | `schema/0.15.0/m1/object_type.json` |
| `inherit.r2` | error | `schema/0.15.0/m1/object_type.json` |
| `aspect.r6` | info | `schema/0.15.0/m1/aspect.json` |
| `meta.r1` | error | `schema/0.15.0/common/enums.json` |
| `meta.r2` | error | `schema/0.15.0/m1/property.json` |
| `meta.r3` | error | `schema/0.15.0/m1/property.json` |
| `meta.r5` | error | `schema/0.15.0/m1/taxonomy.json` |
| `meta.r7` | error | `schema/0.15.0/m1/view.json` |
| `meta.r8` | error | `schema/0.15.0/common/enums.json`, `schema/0.15.0/m1/automation.json` |
| `meta.r16` | error | `schema/0.15.0/m1/property.json` |
| `alias.r3` | error | `schema/0.15.0/common/system_contract.json` |
| `sequence.r1` | error | `schema/0.15.0/m1/object_type.json` |
| `sequence.r6` | error | `schema/0.15.0/m1/object_type.json` |
| `media.r2` | error | `schema/0.15.0/common/enums.json`, `schema/0.15.0/m1/media_asset.json` |

## Правила только валидатора (86)

Причина — в комментарии. «Межобъектное» означает, что проверка требует индекса хранилища,
разрешения ссылок или сравнения нескольких объектов, чего JSON Schema не умеет (D-0062).

| ID | Уровень | Причина |
|---|---|---|
| `contract.r3` | error | Межобъектное: уникальность id в хранилище |
| `contract.r5` | error | Требует индекса типов: абстрактность типа хранится в определении ObjectType |
| `contract.r9` | warn | Сравнение двух полей с приведением форматов даты |
| `contract.r10` | error | Требует имени файла: схема проверяет только frontmatter |
| `contract.r11` | error | Требует имени файла: соответствие шаблону {title} ({PREFIX}-{id}).md |
| `contract.r12` | warn | Требует имени файла: усечение title до 60 символов |
| `naming.r3` | error | Межобъектное: уникальность key среди всех Property |
| `naming.r6` | error | Межобъектное: уникальность type_prefix по реестру |
| `naming.r9` | error | Межобъектное: глобальная уникальность Facet.key |
| `naming.r10` | error | Межобъектная уникальность |
| `naming.r11` | error | Требует имени бинарного файла, а не frontmatter |
| `naming.r13` | error | Межобъектная уникальность |
| `format.r3` | info | Уровень info: схема допускает Z как результат сериализации Obsidian |
| `property.r1` | error | Требует эффективного набора свойств типа (алгоритм ADR-0008 §3.3) |
| `property.r2` | error | Мощность значения зависит от cardinality свойства: производная схема типа |
| `property.r3` | error | Соответствие значения value_type: производная схема типа |
| `property.r4` | error | Значение allowed_values известно только из определения Property |
| `property.r5` | error | Требует эффективного набора свойств типа и активированных аспектов |
| `property.r6` | warn | Требует назначенных категорий и состава аспектов |
| `property.r7` | error | Сравнение переопределения с определением свойства |
| `link.r1` | error | Разрешение ссылки по индексу хранилища |
| `link.r2` | error | Требует типа цели ссылки |
| `link.r3` | error | Требует фасета категории-цели |
| `link.r5` | warn | Сравнение подписи ссылки с актуальным title цели |
| `link.r6` | warn | Неоднозначность разрешения: несколько файлов на одну стабильную часть |
| `relation.r2` | error | Требует типа субъекта и состава subject_types |
| `relation.r3` | error | Требует типа объекта и состава object_types |
| `relation.r4` | error | Межобъектное: правило уникальности экземпляров отношения |
| `relation.r5` | error | Межобъектное: наличие обратной связи при direction: symmetric |
| `relation.r6` | error | Межобъектное: связь не должна существовать в двух формах |
| `relation.r7` | warn | Сравнение фактических типов с рекомендацией RelationType |
| `relation.r8` | warn | Сравнение двух полей с приведением форматов даты |
| `classif.r1` | error | Разрешение ссылки на фасет |
| `classif.r2` | error | Требует таксономию категории и applicable_types |
| `classif.r3` | error | Длина списка cat_<key> против assignment_cardinality фасета |
| `classif.r4` | error | Требует индекса классификации |
| `classif.r5` | error | Межобъектное: цикл в Category.parent |
| `classif.r6` | warn | Межобъектное: число корневых категорий фасета |
| `classif.r7` | warn | Межобъектное: мёртвая категория |
| `classif.r8` | error | Межобъектное: уникальность названия в пределах фасета |
| `classif.r9` | warn | Межобъектное: одинаковое название в разных фасетах таксономии |
| `classif.r10` | error | Требует индекса классификации |
| `classif.r11` | error | Требует фасета категории-цели |
| `classif.r12` | warn | Межобъектное: поле cat_* без соответствующего фасета |
| `inherit.r3` | error | Сравнение с унаследованным определением свойства |
| `inherit.r4` | error | Сравнение с унаследованным определением свойства |
| `inherit.r5` | error | Межобъектное: цикл в parent_type |
| `inherit.r6` | error | Разрешение ссылки на родительский тип |
| `inherit.r7` | warn | Межобъектное: глубина иерархии типов |
| `aspect.r1` | warn | Требует назначенных категорий и состава аспектов |
| `aspect.r2` | error | Межобъектное: конфликт двух активированных аспектов (error при загрузке) |
| `aspect.r3` | error | Разрешение ссылок trigger_categories и проверка типа цели |
| `aspect.r4` | error | Разрешение ссылок properties и проверка типа цели |
| `aspect.r5` | warn | Сравнение с ограничением, заданным типом объекта |
| `meta.r4` | error | Разрешение ссылок subject_types и object_types |
| `meta.r6` | error | Разрешение ссылок Facet.taxonomy и Category.facet |
| `meta.r9` | error | Разрешение ссылок |
| `meta.r10` | error | Разрешение ссылок |
| `meta.r11` | warn | Межобъектное: deprecated, но используется объектами |
| `meta.r12` | error | Межобъектное: уникальность id среди определений M1 |
| `meta.r13` | warn | Межобъектное: неиспользуемое определение |
| `meta.r14` | error | Требует состава свойств типа: плейсхолдеры {key} в title_template |
| `meta.r15` | error | Разрешение ссылок |
| `view.r1` | error | Требует состава целевого типа |
| `view.r2` | warn | Требует состава свойств целевого типа |
| `alias.r1` | warn | Сравнение с title: нормализация пробелов и регистра |
| `alias.r2` | warn | Межобъектное: один псевдоним у нескольких объектов |
| `lifecycle.r1` | error | Межобъектное: статус цели связи supersedes / merged_into |
| `lifecycle.r2` | warn | Межобъектное: ссылки активных объектов на архивный |
| `lifecycle.r3` | error | Межобъектное: число исходящих связей замены |
| `lifecycle.r4` | warn | Требует состояния хранилища: файл существует, ссылки не переведены |
| `lifecycle.r5` | info | Уровень info: необычный переход статуса |
| `sequence.r2` | error | Требует определения свойства: value_type и cardinality |
| `sequence.r3` | error | Требует определения свойства: value_type и cardinality |
| `sequence.r4` | error | Проверяется на объекте M0, требует производной схемы типа |
| `sequence.r5` | warn | Межобъектное: разрыв нумерации между соседями |
| `unique.r1` | error | Межобъектное: уникальность пары (область, значение) в хранилище |
| `unique.r2` | error | Требует эффективного набора свойств типа |
| `media.r1` | error | Требует хранилища: файл существует |
| `media.r3` | error | Разрешение ссылок galleries и проверка типа цели |
| `media.r4` | warn | Межобъектное: обёртка-сирота |
| `media.r5` | warn | Сравнение ролей обёртки с expected_media_roles свойства |
| `media.r6` | warn | Межобъектное: один файл у нескольких обёрток |
| `media.r7` | warn | Число галерей: пороговая проверка warn |
| `media.r8` | info | Уровень info: файл вложения без обёртки — норма |
| `media.r9` | warn | Требует имени бинарного файла |
<!-- END GENERATED: rule-coverage -->
