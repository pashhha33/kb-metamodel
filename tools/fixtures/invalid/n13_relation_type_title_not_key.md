---
id: 01J8Z6M4K2Q7V9X3N5B0C1D2D1
type: relation_type
title: Автор произведения
created_at: 2026-10-21T10:00:00Z
updated_at: 2026-10-21T12:30:00Z
status: active
label: Автор
direction: directed
cardinality: 0..n
uniqueness_rule: unique_triple
---

# RelationType: title записан отображаемым названием

expect: invalid, errors: /title

> Норма D-0063 (Q-51 = A): title является ключом для определений, адресуемых по ключу. Отображаемое название хранится в label.

Контрольный пример сгенерирован `tools/fixtures/generate.cjs`. Вручную не правится.
Ожидаемое поведение схемы версии 0.15.0 описано в строке `expect:` выше.
