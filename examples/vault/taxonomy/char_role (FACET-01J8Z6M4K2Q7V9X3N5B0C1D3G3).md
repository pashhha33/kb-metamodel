---
id: 01J8Z6M4K2Q7V9X3N5B0C1D3G3
type: facet
title: char_role
label: Роли персонажей
key: char_role
taxonomy: "[[Словари значений (TAX-01J8Z6M4K2Q7V9X3N5B0C1D3E8)|Словари значений]]"
hierarchy_mode: strict
assignment_cardinality: 0..1
root_requirement: multiple
description: "Словарь ролей персонажей: значения свойства `Relation.role` (ADR-0006 §3.3). Фасет не является осью назначения категорий объекту, поэтому поле `cat_char_role` не создаётся, а правило classif.r3 к нему не применяется (D-0064, NAME_MAPPING §7.1)."
lifecycle: standard
status: active
created_at: "2026-10-21T10:02:00+03:00"
updated_at: "2026-10-21T18:00:00+03:00"
---

# char_role — Роли персонажей

> **Канонический пример** (фаза 3b): фасет классификации (M1).
>
> Ось классификации внутри таксономии. Обязательный `key` образует имя поля назначений `cat_<key>` на объектах (ADR-0007).

| | |
|---|---|
| Имя файла | `char_role (FACET-01J8Z6M4K2Q7V9X3N5B0C1D3G3).md` |
| Префикс типа | `FACET` |
| Идентификатор | `01J8Z6M4K2Q7V9X3N5B0C1D3G3` (ULID, 26 символов) |
| Роль поля `title` | ключ (D-0063) |

---

Файл сгенерирован `tools/examples/generate.cjs` из реестра `tools/examples/vault-data.cjs` — производный артефакт, руками не редактируется. Проверка: `npm run examples:check` (схема 0.15.0 + межобъектные правила каталога).
