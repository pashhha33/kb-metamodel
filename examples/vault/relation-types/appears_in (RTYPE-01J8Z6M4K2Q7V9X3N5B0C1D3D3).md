---
id: 01J8Z6M4K2Q7V9X3N5B0C1D3D3
type: relation_type
title: appears_in
label: Появляется в
forward_label: произведение с участием
inverse_label: участник
direction: directed
subject_types:
  - "[[Персонаж (OTYPE-01J8Z6M4K2Q7V9X3N5B0C1D2G6)|Персонаж]]"
object_types:
  - "[[Произведение (OTYPE-01J8Z6M4K2Q7V9X3N5B0C1D2AA)|Произведение]]"
cardinality: 0..n
uniqueness_rule: unique_triple
description: Появление персонажа в произведении без указания роли. Объявлен для полноты таблицы 00_overview §7.4; экземпляров в этом сценарии нет.
lifecycle: standard
status: active
created_at: "2026-10-21T09:45:00+03:00"
updated_at: "2026-10-21T18:00:00+03:00"
---

# appears_in — Появляется в

> **Канонический пример** (фаза 3b): определение типа отношения (M1).
>
> Семантика связи: допустимые типы субъекта и объекта, направленность, кардинальность, уникальность.

| | |
|---|---|
| Имя файла | `appears_in (RTYPE-01J8Z6M4K2Q7V9X3N5B0C1D3D3).md` |
| Префикс типа | `RTYPE` |
| Идентификатор | `01J8Z6M4K2Q7V9X3N5B0C1D3D3` (ULID, 26 символов) |
| Роль поля `title` | ключ (D-0063) |

---

Файл сгенерирован `tools/examples/generate.cjs` из реестра `tools/examples/vault-data.cjs` — производный артефакт, руками не редактируется. Проверка: `npm run examples:check` (схема 0.15.0 + межобъектные правила каталога).
