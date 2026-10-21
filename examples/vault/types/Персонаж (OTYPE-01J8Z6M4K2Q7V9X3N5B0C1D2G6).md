---
id: 01J8Z6M4K2Q7V9X3N5B0C1D2G6
type: object_type
title: Персонаж
label: Персонаж
type_prefix: CHAR
is_abstract: false
layer: domain
parent_type: "[[Контекст (OTYPE-01J8Z6M4K2Q7V9X3N5B0C1D2G1)|Контекст]]"
properties:
  - "[[portrait (PROP-01J8Z6M4K2Q7V9X3N5B0C1D2H7)|portrait]]"
  - "[[first_appearance (PROP-01J8Z6M4K2Q7V9X3N5B0C1D3D6)|first_appearance]]"
description: "Вымышленный персонаж произведения. Роль персонажа в произведении не является свойством персонажа: она хранится в отношении portrays вместе с атрибутом role (ADR-0006 §3.3)."
lifecycle: standard
status: active
created_at: "2026-10-21T09:08:00+03:00"
updated_at: "2026-10-21T18:00:00+03:00"
---

# Персонаж

> **Канонический пример** (фаза 3b): определение типа объекта (M1).
>
> Конкретный предметный тип: экземпляры создаются, тип имеет собственный префикс.

| | |
|---|---|
| Имя файла | `Персонаж (OTYPE-01J8Z6M4K2Q7V9X3N5B0C1D2G6).md` |
| Префикс типа | `OTYPE` |
| Идентификатор | `01J8Z6M4K2Q7V9X3N5B0C1D2G6` (ULID, 26 символов) |
| `type_prefix` | `CHAR` |
| Роль поля `title` | отображаемое название (D-0063) |

## Что демонстрирует пример

- префикс CHAR: значение CHARACTЕR с кириллической «Е» запрещено реестром (правило R9, диагноз C-06)
- свойство `first_appearance` демонстрирует область уникальности: пара (персонаж, произведение) уникальна
- персонаж является субъектом типов отношений portrays и appears_in

---

Файл сгенерирован `tools/examples/generate.cjs` из реестра `tools/examples/vault-data.cjs` — производный артефакт, руками не редактируется. Проверка: `npm run examples:check` (схема 0.14.0 + межобъектные правила каталога).
