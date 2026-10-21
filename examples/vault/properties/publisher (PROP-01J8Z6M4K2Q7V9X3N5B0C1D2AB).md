---
id: 01J8Z6M4K2Q7V9X3N5B0C1D2AB
type: property
title: publisher
label: Издательство
value_type: reference
cardinality: 0..1
required: false
scope: universal
target_types:
  - "[[Организация (OTYPE-01J8Z6M4K2Q7V9X3N5B0C1D2AE)|Организация]]"
definition: "Организация, выпустившая издание. Универсальное свойство: применяется ко всем типам автоматически."
lifecycle: standard
status: active
created_at: "2026-10-21T09:19:00+03:00"
updated_at: "2026-10-21T18:00:00+03:00"
---

# publisher — Издательство

> **Канонический пример** (фаза 3b): определение свойства (M1).
>
> Определение свойства: хранит значения по умолчанию ограничений, которые тип может ужесточить.

| | |
|---|---|
| Имя файла | `publisher (PROP-01J8Z6M4K2Q7V9X3N5B0C1D2AB).md` |
| Префикс типа | `PROP` |
| Идентификатор | `01J8Z6M4K2Q7V9X3N5B0C1D2AB` (ULID, 26 символов) |
| Роль поля `title` | ключ (D-0063) |

## Что демонстрирует пример

- пример ADR-0003 §3.2: `target_types` обязателен при `value_type: reference` (meta.r2)
- универсальное свойство не перечисляется в `ObjectType.properties` и не может быть ослаблено в типе (property.r7)

---

Файл сгенерирован `tools/examples/generate.cjs` из реестра `tools/examples/vault-data.cjs` — производный артефакт, руками не редактируется. Проверка: `npm run examples:check` (схема 0.14.0 + межобъектные правила каталога).
