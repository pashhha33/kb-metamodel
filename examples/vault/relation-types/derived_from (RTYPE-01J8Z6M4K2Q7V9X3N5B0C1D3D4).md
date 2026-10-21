---
id: 01J8Z6M4K2Q7V9X3N5B0C1D3D4
type: relation_type
title: derived_from
label: Производно от
forward_label: исходный источник
inverse_label: производное произведение
direction: directed
subject_types:
  - "[[Произведение (OTYPE-01J8Z6M4K2Q7V9X3N5B0C1D2AA)|Произведение]]"
object_types:
  - "[[Источник (OTYPE-01J8Z6M4K2Q7V9X3N5B0C1D2G4)|Источник]]"
cardinality: 0..n
uniqueness_rule: unique_triple
description: "Произведение создано на основе источника. Применяется, когда значимы обе роли: два объекта и связь между ними (00_overview §5.3, D-0019)."
lifecycle: standard
status: active
created_at: "2026-10-21T09:46:00+03:00"
updated_at: "2026-10-21T18:00:00+03:00"
---

# derived_from — Производно от

> **Канонический пример** (фаза 3b): определение типа отношения (M1).
>
> Семантика связи: допустимые типы субъекта и объекта, направленность, кардинальность, уникальность.

| | |
|---|---|
| Имя файла | `derived_from (RTYPE-01J8Z6M4K2Q7V9X3N5B0C1D3D4).md` |
| Префикс типа | `RTYPE` |
| Идентификатор | `01J8Z6M4K2Q7V9X3N5B0C1D3D4` (ULID, 26 символов) |
| Роль поля `title` | ключ (D-0063) |

---

Файл сгенерирован `tools/examples/generate.cjs` из реестра `tools/examples/vault-data.cjs` — производный артефакт, руками не редактируется. Проверка: `npm run examples:check` (схема 0.14.0 + межобъектные правила каталога).
