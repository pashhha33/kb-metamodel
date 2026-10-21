---
id: 01J8Z6M4K2Q7V9X3N5B0C1D3B1
type: relation_type
title: author
label: Автор
forward_label: автор
inverse_label: произведение автора
direction: directed
subject_types:
  - "[[Произведение (OTYPE-01J8Z6M4K2Q7V9X3N5B0C1D2AA)|Произведение]]"
object_types:
  - "[[Человек (OTYPE-01J8Z6M4K2Q7V9X3N5B0C1D2AD)|Человек]]"
cardinality: 0..n
uniqueness_rule: unique_triple
is_restriction: false
description: "Авторство произведения. Направление задано таблицей 00_overview §7.4: субъект — произведение, объект — человек. Читается связь через подписи: forward_label «автор» относится к объекту связи."
lifecycle: standard
status: active
created_at: "2026-10-21T09:42:00+03:00"
updated_at: "2026-10-21T18:00:00+03:00"
---

# author — Автор

> **Канонический пример** (фаза 3b): определение типа отношения (M1).
>
> Семантика связи: допустимые типы субъекта и объекта, направленность, кардинальность, уникальность.

| | |
|---|---|
| Имя файла | `author (RTYPE-01J8Z6M4K2Q7V9X3N5B0C1D3B1).md` |
| Префикс типа | `RTYPE` |
| Идентификатор | `01J8Z6M4K2Q7V9X3N5B0C1D3B1` (ULID, 26 символов) |
| Роль поля `title` | ключ (D-0063) |

## Что демонстрирует пример

- ссылка на абстрактный тип Work в `subject_types` означает «любой наследник» (ADR-0005)
- `is_restriction: false` — рекомендация, а не запрет: несоответствие даёт warn (relation.r7)
- экземпляр создаётся по правилу повышения X-03, как только у связи появляются атрибуты

---

Файл сгенерирован `tools/examples/generate.cjs` из реестра `tools/examples/vault-data.cjs` — производный артефакт, руками не редактируется. Проверка: `npm run examples:check` (схема 0.14.0 + межобъектные правила каталога).
