---
id: 01J8Z6M4K2Q7V9X3N5B0C1D2G1
type: object_type
type_id: context
title: Контекст
label: Контекст
type_prefix: null
is_abstract: true
layer: domain
parent_type: null
properties: []
description: "Абстрактный тип: то, в контексте чего существуют объекты (люди, персонажи, организации). Экземпляры не создаются; может быть целью subject_types/object_types в значении «любой наследник»."
lifecycle: standard
status: active
created_at: "2026-10-21T09:00:00+03:00"
updated_at: "2026-10-21T18:00:00+03:00"
---

# Контекст

> **Канонический пример** (фаза 3b): определение типа объекта (M1).
>
> Абстрактный предметный тип. Экземпляры не создаются (contract.r5), в выборе типа не предлагается; может быть целью `subject_types` / `object_types` в значении «любой наследник».

| | |
|---|---|
| Имя файла | `Контекст (OTYPE-01J8Z6M4K2Q7V9X3N5B0C1D2G1).md` |
| Префикс типа | `OTYPE` |
| Идентификатор | `01J8Z6M4K2Q7V9X3N5B0C1D2G1` (ULID, 26 символов) |
| Наследники в MVP | Person, Character, Organization |
| Роль поля `title` | отображаемое название (D-0063) |

---

Файл сгенерирован `tools/examples/generate.cjs` из реестра `tools/examples/vault-data.cjs` — производный артефакт, руками не редактируется. Проверка: `npm run examples:check` (схема 0.15.0 + межобъектные правила каталога).
