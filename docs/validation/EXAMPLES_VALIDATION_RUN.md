---
doc: examples-validation-run
status: actual
version: 0.1.0
updated: 2026-10-21
metamodel_version: 0.14.0
phase: 3b
generated_by: tools/examples/check.cjs
sources: [examples/vault/**, docs/validation/RULES.md, schema/]
---

# Прогон канонических примеров (фаза 3b)

Документ фиксирует результат проверки канонического хранилища примеров `examples/vault/`:
форма объектов (JSON Schema) и межобъектные правила каталога `docs/validation/RULES.md`.

Раздел между маркерами ниже — **производный**: он перезаписывается скриптом
`tools/examples/check.cjs` (команда `npm run examples:check`) и руками не редактируется.

## Что проверяет песочница примеров

| Слой | Чем проверяется | Основание |
|---|---|---|
| Форма объекта | фрагмент схемы выбранной ветки (двухпроходный алгоритм: выбор ветки по полю `type`, затем валидация только её фрагментом) | `docs/plugin/ARCHITECTURE.md` §4.1.1, находка F-3.17 |
| Межобъектные правила | `tools/examples/check.cjs`: разрешение ссылок, уникальность, наследование, эффективный набор свойств, активация аспектов, классификация, последовательности, область уникальности, медиа, жизненный цикл | `docs/validation/RULES.md` (каталог — нормативный источник) |
| Имена файлов и ссылок | каноническая форма `{имя} ({PREFIX}-{id})`, совпадение `id` в файле и во frontmatter | ADR-0002 п.3–5, `contract.r10`, `contract.r11`, `link.r4`, `link.r5` |

Песочница **не является кодом плагина** (фаза 5): она работает с файлами репозитория и
демонстрирует, что каталог правил реализуем, а канонические примеры ему соответствуют.

## Как читать результат

- `error` — нарушение модели: примеры обязаны проходить без таких диагностик.
- `warn` — подозрительно, но допустимо. Часть предупреждений в каноническом хранилище
  **оставлена намеренно**, чтобы показывать работу правила (например, `sequence.r5` — разрыв
  нумерации глав, `lifecycle.r2` — ссылка активного отношения на архивный дубликат).
  Каждое намеренное предупреждение объяснено в теле соответствующей заметки.
- `info` — стилистическое замечание (например, разрешение ссылки записью индекса типов ядра).
- `schema.form` — служебный идентификатор диагностики формы (не правило каталога): сообщение
  приходит от JSON Schema, а не от межобъектной проверки.

<!-- BEGIN GENERATED: examples-validation (tools/examples/check.cjs) -->
> Прогон выполнен `tools/examples/check.cjs` (Node 20.20.2, AJV 8.20.0). Дата: 2026-10-21.
>
> Хранилище примеров: `examples/vault/` (105 заметок). Схема: 0.14.0 (двухпроходная валидация формы) + межобъектные правила каталога.

**Итог: 32 error, 5 warn, 2 info. Правил, проверенных на примерах: 68 из 114.**

### Диагностика

| Уровень | Правило | Файл | Сообщение |
|---|---|---|---|
| error | `schema.form` | `examples/vault/media/Обложка «Мастера и Маргариты» (MEDIA-01J8Z6M4K2Q7V9X3N5B0C1D2GC).md` | /source_url must be string |
| error | `schema.form` | `examples/vault/media/Обложка «Мастера и Маргариты» (MEDIA-01J8Z6M4K2Q7V9X3N5B0C1D2GC).md` | (корень) must NOT have unevaluated properties |
| error | `schema.form` | `examples/vault/media/Обложка «Мастера и Маргариты» (MEDIA-01J8Z6M4K2Q7V9X3N5B0C1D2GC).md` | (корень) must NOT have unevaluated properties |
| error | `schema.form` | `examples/vault/media/Обложка «Мастера и Маргариты» (MEDIA-01J8Z6M4K2Q7V9X3N5B0C1D2GC).md` | (корень) must NOT have unevaluated properties |
| error | `schema.form` | `examples/vault/media/Портрет Михаила Булгакова (MEDIA-01J8Z6M4K2Q7V9X3N5B0C1D2GE).md` | /source_url must be string |
| warn | `classif.r7` | `examples/vault/taxonomy/Поэт (CAT-01J8Z6M4K2Q7V9X3N5B0C1D3A7).md` | Категория «Поэт» без дочерних и без назначений — возможно, мёртвая |
| error | `classif.r2` | `examples/vault/media/Иллюстрация к «Мастеру и Маргарите» (MEDIA-01J8Z6M4K2Q7V9X3N5B0C1D2GD).md` | Тип media_asset не входит в applicable_types таксономии «Медиа» |
| error | `classif.r2` | `examples/vault/media/Обложка «Мастера и Маргариты» (MEDIA-01J8Z6M4K2Q7V9X3N5B0C1D2GC).md` | Тип media_asset не входит в applicable_types таксономии «Медиа» |
| error | `classif.r2` | `examples/vault/media/Портрет Ивана Бездомного (MEDIA-01J8Z6M4K2Q7V9X3N5B0C1D2GF).md` | Тип media_asset не входит в applicable_types таксономии «Медиа» |
| error | `classif.r2` | `examples/vault/media/Портрет Михаила Булгакова (MEDIA-01J8Z6M4K2Q7V9X3N5B0C1D2GE).md` | Тип media_asset не входит в applicable_types таксономии «Медиа» |
| error | `classif.r2` | `examples/vault/objects/Мастер и Маргарита (BOOK-01J8Z6M4K2Q7V9X3N5B0C1D2AC).md` | Тип book не входит в applicable_types таксономии «Классификация произведений» |
| error | `classif.r2` | `examples/vault/objects/Мастер и Маргарита (BOOK-01J8Z6M4K2Q7V9X3N5B0C1D2AC).md` | Тип book не входит в applicable_types таксономии «Классификация произведений» |
| error | `classif.r2` | `examples/vault/objects/Мастер и Маргарита (рукопись) (BOOK-01J8Z6M4K2Q7V9X3N5B0C1D2G7).md` | Тип book не входит в applicable_types таксономии «Классификация произведений» |
| error | `classif.r2` | `examples/vault/objects/Михаил Булгаков (PERSON-01J8Z6M4K2Q7V9X3N5B0C1D2EF).md` | Тип person не входит в applicable_types таксономии «Люди и организации» |
| error | `classif.r2` | `examples/vault/objects/Художественная литература (ORG-01J8Z6M4K2Q7V9X3N5B0C1D2GA).md` | Тип organization не входит в applicable_types таксономии «Люди и организации» |
| error | `contract.r4` | `examples/vault/objects/Воланд (CHAR-01J8Z6M4K2Q7V9X3N5B0C1D2G9).md` | Неизвестный тип объекта: character |
| error | `contract.r4` | `examples/vault/objects/Глава 7 (CHAP-01J8Z6M4K2Q7V9X3N5B0C1D5B7).md` | Неизвестный тип объекта: chapter |
| error | `contract.r4` | `examples/vault/objects/Глава 9 (CHAP-01J8Z6M4K2Q7V9X3N5B0C1D5B9).md` | Неизвестный тип объекта: chapter |
| error | `contract.r4` | `examples/vault/objects/Иван Бездомный (CHAR-01J8Z6M4K2Q7V9X3N5B0C1D2G8).md` | Неизвестный тип объекта: character |
| error | `contract.r4` | `examples/vault/objects/Иллюстрации к «Мастеру и Маргарите» (GALLERY-01J8Z6M4K2Q7V9X3N5B0C1D2GB).md` | Неизвестный тип объекта: gallery |
| error | `contract.r4` | `examples/vault/objects/Мастер и Маргарита (BOOK-01J8Z6M4K2Q7V9X3N5B0C1D2AC).md` | Неизвестный тип объекта: book |
| error | `contract.r4` | `examples/vault/objects/Мастер и Маргарита (рукопись) (BOOK-01J8Z6M4K2Q7V9X3N5B0C1D2G7).md` | Неизвестный тип объекта: book |
| error | `contract.r4` | `examples/vault/objects/Михаил Булгаков (PERSON-01J8Z6M4K2Q7V9X3N5B0C1D2EF).md` | Неизвестный тип объекта: person |
| error | `contract.r4` | `examples/vault/objects/Пролог (CHAP-01J8Z6M4K2Q7V9X3N5B0C1D5B0).md` | Неизвестный тип объекта: chapter |
| error | `contract.r4` | `examples/vault/objects/Художественная литература (ORG-01J8Z6M4K2Q7V9X3N5B0C1D2GA).md` | Неизвестный тип объекта: organization |
| error | `relation.r2` | `examples/vault/relations/Авторство «Мастера и Маргариты» (REL-01J8Z6M4K2Q7V9X3N5B0C1D3B2).md` | Субъект типа book недопустим для отношения «Автор» |
| error | `relation.r3` | `examples/vault/relations/Авторство «Мастера и Маргариты» (REL-01J8Z6M4K2Q7V9X3N5B0C1D3B2).md` | Объект типа person недопустим для отношения «Автор» |
| error | `relation.r2` | `examples/vault/relations/Воланд — главный герой «Мастера и Маргариты» (REL-01J8Z6M4K2Q7V9X3N5B0C1D3C4).md` | Субъект типа character недопустим для отношения «Воплощает» |
| error | `relation.r3` | `examples/vault/relations/Воланд — главный герой «Мастера и Маргариты» (REL-01J8Z6M4K2Q7V9X3N5B0C1D3C4).md` | Объект типа book недопустим для отношения «Воплощает» |
| error | `relation.r2` | `examples/vault/relations/Иван Бездомный — главный герой «Мастера и Маргариты» (REL-01J8Z6M4K2Q7V9X3N5B0C1D3C2).md` | Субъект типа character недопустим для отношения «Воплощает» |
| error | `relation.r3` | `examples/vault/relations/Иван Бездомный — главный герой «Мастера и Маргариты» (REL-01J8Z6M4K2Q7V9X3N5B0C1D3C2).md` | Объект типа book недопустим для отношения «Воплощает» |
| warn | `lifecycle.r2` | `examples/vault/objects/Мастер и Маргарита (рукопись) (BOOK-01J8Z6M4K2Q7V9X3N5B0C1D2G7).md` | На архивный объект «Мастер и Маргарита (рукопись)» ссылаются активные: examples/vault/relations/Слияние дубликата «Мастер и Маргарита (рукопись)» (REL-01J8Z6M4K2Q7V9X3N5B0C1D4F1).md |
| warn | `lifecycle.r2` | `examples/vault/taxonomy/Драматург (CAT-01J8Z6M4K2Q7V9X3N5B0C1D3A8).md` | На архивный объект «Драматург» ссылаются активные: examples/vault/aspects/literary_person (ASPECT-01J8Z6M4K2Q7V9X3N5B0C1D3E1).md |
| warn | `relation.r7` | `examples/vault/relations/Авторство «Мастера и Маргариты» (REL-01J8Z6M4K2Q7V9X3N5B0C1D3B2).md` | Не рекомендуется: «Автор» обычно связывает другие типы |
| error | `meta.r15` | `examples/vault/automations/create_chapter (AUTO-01J8Z6M4K2Q7V9X3N5B0C1D5A3).md` | Поле part_of не принадлежит целевому типу автоматизации |
| error | `meta.r15` | `examples/vault/automations/create_chapter (AUTO-01J8Z6M4K2Q7V9X3N5B0C1D5A3).md` | Поле order не принадлежит целевому типу автоматизации |
| warn | `meta.r13` | `examples/vault/properties/role (PROP-01J8Z6M4K2Q7V9X3N5B0C1D3C3).md` | Определение свойства «Роль» не используется ни одним типом или аспектом |
| info | `link.r1` | `examples/vault/taxonomy/Медиа (TAX-01J8Z6M4K2Q7V9X3N5B0C1D3G1).md` | Ссылка «Медиаобёртка (MEDIA-01J8Z6M4K2Q7V9X3N5B0C1000M)» разрешается записью индекса типов ядра, файла в хранилище нет (Q-55) |
| info | `link.r1` | `examples/vault/taxonomy/Словари значений (TAX-01J8Z6M4K2Q7V9X3N5B0C1D3E8).md` | Ссылка «Отношение (REL-01J8Z6M4K2Q7V9X3N5B0C1000R)» разрешается записью индекса типов ядра, файла в хранилище нет (Q-55) |

### Матрица: какие правила проверены на канонических примерах

| Правило | Уровень | Результат |
|---|---|---|
| `alias.r1` | warn | ✅ нарушений нет |
| `alias.r2` | warn | ✅ нарушений нет |
| `alias.r3` | error | ✅ нарушений нет |
| `aspect.r1` | warn | ⬜ не реализовано в песочнице |
| `aspect.r2` | error | ⬜ не реализовано в песочнице |
| `aspect.r3` | error | ✅ нарушений нет |
| `aspect.r4` | error | ✅ нарушений нет |
| `aspect.r5` | warn | ⬜ не реализовано в песочнице |
| `aspect.r6` | info | ✅ нарушений нет |
| `classif.r1` | error | ✅ нарушений нет |
| `classif.r2` | error | ❌ error: 9 |
| `classif.r3` | error | ✅ нарушений нет |
| `classif.r4` | error | ✅ нарушений нет |
| `classif.r5` | error | ✅ нарушений нет |
| `classif.r6` | warn | ✅ нарушений нет |
| `classif.r7` | warn | ⚠️ warn: 1 |
| `classif.r8` | error | ✅ нарушений нет |
| `classif.r9` | warn | ✅ нарушений нет |
| `classif.r10` | error | ✅ нарушений нет |
| `classif.r11` | error | ✅ нарушений нет |
| `classif.r12` | warn | ⬜ не реализовано в песочнице |
| `contract.r1` | error | ⬜ не реализовано в песочнице |
| `contract.r2` | error | ⬜ не реализовано в песочнице |
| `contract.r3` | error | ✅ нарушений нет |
| `contract.r4` | error | ❌ error: 10 |
| `contract.r5` | error | ⬜ не реализовано в песочнице |
| `contract.r6` | error | ⬜ не реализовано в песочнице |
| `contract.r7` | error | ⬜ не реализовано в песочнице |
| `contract.r8` | error | ⬜ не реализовано в песочнице |
| `contract.r9` | warn | ✅ нарушений нет |
| `contract.r10` | error | ✅ нарушений нет |
| `contract.r11` | error | ✅ нарушений нет |
| `contract.r12` | warn | ✅ нарушений нет |
| `format.r1` | error | ⬜ не реализовано в песочнице |
| `format.r2` | error | ⬜ не реализовано в песочнице |
| `format.r3` | info | ✅ нарушений нет |
| `inherit.r1` | error | ⬜ не реализовано в песочнице |
| `inherit.r2` | error | ⬜ не реализовано в песочнице |
| `inherit.r3` | error | ⬜ не реализовано в песочнице |
| `inherit.r4` | error | ⬜ не реализовано в песочнице |
| `inherit.r5` | error | ⬜ не реализовано в песочнице |
| `inherit.r6` | error | ✅ нарушений нет |
| `inherit.r7` | warn | ⬜ не реализовано в песочнице |
| `lifecycle.r1` | error | ✅ нарушений нет |
| `lifecycle.r2` | warn | ⚠️ warn: 2 |
| `lifecycle.r3` | error | ✅ нарушений нет |
| `lifecycle.r4` | warn | ✅ нарушений нет |
| `lifecycle.r5` | info | ✅ нарушений нет |
| `link.r1` | error | ℹ️ info: 2 |
| `link.r2` | error | ⬜ не реализовано в песочнице |
| `link.r3` | error | ✅ нарушений нет |
| `link.r4` | error | ✅ нарушений нет |
| `link.r5` | warn | ✅ нарушений нет |
| `link.r6` | warn | ✅ нарушений нет |
| `media.r1` | error | ✅ нарушений нет |
| `media.r2` | error | ✅ нарушений нет |
| `media.r3` | error | ✅ нарушений нет |
| `media.r4` | warn | ✅ нарушений нет |
| `media.r5` | warn | ⬜ не реализовано в песочнице |
| `media.r6` | warn | ✅ нарушений нет |
| `media.r7` | warn | ✅ нарушений нет |
| `media.r8` | info | ✅ нарушений нет |
| `media.r9` | warn | ✅ нарушений нет |
| `meta.r1` | error | ⬜ не реализовано в песочнице |
| `meta.r2` | error | ✅ нарушений нет |
| `meta.r3` | error | ⬜ не реализовано в песочнице |
| `meta.r4` | error | ⬜ не реализовано в песочнице |
| `meta.r5` | error | ✅ нарушений нет |
| `meta.r6` | error | ✅ нарушений нет |
| `meta.r7` | error | ⬜ не реализовано в песочнице |
| `meta.r8` | error | ✅ нарушений нет |
| `meta.r9` | error | ⬜ не реализовано в песочнице |
| `meta.r10` | error | ⬜ не реализовано в песочнице |
| `meta.r11` | warn | ✅ нарушений нет |
| `meta.r12` | error | ✅ нарушений нет |
| `meta.r13` | warn | ⚠️ warn: 1 |
| `meta.r14` | error | ⬜ не реализовано в песочнице |
| `meta.r15` | error | ❌ error: 2 |
| `naming.r1` | error | ⬜ не реализовано в песочнице |
| `naming.r2` | error | ⬜ не реализовано в песочнице |
| `naming.r3` | error | ✅ нарушений нет |
| `naming.r4` | error | ⬜ не реализовано в песочнице |
| `naming.r5` | error | ⬜ не реализовано в песочнице |
| `naming.r6` | error | ✅ нарушений нет |
| `naming.r7` | error | ⬜ не реализовано в песочнице |
| `naming.r8` | error | ✅ нарушений нет |
| `naming.r9` | error | ✅ нарушений нет |
| `naming.r10` | error | ✅ нарушений нет |
| `naming.r11` | error | ✅ нарушений нет |
| `property.r1` | error | ⬜ не реализовано в песочнице |
| `property.r2` | error | ⬜ не реализовано в песочнице |
| `property.r3` | error | ⬜ не реализовано в песочнице |
| `property.r4` | error | ⬜ не реализовано в песочнице |
| `property.r5` | error | ⬜ не реализовано в песочнице |
| `property.r6` | warn | ⬜ не реализовано в песочнице |
| `property.r7` | error | ⬜ не реализовано в песочнице |
| `relation.r1` | error | ✅ нарушений нет |
| `relation.r2` | error | ❌ error: 3 |
| `relation.r3` | error | ❌ error: 3 |
| `relation.r4` | error | ✅ нарушений нет |
| `relation.r5` | error | ✅ нарушений нет |
| `relation.r6` | error | ✅ нарушений нет |
| `relation.r7` | warn | ⚠️ warn: 1 |
| `relation.r8` | warn | ⬜ не реализовано в песочнице |
| `sequence.r1` | error | ⬜ не реализовано в песочнице |
| `sequence.r2` | error | ⬜ не реализовано в песочнице |
| `sequence.r3` | error | ⬜ не реализовано в песочнице |
| `sequence.r4` | error | ⬜ не реализовано в песочнице |
| `sequence.r5` | warn | ⬜ не реализовано в песочнице |
| `sequence.r6` | error | ⬜ не реализовано в песочнице |
| `unique.r1` | error | ⬜ не реализовано в песочнице |
| `unique.r2` | error | ✅ нарушений нет |
| `view.r1` | error | ✅ нарушений нет |
| `view.r2` | warn | ✅ нарушений нет |
<!-- END GENERATED: examples-validation -->

## История изменений

| Версия | Дата | Изменение |
|---|---|---|
| 0.1.0 | 2026-10-21 | Документ создан в фазе 3b: песочница проверки канонических примеров (схема 0.14.0 + межобъектные правила) |
