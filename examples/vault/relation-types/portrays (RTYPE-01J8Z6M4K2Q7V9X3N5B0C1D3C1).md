---
id: 01J8Z6M4K2Q7V9X3N5B0C1D3C1
type: relation_type
title: portrays
label: Воплощает
forward_label: роль в произведении
inverse_label: персонаж
direction: directed
subject_types:
  - "[[Персонаж (OTYPE-01J8Z6M4K2Q7V9X3N5B0C1D2G6)|Персонаж]]"
object_types:
  - "[[Произведение (OTYPE-01J8Z6M4K2Q7V9X3N5B0C1D2AA)|Произведение]]"
cardinality: 0..n
uniqueness_rule: unique_triple
description: "Роль персонажа в произведении. Один тип отношения плюс атрибут `role` (ссылка на категорию фасета char_role) заменяет десятки типов отношений: роли однородны по структуре, а список ролей открыт (ADR-0006 §3.3, критерий выбора механизма)."
lifecycle: standard
status: active
created_at: "2026-10-21T09:43:00+03:00"
updated_at: "2026-10-21T18:00:00+03:00"
---

# portrays — Воплощает

> **Канонический пример** (фаза 3b): определение типа отношения (M1).
>
> Семантика связи: допустимые типы субъекта и объекта, направленность, кардинальность, уникальность.

| | |
|---|---|
| Имя файла | `portrays (RTYPE-01J8Z6M4K2Q7V9X3N5B0C1D3C1).md` |
| Префикс типа | `RTYPE` |
| Идентификатор | `01J8Z6M4K2Q7V9X3N5B0C1D3C1` (ULID, 26 символов) |
| Роль поля `title` | ключ (D-0063) |

---

Файл сгенерирован `tools/examples/generate.cjs` из реестра `tools/examples/vault-data.cjs` — производный артефакт, руками не редактируется. Проверка: `npm run examples:check` (схема 0.15.0 + межобъектные правила каталога).
