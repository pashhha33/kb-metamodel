---
id: 01J8Z6M4K2Q7V9X3N5B0C1D3D2
type: relation_type
title: member_of
label: Состоит в
forward_label: место работы или службы
inverse_label: сотрудник
direction: directed
subject_types:
  - "[[Человек (OTYPE-01J8Z6M4K2Q7V9X3N5B0C1D2AD)|Человек]]"
object_types:
  - "[[Организация (OTYPE-01J8Z6M4K2Q7V9X3N5B0C1D2AE)|Организация]]"
cardinality: 0..n
uniqueness_rule: unique_triple
description: "Принадлежность человека к организации. Должность хранится атрибутом связи (`position`), а не категорией человека: она существует только в контексте организации (ADR-0006 §3.4, D-0028)."
lifecycle: standard
status: active
created_at: "2026-10-21T09:44:00+03:00"
updated_at: "2026-10-21T18:00:00+03:00"
---

# member_of — Состоит в

> **Канонический пример** (фаза 3b): определение типа отношения (M1).
>
> Семантика связи: допустимые типы субъекта и объекта, направленность, кардинальность, уникальность.

| | |
|---|---|
| Имя файла | `member_of (RTYPE-01J8Z6M4K2Q7V9X3N5B0C1D3D2).md` |
| Префикс типа | `RTYPE` |
| Идентификатор | `01J8Z6M4K2Q7V9X3N5B0C1D3D2` (ULID, 26 символов) |
| Роль поля `title` | ключ (D-0063) |

---

Файл сгенерирован `tools/examples/generate.cjs` из реестра `tools/examples/vault-data.cjs` — производный артефакт, руками не редактируется. Проверка: `npm run examples:check` (схема 0.15.0 + межобъектные правила каталога).
