---
doc: schema-validation-run
status: actual
version: 0.13.0
updated: 2026-10-21
metamodel_version: 0.13.0
generated_by: tools/validate.cjs
decision: [D-0061, D-0062]
---

# Прогон контрольных примеров через JSON Schema

Документ фиксирует **результат последней автоматической проверки схемы**: какие контрольные
примеры прогнаны, что ожидалось и что получилось. Раздел между маркерами генерируется
скриптом `tools/validate.cjs` и руками не правится.

## Что проверяется и что нет

| Проверяется | Не проверяется |
|---|---|
| Форма объекта frontmatter: обязательные поля, типы значений, закрытые перечисления, регулярные выражения (ULID, префикс, ключ фасета, ключ свойства) | Ссылочная целостность: существование цели ссылки |
| Условные ограничения, выраженные в схеме: `naming.r7` (префикс и абстрактность), `sequence.r1` (пара полей последовательности), `meta.r2` (`target_types` при `reference`), `meta.r3` (`target_facet` только при `target_types: [category]`), `meta.r5` (непустой `applicable_types`) | Всё, что требует индекса хранилища, разрешения ссылок или сравнения нескольких объектов |
| Диспетчеризация по `type`: 12 системных типов M1 + конверт экземпляра M0, включая пользовательские типы как данные | Правила, отнесённые к валидатору (86 из 114 — см. `RULES_COVERAGE.md`) |

Контрольные примеры лежат в `tools/fixtures/` и **генерируются** скриптом
`tools/fixtures/generate.cjs`: идентификаторы ULID и ссылки со стабильной частью
`(PREFIX-ULID)` должны быть согласованы между примерами, а руками их легко написать
с ошибкой (в примерах ADR использованы 28-символьные «ULID» — находка F-3.14).

Канонические примеры заметок для хранилища создаются отдельно в фазе 3b в каталоге
`examples/`. Контрольные примеры — это входы схемы, а не содержимое хранилища.

## Как воспроизвести

```bash
npm install                 # зависимости только для сборки артефактов, сеть в рантайме плагина не нужна
npm run schema:all          # bundle → types → coverage → fixtures → validate
```

<!-- BEGIN GENERATED: validation-run (tools/validate.cjs) -->
> Прогон выполнен `tools/validate.cjs` (Node 20.20.2, AJV 8.20.0). Дата: 2026-10-21.

Схема: `schema/dist/metamodel-0.15.0.bundle.json` (производная от 16 фрагментов).

**Итог: 34 из 34 примеров прошли, 0 провалено.**

| Пример | Ожидание | Результат | Комментарий |
|---|---|---|---|
| `tools/fixtures/invalid/n01_bad_ulid.md` | invalid | ✅ | ожидаемо отклонено: /id must match pattern "^[0-9A-HJKMNP-TV-Z]{26}$"; (корень) must have required property 'type_id'; (корень) must have required property 'label' |
| `tools/fixtures/invalid/n02_missing_title.md` | invalid | ✅ | ожидаемо отклонено: (корень) must have required property 'title'; (корень) must have required property 'type_id'; (корень) must have required property 'label' |
| `tools/fixtures/invalid/n03_unknown_status.md` | invalid | ✅ | ожидаемо отклонено: /status must be equal to one of the allowed values; (корень) must have required property 'type_id'; (корень) must have required property 'label' |
| `tools/fixtures/invalid/n04_abstract_with_prefix.md` | invalid | ✅ | ожидаемо отклонено: /type_prefix must be null; (корень) must match "then" schema; /type must be equal to constant |
| `tools/fixtures/invalid/n05_concrete_bad_prefix.md` | invalid | ✅ | ожидаемо отклонено: /type_prefix must match pattern "^[A-Z][A-Z0-9]{2,11}$"; /type_prefix must be null; /type_prefix must match exactly one schema in oneOf |
| `tools/fixtures/invalid/n06_sequence_unpaired.md` | invalid | ✅ | ожидаемо отклонено: (корень) must have property sequence_key when property sequential_parent is present; (корень) must have required property 'type_id'; /type must be equal to constant |
| `tools/fixtures/invalid/n07_property_reference_without_target.md` | invalid | ✅ | ожидаемо отклонено: (корень) must have required property 'type_id'; (корень) must have required property 'type_prefix'; (корень) must have required property 'is_abstract' |
| `tools/fixtures/invalid/n08_property_target_facet_misuse.md` | invalid | ✅ | ожидаемо отклонено: (корень) must have required property 'type_id'; (корень) must have required property 'type_prefix'; (корень) must have required property 'is_abstract' |
| `tools/fixtures/invalid/n09_taxonomy_empty_applicable_types.md` | invalid | ✅ | ожидаемо отклонено: (корень) must have required property 'type_id'; (корень) must have required property 'type_prefix'; (корень) must have required property 'is_abstract' |
| `tools/fixtures/invalid/n10_media_bad_kind.md` | invalid | ✅ | ожидаемо отклонено: (корень) must have required property 'type_id'; (корень) must have required property 'label'; (корень) must have required property 'type_prefix' |
| `tools/fixtures/invalid/n11_m0_type_collides_with_m1.md` | invalid | ✅ | ожидаемо отклонено: (корень) must have required property 'type_id'; (корень) must have required property 'label'; (корень) must have required property 'type_prefix' |
| `tools/fixtures/invalid/n12_facet_reserved_key.md` | invalid | ✅ | ожидаемо отклонено: (корень) must have required property 'type_id'; (корень) must have required property 'type_prefix'; (корень) must have required property 'is_abstract' |
| `tools/fixtures/invalid/n13_relation_type_title_not_key.md` | invalid | ✅ | ожидаемо отклонено: (корень) must have required property 'type_id'; (корень) must have required property 'type_prefix'; (корень) must have required property 'is_abstract' |
| `tools/fixtures/invalid/n14_facet_title_not_key.md` | invalid | ✅ | ожидаемо отклонено: (корень) must have required property 'type_id'; (корень) must have required property 'type_prefix'; (корень) must have required property 'is_abstract' |
| `tools/fixtures/invalid/n15_aspect_bad_layer.md` | invalid | ✅ | ожидаемо отклонено: (корень) must have required property 'type_id'; (корень) must have required property 'type_prefix'; (корень) must have required property 'is_abstract' |
| `tools/fixtures/invalid/n16_object_type_without_type_id.md` | invalid | ✅ | ожидаемо отклонено: (корень) must have required property 'type_id'; /type must be equal to constant; /title must be equal to one of the allowed values |
| `tools/fixtures/valid/01_object_type_abstract.md` | valid | ✅ | — |
| `tools/fixtures/valid/02_object_type_sequence.md` | valid | ✅ | — |
| `tools/fixtures/valid/03_property_reference.md` | valid | ✅ | — |
| `tools/fixtures/valid/04_property_number_unique_within.md` | valid | ✅ | — |
| `tools/fixtures/valid/05_property_type_legacy.md` | valid | ✅ | — |
| `tools/fixtures/valid/06_relation_type.md` | valid | ✅ | — |
| `tools/fixtures/valid/07_relation_instance.md` | valid | ✅ | — |
| `tools/fixtures/valid/08_taxonomy.md` | valid | ✅ | — |
| `tools/fixtures/valid/09_facet.md` | valid | ✅ | — |
| `tools/fixtures/valid/10_category_root.md` | valid | ✅ | — |
| `tools/fixtures/valid/11_category_child.md` | valid | ✅ | — |
| `tools/fixtures/valid/12_media_asset.md` | valid | ✅ | — |
| `tools/fixtures/valid/13_view.md` | valid | ✅ | — |
| `tools/fixtures/valid/14_automation.md` | valid | ✅ | — |
| `tools/fixtures/valid/15_aspect.md` | valid | ✅ | — |
| `tools/fixtures/valid/16_m0_book.md` | valid | ✅ | — |
| `tools/fixtures/valid/17_m0_chapter.md` | valid | ✅ | — |
| `tools/fixtures/valid/18_m0_custom_type.md` | valid | ✅ | — |
<!-- END GENERATED: validation-run -->
