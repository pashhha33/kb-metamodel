---
id: 01J8Z6M4K2Q7V9X3N5B0C1D2D1
type: relation_type
title: author
created_at: 2026-10-21T10:00:00Z
updated_at: 2026-10-21T12:30:00Z
status: active
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
---

# RelationType: автор

expect: valid

> subject_types ссылается на абстрактный тип в значении «любой наследник» (ADR-0005).

Контрольный пример сгенерирован `tools/fixtures/generate.cjs`. Вручную не правится.
Ожидаемое поведение схемы версии 0.15.0 описано в строке `expect:` выше.
