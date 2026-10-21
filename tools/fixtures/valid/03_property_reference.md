---
id: 01J8Z6M4K2Q7V9X3N5B0C1D2B1
type: property
title: publisher
created_at: 2026-10-21T10:00:00Z
updated_at: 2026-10-21T12:30:00Z
status: active
label: Издательство
value_type: reference
target_types:
  - "[[Организация (OTYPE-01J8Z6M4K2Q7V9X3N5B0C1D2AE)|Организация]]"
cardinality: 0..1
required: false
scope: universal
definition: Организация, выпустившая издание.
lifecycle: standard
---

# Property: ссылочное свойство (publisher)

expect: valid

> Проверяет условное ограничение meta.r2: при value_type: reference поле target_types обязательно.

Контрольный пример сгенерирован `tools/fixtures/generate.cjs`. Вручную не правится.
Ожидаемое поведение схемы версии 0.15.0 описано в строке `expect:` выше.
