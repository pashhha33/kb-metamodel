---
id: 01J8Z6M4K2Q7V9X3N5B0C1D2H5
type: property
title: chapter_label
label: Обозначение главы
value_type: text
cardinality: 0..1
required: false
scope: specific
definition: "Отображаемое обозначение главы: «Пролог», «Глава седьмая». Непустое значение имеет приоритет перед шаблоном заголовка (ADR-0010 §2.1)."
lifecycle: standard
status: active
created_at: "2026-10-21T09:14:00+03:00"
updated_at: "2026-10-21T18:00:00+03:00"
---

# chapter_label — Обозначение главы

> **Канонический пример** (фаза 3b): определение свойства (M1).
>
> Определение свойства: хранит значения по умолчанию ограничений, которые тип может ужесточить.

| | |
|---|---|
| Имя файла | `chapter_label (PROP-01J8Z6M4K2Q7V9X3N5B0C1D2H5).md` |
| Префикс типа | `PROP` |
| Идентификатор | `01J8Z6M4K2Q7V9X3N5B0C1D2H5` (ULID, 26 символов) |
| Роль поля `title` | ключ (D-0063) |

---

Файл сгенерирован `tools/examples/generate.cjs` из реестра `tools/examples/vault-data.cjs` — производный артефакт, руками не редактируется. Проверка: `npm run examples:check` (схема 0.15.0 + межобъектные правила каталога).
