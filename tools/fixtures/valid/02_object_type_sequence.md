---
id: 01J8Z6M4K2Q7V9X3N5B0C1D2AB
type: object_type
title: Глава
created_at: 2026-10-21T10:00:00Z
updated_at: 2026-10-21T12:30:00Z
status: active
type_id: chapter
label: Глава
type_prefix: CHAP
is_abstract: false
layer: domain
parent_type: "[[Произведение (OTYPE-01J8Z6M4K2Q7V9X3N5B0C1D2AA)|Произведение]]"
properties:
  - "[[part_of (PROP-01J8Z6M4K2Q7V9X3N5B0C1D2B2)|Часть произведения]]"
  - "[[order (PROP-01J8Z6M4K2Q7V9X3N5B0C1D2B3)|Порядковый номер]]"
property_overrides:
  - property: "[[order (PROP-01J8Z6M4K2Q7V9X3N5B0C1D2B3)|order]]"
    required: true
    cardinality: "1"
sequential_parent: "[[part_of (PROP-01J8Z6M4K2Q7V9X3N5B0C1D2B2)|part_of]]"
sequence_key: "[[order (PROP-01J8Z6M4K2Q7V9X3N5B0C1D2B3)|order]]"
sequence_step: 10
sequence_direction: ascending
title_template: Глава {order}
lifecycle: standard
---

# ObjectType: конкретный тип-последовательность (Chapter)

expect: valid

> Проверяет пару sequential_parent + sequence_key (sequence.r1), sequence_step > 0 (sequence.r6) и property_overrides с ужесточением.

Контрольный пример сгенерирован `tools/fixtures/generate.cjs`. Вручную не правится.
Ожидаемое поведение схемы версии 0.15.0 описано в строке `expect:` выше.
