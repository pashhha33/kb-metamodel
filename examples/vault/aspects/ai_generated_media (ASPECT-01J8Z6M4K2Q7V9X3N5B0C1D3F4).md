---
id: 01J8Z6M4K2Q7V9X3N5B0C1D3F4
type: aspect
title: ai_generated_media
label: Генерация ИИ
layer: system
trigger_categories:
  - "[[Генерация ИИ (CAT-01J8Z6M4K2Q7V9X3N5B0C1D3G7)|Генерация ИИ]]"
properties:
  - "[[prompt (PROP-01J8Z6M4K2Q7V9X3N5B0C1D2A5)|prompt]]"
  - "[[model (PROP-01J8Z6M4K2Q7V9X3N5B0C1D3F1)|model]]"
  - "[[seed (PROP-01J8Z6M4K2Q7V9X3N5B0C1D3F2)|seed]]"
  - "[[source_image (PROP-01J8Z6M4K2Q7V9X3N5B0C1D3F3)|source_image]]"
is_active: true
description: "Свойства метода генерации изображения: промпт, модель, seed, исходное изображение (ADR-0011 §3.3, требование T9)."
lifecycle: standard
status: active
created_at: "2026-10-21T10:28:00+03:00"
updated_at: "2026-10-21T18:00:00+03:00"
---

# ai_generated_media — Генерация ИИ

> **Канонический пример** (фаза 3b): аспект (M1).
>
> Набор свойств, активируемых назначенными категориями. Активация включает потомков категории, значения хранятся в плоском frontmatter самого объекта.

| | |
|---|---|
| Имя файла | `ai_generated_media (ASPECT-01J8Z6M4K2Q7V9X3N5B0C1D3F4).md` |
| Префикс типа | `ASPECT` |
| Идентификатор | `01J8Z6M4K2Q7V9X3N5B0C1D3F4` (ULID, 26 символов) |
| Роль поля `title` | ключ (D-0063) |

Второй реальный случай применения аспекта после профессии (ADR-0011 §3.3): назначение категории «Генерация ИИ» в поле `cat_creation_method` добавляет обёртке свойства метода генерации.

В отличие от аспекта литературной деятельности, здесь нет `property_overrides`: свойства метода необязательны, потому что не каждый сгенерированный файл имеет воспроизводимые параметры.

Поля-заделы (`trigger_relation_types`, `trigger_conditions`, `trigger_types`) в MVP не используются и в примере не заполняются: они объявлены в схеме, чтобы их появление не считалось ошибкой формы.

---

Файл сгенерирован `tools/examples/generate.cjs` из реестра `tools/examples/vault-data.cjs` — производный артефакт, руками не редактируется. Проверка: `npm run examples:check` (схема 0.15.0 + межобъектные правила каталога).
