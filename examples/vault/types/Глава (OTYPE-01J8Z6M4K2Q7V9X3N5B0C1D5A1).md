---
id: 01J8Z6M4K2Q7V9X3N5B0C1D5A1
type: object_type
title: Глава
label: Глава
type_prefix: CHAP
is_abstract: false
layer: domain
parent_type: "[[Произведение (OTYPE-01J8Z6M4K2Q7V9X3N5B0C1D2AA)|Произведение]]"
properties:
  - "[[chapter_label (PROP-01J8Z6M4K2Q7V9X3N5B0C1D2H5)|chapter_label]]"
property_overrides:
  - property: "[[order (PROP-01J8Z6M4K2Q7V9X3N5B0C1D2B3)|order]]"
    required: true
    cardinality: "1"
sequential_parent: "[[part_of (PROP-01J8Z6M4K2Q7V9X3N5B0C1D5A2)|part_of]]"
sequence_key: "[[order (PROP-01J8Z6M4K2Q7V9X3N5B0C1D2B3)|order]]"
sequence_step: 10
sequence_direction: ascending
title_template: Глава {order}
description: "Глава произведения. Тип объявлен упорядоченной последовательностью внутри родителя: пара (sequential_parent, sequence_key) даёт переходы к соседям и к родителю, создание следующей главы и заголовок по умолчанию — без специальных знаний о конкретном типе."
lifecycle: standard
status: active
created_at: "2026-10-21T09:10:00+03:00"
updated_at: "2026-10-21T18:00:00+03:00"
---

# Глава

> **Канонический пример** (фаза 3b): определение типа объекта (M1).
>
> Конкретный предметный тип: экземпляры создаются, тип имеет собственный префикс.

| | |
|---|---|
| Имя файла | `Глава (OTYPE-01J8Z6M4K2Q7V9X3N5B0C1D5A1).md` |
| Префикс типа | `OTYPE` |
| Идентификатор | `01J8Z6M4K2Q7V9X3N5B0C1D5A1` (ULID, 26 символов) |
| `type_prefix` | `CHAP` |
| Роль поля `title` | отображаемое название (D-0063) |

## Что демонстрирует пример

- объявление последовательности (ADR-0010 §3.1, закрывает пробел G-1)
- свойство `part_of` получено наследованием от семейства, `order` ужесточено переопределением (ADR-0003 §3.3)
- шаблон заголовка «Глава {order}»: имя при создании можно пропустить (ADR-0010 §2.1, требование T5)
- разреженная нумерация с шагом 10 делает вставку локальной операцией (Q-34 = C)
- область уникальности номера — родительский объект (unique.r1, ADR-0010 §3.2)

---

Файл сгенерирован `tools/examples/generate.cjs` из реестра `tools/examples/vault-data.cjs` — производный артефакт, руками не редактируется. Проверка: `npm run examples:check` (схема 0.14.0 + межобъектные правила каталога).
