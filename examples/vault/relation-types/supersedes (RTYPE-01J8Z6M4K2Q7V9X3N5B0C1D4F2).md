---
id: 01J8Z6M4K2Q7V9X3N5B0C1D4F2
type: relation_type
title: supersedes
label: Заменяет
forward_label: заменяющий объект
inverse_label: заменённый объект
direction: directed
subject_types: []
object_types: []
cardinality: 0..1
uniqueness_rule: unique_subject
description: "Новый объект заменяет старый (ADR-0009 §3.1). Пустые списки типов означают «любой тип». Цепочки замен запрещены (lifecycle.r1): у объекта не более одной исходящей связи замены (lifecycle.r3)."
lifecycle: standard
status: active
created_at: "2026-10-21T09:47:00+03:00"
updated_at: "2026-10-21T18:00:00+03:00"
---

# supersedes — Заменяет

> **Канонический пример** (фаза 3b): определение типа отношения (M1).
>
> Семантика связи: допустимые типы субъекта и объекта, направленность, кардинальность, уникальность.

| | |
|---|---|
| Имя файла | `supersedes (RTYPE-01J8Z6M4K2Q7V9X3N5B0C1D4F2).md` |
| Префикс типа | `RTYPE` |
| Идентификатор | `01J8Z6M4K2Q7V9X3N5B0C1D4F2` (ULID, 26 символов) |
| Роль поля `title` | ключ (D-0063) |

---

Файл сгенерирован `tools/examples/generate.cjs` из реестра `tools/examples/vault-data.cjs` — производный артефакт, руками не редактируется. Проверка: `npm run examples:check` (схема 0.15.0 + межобъектные правила каталога).
