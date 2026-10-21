---
id: 01J8Z6M4K2Q7V9X3N5B0C1D2A2
type: view
title: Карточка книги
created_at: 2026-10-21T10:00:00Z
updated_at: 2026-10-21T12:30:00Z
status: active
label: Карточка книги
target_types:
  - "[[Книга (OTYPE-01J8Z6M4K2Q7V9X3N5B0C1D2AC)|Книга]]"
mechanism: card
definition: |-
  filters:
    status: active
  columns: [title, cover, author]
is_active: true
---

# View: представление

expect: valid

> target_types непуст (view.r1), mechanism — абстрактный идентификатор без названий инструментов (D-0057).

Контрольный пример сгенерирован `tools/fixtures/generate.cjs`. Вручную не правится.
Ожидаемое поведение схемы версии 0.15.0 описано в строке `expect:` выше.
