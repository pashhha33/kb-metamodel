---
id: 01J8Z6M4K2Q7V9X3N5B0C1D3A3
type: facet
title: profession
label: Профессия
key: profession
taxonomy: "[[Люди и организации (TAX-01J8Z6M4K2Q7V9X3N5B0C1D3A1)|Люди и организации]]"
hierarchy_mode: strict
assignment_cardinality: 0..n
root_requirement: multiple
description: Профессия человека. Устойчивый факт об объекте сам по себе — категория фасета, а не тип объекта и не отношение (ADR-0006 §3.1, правило роли D-0026). Множественность позволяет быть одновременно писателем и врачом.
lifecycle: standard
status: active
created_at: "2026-10-21T09:59:00+03:00"
updated_at: "2026-10-21T18:00:00+03:00"
---

# profession — Профессия

> **Канонический пример** (фаза 3b): фасет классификации (M1).
>
> Ось классификации внутри таксономии. Обязательный `key` образует имя поля назначений `cat_<key>` на объектах (ADR-0007).

| | |
|---|---|
| Имя файла | `profession (FACET-01J8Z6M4K2Q7V9X3N5B0C1D3A3).md` |
| Префикс типа | `FACET` |
| Идентификатор | `01J8Z6M4K2Q7V9X3N5B0C1D3A3` (ULID, 26 символов) |
| Роль поля `title` | ключ (D-0063) |

## Что демонстрирует пример

- назначение категории активирует аспект literary_person (ADR-0008)
- иерархия «Писатель → Прозаик → Романист» работает штатно через `Category.parent`

---

Файл сгенерирован `tools/examples/generate.cjs` из реестра `tools/examples/vault-data.cjs` — производный артефакт, руками не редактируется. Проверка: `npm run examples:check` (схема 0.14.0 + межобъектные правила каталога).
