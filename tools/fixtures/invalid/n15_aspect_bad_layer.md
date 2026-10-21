---
id: 01J8Z6M4K2Q7V9X3N5B0C1D2A4
type: aspect
title: ai_generated_media
created_at: 2026-10-21T10:00:00Z
updated_at: 2026-10-21T12:30:00Z
status: active
label: Генерация ИИ
layer: core
trigger_categories:
  - "[[Генерация ИИ (CAT-01J8Z6M4K2Q7V9X3N5B0C1D2F4)|Генерация ИИ]]"
properties:
  - "[[prompt (PROP-01J8Z6M4K2Q7V9X3N5B0C1D2A5)|Промпт]]"
is_active: true
---

# Aspect: layer вне закрытого перечисления

expect: invalid, errors: /layer

> Поле layer объявлено во фрагменте aspect с выпуска 0.14.0 (находка F-3.20): до этого пример ADR-0008 §3.1 с layer: system отклонялся схемой как неизвестное поле. Значение ограничено перечислением layer (system, domain).

Контрольный пример сгенерирован `tools/fixtures/generate.cjs`. Вручную не правится.
Ожидаемое поведение схемы версии 0.15.0 описано в строке `expect:` выше.
