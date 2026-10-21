---
id: 01J8Z6M4K2Q7V9X3N5B0C1D2A3
type: automation
title: create_chapter
created_at: 2026-10-21T10:00:00Z
updated_at: 2026-10-21T12:30:00Z
status: active
label: Создать главу
trigger: manual
mechanism: custom
target_types:
  - "[[Глава (OTYPE-01J8Z6M4K2Q7V9X3N5B0C1D2AB)|Глава]]"
form_fields:
  - "[[part_of (PROP-01J8Z6M4K2Q7V9X3N5B0C1D2B2)|part_of]]"
  - "[[order (PROP-01J8Z6M4K2Q7V9X3N5B0C1D2B3)|order]]"
  - sys:title
defaults:
  order: "{next_sequence}"
  status: draft
require_confirmation: true
is_active: true
---

# Automation: форма создания главы

expect: valid

> form_fields смешивает ссылки на Property и sys-поля (meta.r15); defaults поддерживает плейсхолдер {next_sequence}.

Контрольный пример сгенерирован `tools/fixtures/generate.cjs`. Вручную не правится.
Ожидаемое поведение схемы версии 0.15.0 описано в строке `expect:` выше.
