---
id: 01J8Z6M4K2Q7V9X3N5B0C1D3D5
type: facet
title: org_type
label: Тип организации
key: org_type
taxonomy: "[[Люди и организации (TAX-01J8Z6M4K2Q7V9X3N5B0C1D3A1)|Люди и организации]]"
hierarchy_mode: strict
assignment_cardinality: 0..n
root_requirement: multiple
description: "Тип организации: издательство, редакция, учреждение (Q-28 = A)."
lifecycle: standard
status: active
created_at: "2026-10-21T10:00:00+03:00"
updated_at: "2026-10-21T18:00:00+03:00"
---

# org_type — Тип организации

> **Канонический пример** (фаза 3b): фасет классификации (M1).
>
> Ось классификации внутри таксономии. Обязательный `key` образует имя поля назначений `cat_<key>` на объектах (ADR-0007).

| | |
|---|---|
| Имя файла | `org_type (FACET-01J8Z6M4K2Q7V9X3N5B0C1D3D5).md` |
| Префикс типа | `FACET` |
| Идентификатор | `01J8Z6M4K2Q7V9X3N5B0C1D3D5` (ULID, 26 символов) |
| Роль поля `title` | ключ (D-0063) |

---

Файл сгенерирован `tools/examples/generate.cjs` из реестра `tools/examples/vault-data.cjs` — производный артефакт, руками не редактируется. Проверка: `npm run examples:check` (схема 0.14.0 + межобъектные правила каталога).
