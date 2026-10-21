---
id: 01J8Z6M4K2Q7V9X3N5B0C1D2A5
type: property
title: prompt
label: Промпт
value_type: text
cardinality: 0..1
required: false
scope: specific
definition: Текст запроса, по которому создано изображение. Свойство активируется аспектом ai_generated_media при назначении категории «Генерация ИИ» или её потомка (ADR-0011 §3.3, требование T9).
lifecycle: standard
status: active
created_at: "2026-10-21T09:29:00+03:00"
updated_at: "2026-10-21T18:00:00+03:00"
---

# prompt — Промпт

> **Канонический пример** (фаза 3b): определение свойства (M1).
>
> Определение свойства: хранит значения по умолчанию ограничений, которые тип может ужесточить.

| | |
|---|---|
| Имя файла | `prompt (PROP-01J8Z6M4K2Q7V9X3N5B0C1D2A5).md` |
| Префикс типа | `PROP` |
| Идентификатор | `01J8Z6M4K2Q7V9X3N5B0C1D2A5` (ULID, 26 символов) |
| Роль поля `title` | ключ (D-0063) |

---

Файл сгенерирован `tools/examples/generate.cjs` из реестра `tools/examples/vault-data.cjs` — производный артефакт, руками не редактируется. Проверка: `npm run examples:check` (схема 0.15.0 + межобъектные правила каталога).
