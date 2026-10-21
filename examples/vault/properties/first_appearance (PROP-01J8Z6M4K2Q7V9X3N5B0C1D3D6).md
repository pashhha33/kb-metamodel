---
id: 01J8Z6M4K2Q7V9X3N5B0C1D3D6
type: property
title: first_appearance
label: Первое появление
value_type: reference
cardinality: 0..1
required: false
scope: specific
target_types:
  - "[[Произведение (OTYPE-01J8Z6M4K2Q7V9X3N5B0C1D2AA)|Произведение]]"
unique_within: "[[appears_in_work (PROP-01J8Z6M4K2Q7V9X3N5B0C1D3D7)|appears_in_work]]"
definition: "Произведение, в котором персонаж появился впервые. Область уникальности — произведение: пара (персонаж, произведение) не может повторяться (unique.r1)."
lifecycle: standard
status: active
created_at: "2026-10-21T09:33:00+03:00"
updated_at: "2026-10-21T18:00:00+03:00"
---

# first_appearance — Первое появление

> **Канонический пример** (фаза 3b): определение свойства (M1).
>
> Определение свойства: хранит значения по умолчанию ограничений, которые тип может ужесточить.

| | |
|---|---|
| Имя файла | `first_appearance (PROP-01J8Z6M4K2Q7V9X3N5B0C1D3D6).md` |
| Префикс типа | `PROP` |
| Идентификатор | `01J8Z6M4K2Q7V9X3N5B0C1D3D6` (ULID, 26 символов) |
| Роль поля `title` | ключ (D-0063) |

## Что демонстрирует пример

- второй случай `unique_within` после пары (order, part_of): механизм общий, а не специфичный для глав

---

Файл сгенерирован `tools/examples/generate.cjs` из реестра `tools/examples/vault-data.cjs` — производный артефакт, руками не редактируется. Проверка: `npm run examples:check` (схема 0.14.0 + межобъектные правила каталога).
