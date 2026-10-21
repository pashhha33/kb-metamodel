---
id: 01J8Z6M4K2Q7V9X3N5B0C1D2B5
type: property
title: role
created_at: 2026-10-21T10:00:00Z
updated_at: 2026-10-21T12:30:00Z
status: active
label: Роль
value_type: text
cardinality: 0..1
required: false
scope: specific
target_facet: "[[Жанр (FACET-01J8Z6M4K2Q7V9X3N5B0C1D2E2)|Жанр]]"
---

# target_facet при value_type: text

expect: invalid, errors: target_facet

> meta.r3: target_facet задан только при target_types: [category]. Здесь value_type: text — поле недопустимо.

Контрольный пример сгенерирован `tools/fixtures/generate.cjs`. Вручную не правится.
Ожидаемое поведение схемы версии 0.14.0 описано в строке `expect:` выше.
