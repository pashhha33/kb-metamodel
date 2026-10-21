---
id: 01J8Z6M4K2Q7V9X3N5B0C1D2E2
type: facet
title: genre
created_at: 2026-10-21T10:00:00Z
updated_at: 2026-10-21T12:30:00Z
status: active
label: Жанр
key: genre
taxonomy: "[[Произведения (TAX-01J8Z6M4K2Q7V9X3N5B0C1D2E1)|Произведения]]"
hierarchy_mode: strict
assignment_cardinality: 0..n
root_requirement: multiple
---

# Facet: ось классификации

expect: valid

> key обязателен, соответствует ^(?!cat_)[a-z][a-z0-9_]{1,30}$ (naming.r8) и образует имя поля cat_genre.

Контрольный пример сгенерирован `tools/fixtures/generate.cjs`. Вручную не правится.
Ожидаемое поведение схемы версии 0.14.0 описано в строке `expect:` выше.
