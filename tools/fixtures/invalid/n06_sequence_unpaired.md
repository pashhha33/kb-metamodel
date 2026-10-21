---
id: 01J8Z6M4K2Q7V9X3N5B0C1D2AB
type: object_type
title: Глава
created_at: 2026-10-21T10:00:00Z
updated_at: 2026-10-21T12:30:00Z
status: active
label: Глава
type_prefix: CHAP
is_abstract: false
layer: domain
properties:
  - "[[part_of (PROP-01J8Z6M4K2Q7V9X3N5B0C1D2B2)|part_of]]"
sequential_parent: "[[part_of (PROP-01J8Z6M4K2Q7V9X3N5B0C1D2B2)|part_of]]"
sequence_step: 10
---

# Последовательность объявлена частично

expect: invalid, errors: sequential_parent

> sequence.r1: sequential_parent и sequence_key задаются только парой. Выражено через dependentRequired.

Контрольный пример сгенерирован `tools/fixtures/generate.cjs`. Вручную не правится.
Ожидаемое поведение схемы версии 0.14.0 описано в строке `expect:` выше.
