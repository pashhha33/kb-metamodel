---
id: 01J8Z6M4K2Q7V9X3N5B0C1D2G5
type: object_type
title: Знание
label: Знание
type_prefix: null
is_abstract: true
layer: domain
parent_type: null
properties: []
description: "Абстрактный тип: единицы знания (понятия, идеи, гипотезы, выводы). Экземпляры не создаются; наследники в MVP отложены, тип объявлен, чтобы иерархия ветвей была полной."
lifecycle: standard
status: active
created_at: "2026-10-21T09:05:00+03:00"
updated_at: "2026-10-21T18:00:00+03:00"
---

# Знание

> **Канонический пример** (фаза 3b): определение типа объекта (M1).
>
> Абстрактный предметный тип. Экземпляры не создаются (contract.r5), в выборе типа не предлагается; может быть целью `subject_types` / `object_types` в значении «любой наследник».

| | |
|---|---|
| Имя файла | `Знание (OTYPE-01J8Z6M4K2Q7V9X3N5B0C1D2G5).md` |
| Префикс типа | `OTYPE` |
| Идентификатор | `01J8Z6M4K2Q7V9X3N5B0C1D2G5` (ULID, 26 символов) |
| Наследники в MVP | отложено: Concept, Idea, Note, Hypothesis, Conclusion, Decision |
| Роль поля `title` | отображаемое название (D-0063) |

---

Файл сгенерирован `tools/examples/generate.cjs` из реестра `tools/examples/vault-data.cjs` — производный артефакт, руками не редактируется. Проверка: `npm run examples:check` (схема 0.14.0 + межобъектные правила каталога).
