---
id: 01J8Z6M4K2Q7V9X3N5B0C1D2AC
type: object_type
title: Книга
created_at: 2026-10-21T10:00:00Z
updated_at: 2026-10-21T12:30:00Z
status: active
label: Книга
type_prefix: BOOK
is_abstract: false
layer: domain
properties: []
---

# ObjectType без type_id

expect: invalid, errors: type_id

> ADR-0012 / naming.r12: type_id обязателен — индекс типов строится по полю определения, а не по соответствию префиксов.

Контрольный пример сгенерирован `tools/fixtures/generate.cjs`. Вручную не правится.
Ожидаемое поведение схемы версии 0.15.0 описано в строке `expect:` выше.
