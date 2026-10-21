---
id: 01J8Z6M4K2Q7V9X3N5B0C1D3A1
type: taxonomy
title: Люди и организации
label: Люди и организации
applicable_types:
  - "[[Человек (OTYPE-01J8Z6M4K2Q7V9X3N5B0C1D2AD)|Человек]]"
  - "[[Организация (OTYPE-01J8Z6M4K2Q7V9X3N5B0C1D2AE)|Организация]]"
hierarchy_mode: strict
assignment_cardinality: 0..n
root_requirement: multiple
description: "Оси классификации людей и организаций: профессия и тип организации (ADR-0006 §3.1, Q-28 = A)."
lifecycle: standard
status: active
created_at: "2026-10-21T09:54:00+03:00"
updated_at: "2026-10-21T18:00:00+03:00"
---

# Люди и организации

> **Канонический пример** (фаза 3b): таксономия (M1).
>
> Область классификации: контейнер осей (фасетов), а не иерархия категорий. Состав фасетов вычисляется из ссылок `Facet.taxonomy` и не хранится.

| | |
|---|---|
| Имя файла | `Люди и организации (TAX-01J8Z6M4K2Q7V9X3N5B0C1D3A1).md` |
| Префикс типа | `TAX` |
| Идентификатор | `01J8Z6M4K2Q7V9X3N5B0C1D3A1` (ULID, 26 символов) |
| Роль поля `title` | отображаемое название (D-0063) |

---

Файл сгенерирован `tools/examples/generate.cjs` из реестра `tools/examples/vault-data.cjs` — производный артефакт, руками не редактируется. Проверка: `npm run examples:check` (схема 0.14.0 + межобъектные правила каталога).
