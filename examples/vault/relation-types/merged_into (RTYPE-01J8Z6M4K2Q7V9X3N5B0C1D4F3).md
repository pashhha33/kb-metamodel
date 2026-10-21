---
id: 01J8Z6M4K2Q7V9X3N5B0C1D4F3
type: relation_type
title: merged_into
label: Слито в
forward_label: основной объект
inverse_label: влитый дубликат
direction: directed
subject_types: []
object_types: []
cardinality: 0..1
uniqueness_rule: unique_subject
description: "Дубликат влит в основной объект (ADR-0009 §3.1). Процедура слияния из семи шагов нормативна — docs/validation/RULES.md §12.1: предпросмотр, резервная копия, перевод ссылок, связь, архивация дубликата."
lifecycle: standard
status: active
created_at: "2026-10-21T09:48:00+03:00"
updated_at: "2026-10-21T18:00:00+03:00"
---

# merged_into — Слито в

> **Канонический пример** (фаза 3b): определение типа отношения (M1).
>
> Семантика связи: допустимые типы субъекта и объекта, направленность, кардинальность, уникальность.

| | |
|---|---|
| Имя файла | `merged_into (RTYPE-01J8Z6M4K2Q7V9X3N5B0C1D4F3).md` |
| Префикс типа | `RTYPE` |
| Идентификатор | `01J8Z6M4K2Q7V9X3N5B0C1D4F3` (ULID, 26 символов) |
| Роль поля `title` | ключ (D-0063) |

---

Файл сгенерирован `tools/examples/generate.cjs` из реестра `tools/examples/vault-data.cjs` — производный артефакт, руками не редактируется. Проверка: `npm run examples:check` (схема 0.14.0 + межобъектные правила каталога).
