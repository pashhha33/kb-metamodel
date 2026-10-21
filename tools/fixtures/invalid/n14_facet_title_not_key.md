---
id: 01J8Z6M4K2Q7V9X3N5B0C1D2E2
type: facet
title: Жанр
created_at: 2026-10-21T10:00:00Z
updated_at: 2026-10-21T12:30:00Z
status: active
label: Жанр
key: genre
taxonomy: "[[Произведения (TAX-01J8Z6M4K2Q7V9X3N5B0C1D2E1)|Произведения]]"
---

# Facet: title записан подписью вместо ключа

expect: invalid, errors: /title

> Норма D-0063: title фасета — ключ EN snake_case. Отдельное поле key обязательно, потому что образует имя поля назначений cat_<key> (ADR-0007).

Контрольный пример сгенерирован `tools/fixtures/generate.cjs`. Вручную не правится.
Ожидаемое поведение схемы версии 0.15.0 описано в строке `expect:` выше.
