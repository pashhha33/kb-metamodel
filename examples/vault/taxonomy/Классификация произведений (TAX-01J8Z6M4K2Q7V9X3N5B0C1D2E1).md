---
id: 01J8Z6M4K2Q7V9X3N5B0C1D2E1
type: taxonomy
title: Классификация произведений
label: Классификация произведений
applicable_types:
  - "[[Книга (OTYPE-01J8Z6M4K2Q7V9X3N5B0C1D2HH)|Книга]]"
  - "[[Глава (OTYPE-01J8Z6M4K2Q7V9X3N5B0C1D5A1)|Глава]]"
hierarchy_mode: strict
assignment_cardinality: 0..n
root_requirement: multiple
description: "Оси классификации произведений: жанр и тональность. Таксономия является контейнером осей, а не иерархией категорий; иерархию задаёт фасет со значением `hierarchy_mode: strict` (02_concept_alignment §2.1)."
lifecycle: standard
status: active
created_at: "2026-10-21T09:53:00+03:00"
updated_at: "2026-10-21T18:00:00+03:00"
---

# Классификация произведений

> **Канонический пример** (фаза 3b): таксономия (M1).
>
> Область классификации: контейнер осей (фасетов), а не иерархия категорий. Состав фасетов вычисляется из ссылок `Facet.taxonomy` и не хранится.

| | |
|---|---|
| Имя файла | `Классификация произведений (TAX-01J8Z6M4K2Q7V9X3N5B0C1D2E1).md` |
| Префикс типа | `TAX` |
| Идентификатор | `01J8Z6M4K2Q7V9X3N5B0C1D2E1` (ULID, 26 символов) |
| Роль поля `title` | отображаемое название (D-0063) |

## Что демонстрирует пример

- `applicable_types` обязателен и непуст (meta.r5): границы области задаёт таксономия, уровень Domain в MVP не вводится (D-0023)
- значения `hierarchy_mode`, `assignment_cardinality`, `root_requirement` — значения по умолчанию для фасетов (ADR-0005 §3.1 п.6)

---

Файл сгенерирован `tools/examples/generate.cjs` из реестра `tools/examples/vault-data.cjs` — производный артефакт, руками не редактируется. Проверка: `npm run examples:check` (схема 0.14.0 + межобъектные правила каталога).
