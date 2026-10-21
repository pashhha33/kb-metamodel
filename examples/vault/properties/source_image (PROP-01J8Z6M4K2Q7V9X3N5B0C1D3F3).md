---
id: 01J8Z6M4K2Q7V9X3N5B0C1D3F3
type: property
title: source_image
label: Исходное изображение
value_type: reference
cardinality: 0..1
required: false
scope: specific
target_types:
  - media_asset
definition: "Медиаобёртка изображения, послужившего основой. Фильтр ролей не задан: исходником может быть обёртка с любой ролью. Тип цели — системный `media_asset`, запись голая строкой (D-0067)."
lifecycle: standard
status: active
created_at: "2026-10-21T09:32:00+03:00"
updated_at: "2026-10-21T18:00:00+03:00"
---

# source_image — Исходное изображение

> **Канонический пример** (фаза 3b): определение свойства (M1).
>
> Определение свойства: хранит значения по умолчанию ограничений, которые тип может ужесточить.

| | |
|---|---|
| Имя файла | `source_image (PROP-01J8Z6M4K2Q7V9X3N5B0C1D3F3).md` |
| Префикс типа | `PROP` |
| Идентификатор | `01J8Z6M4K2Q7V9X3N5B0C1D3F3` (ULID, 26 символов) |
| Роль поля `title` | ключ (D-0063) |

---

Файл сгенерирован `tools/examples/generate.cjs` из реестра `tools/examples/vault-data.cjs` — производный артефакт, руками не редактируется. Проверка: `npm run examples:check` (схема 0.15.0 + межобъектные правила каталога).
