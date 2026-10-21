---
id: 01J8Z6M4K2Q7V9X3N5B0C1D3D7
type: property
title: appears_in_work
label: Произведение с участием
value_type: reference
cardinality: 0..n
required: false
scope: specific
target_types:
  - "[[Произведение (OTYPE-01J8Z6M4K2Q7V9X3N5B0C1D2AA)|Произведение]]"
definition: Произведения, в которых появляется персонаж. Свойство служит областью уникальности для `first_appearance`. Связь с ролью персонажа хранится отношением portrays, а не этим свойством.
lifecycle: standard
status: active
created_at: "2026-10-21T09:34:00+03:00"
updated_at: "2026-10-21T18:00:00+03:00"
---

# appears_in_work — Произведение с участием

> **Канонический пример** (фаза 3b): определение свойства (M1).
>
> Определение свойства: хранит значения по умолчанию ограничений, которые тип может ужесточить.

| | |
|---|---|
| Имя файла | `appears_in_work (PROP-01J8Z6M4K2Q7V9X3N5B0C1D3D7).md` |
| Префикс типа | `PROP` |
| Идентификатор | `01J8Z6M4K2Q7V9X3N5B0C1D3D7` (ULID, 26 символов) |
| Роль поля `title` | ключ (D-0063) |

---

Файл сгенерирован `tools/examples/generate.cjs` из реестра `tools/examples/vault-data.cjs` — производный артефакт, руками не редактируется. Проверка: `npm run examples:check` (схема 0.14.0 + межобъектные правила каталога).
