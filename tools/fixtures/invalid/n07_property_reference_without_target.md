---
id: 01J8Z6M4K2Q7V9X3N5B0C1D2B4
type: property
title: cover
created_at: 2026-10-21T10:00:00Z
updated_at: 2026-10-21T12:30:00Z
status: active
label: Обложка
value_type: reference
cardinality: 0..1
required: false
scope: specific
---

# Ссылочное свойство без target_types

expect: invalid, errors: target_types

> meta.r2: при value_type: reference поле target_types обязательно. Пустой список означает «любой тип», отсутствие поля — нарушение.

Контрольный пример сгенерирован `tools/fixtures/generate.cjs`. Вручную не правится.
Ожидаемое поведение схемы версии 0.14.0 описано в строке `expect:` выше.
