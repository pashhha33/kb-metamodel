---
id: 01J8Z6M4K2Q7V9X3N5B0C1D2HH
type: object_type
type_id: book
title: Книга
label: Книга
type_prefix: BOOK
is_abstract: false
layer: domain
parent_type: "[[Произведение (OTYPE-01J8Z6M4K2Q7V9X3N5B0C1D2AA)|Произведение]]"
properties:
  - "[[cover (PROP-01J8Z6M4K2Q7V9X3N5B0C1D2B4)|cover]]"
  - "[[illustrations (PROP-01J8Z6M4K2Q7V9X3N5B0C1D2H6)|illustrations]]"
description: Книга как самостоятельное произведение. Издательство, ISBN, объём и дата издания — универсальные свойства.
lifecycle: standard
status: active
created_at: "2026-10-21T09:09:00+03:00"
updated_at: "2026-10-21T18:00:00+03:00"
---

# Книга

> **Канонический пример** (фаза 3b): определение типа объекта (M1).
>
> Конкретный предметный тип: экземпляры создаются, тип имеет собственный префикс.

| | |
|---|---|
| Имя файла | `Книга (OTYPE-01J8Z6M4K2Q7V9X3N5B0C1D2HH).md` |
| Префикс типа | `OTYPE` |
| Идентификатор | `01J8Z6M4K2Q7V9X3N5B0C1D2HH` (ULID, 26 символов) |
| `type_prefix` | `BOOK` |
| Роль поля `title` | отображаемое название (D-0063) |

## Что демонстрирует пример

- порядок ссылок в `properties` задаёт порядок полей формы и колонок таблицы (ADR-0003 §3.1)
- обложка — ссылка на медиаобёртку, а не встраивание файла (ADR-0011, Q-37 = C)
- универсальные свойства (`publisher`, `isbn`, `page_count`, `publication_date`, `language`) здесь не перечисляются
- связь с автором хранится объектом `Relation`, потому что у неё есть атрибуты (правило повышения X-03)

---

Файл сгенерирован `tools/examples/generate.cjs` из реестра `tools/examples/vault-data.cjs` — производный артефакт, руками не редактируется. Проверка: `npm run examples:check` (схема 0.15.0 + межобъектные правила каталога).
