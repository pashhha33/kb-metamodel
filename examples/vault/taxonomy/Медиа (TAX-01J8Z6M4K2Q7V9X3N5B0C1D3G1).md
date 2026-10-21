---
id: 01J8Z6M4K2Q7V9X3N5B0C1D3G1
type: taxonomy
title: Медиа
label: Медиа
applicable_types:
  - media_asset
hierarchy_mode: strict
assignment_cardinality: 0..n
root_requirement: multiple
description: "Оси классификации медиаобёрток. В MVP одна ось — метод создания (ADR-0011 §3.3, требование T9). Тип `media_asset` — системный: в `applicable_types` записывается голой строкой snake_case, а не wikilink-ссылкой, поскольку определения ObjectType у него нет (D-0067)."
lifecycle: standard
status: active
created_at: "2026-10-21T09:55:00+03:00"
updated_at: "2026-10-21T18:00:00+03:00"
---

# Медиа

> **Канонический пример** (фаза 3b): таксономия (M1).
>
> Область классификации: контейнер осей (фасетов), а не иерархия категорий. Состав фасетов вычисляется из ссылок `Facet.taxonomy` и не хранится.

| | |
|---|---|
| Имя файла | `Медиа (TAX-01J8Z6M4K2Q7V9X3N5B0C1D3G1).md` |
| Префикс типа | `TAX` |
| Идентификатор | `01J8Z6M4K2Q7V9X3N5B0C1D3G1` (ULID, 26 символов) |
| Роль поля `title` | отображаемое название (D-0063) |

---

Файл сгенерирован `tools/examples/generate.cjs` из реестра `tools/examples/vault-data.cjs` — производный артефакт, руками не редактируется. Проверка: `npm run examples:check` (схема 0.15.0 + межобъектные правила каталога).
