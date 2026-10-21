---
doc: changelog
status: actual
version: 0.15.0
updated: 2026-10-21
---

# Changelog

Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/), версии — [semver](https://semver.org/lang/ru/).
Правила повышения версии метамодели — в `docs/templates/CHANGELOG_ENTRY_TEMPLATE.md`.
Компактная история версий — в `docs/changelog/METAMODEL_VERSIONS.md`.

---

## [Unreleased]

Пусто. Следующий шаг — **3c, пачка 2** (Q-66 = A): описания `Taxonomy`, `Facet`, `Category`,
`Relation`; затем пачка 3 (`MediaAsset`, `View`, `Automation`, `Aspect` — в ней решается
распространение `layer`, F-3.3). После пачек: перевод описаний в `status: actual`, фаза 3d
(отчёт о качестве, Q-18).

---

## [0.15.0] - 2026-10-21

**Версия метамодели:** 0.15.0 · **Стадия:** review
**Причина выпуска:** старт фазы 3c. Описания первой пачки типов вскрыли нормативную дыру:
идентификатор типа (`book` в поле `type` экземпляров) не хранился ни в одном поле определения
`ObjectType` — индекс типов строился хардкодом (находка F-3.27). Принят **ADR-0012** — первый
новый ADR после заморозки ядра (D-0056 допускает расширение только через ADR): введено
обязательное поле `ObjectType.type_id`. В тот же перевыпуск схемы сложены условное ограничение
`meta.r16` (D-0072) и редакционная правка F-3.26. Ранее в волне закреплено: `PropertyType` —
постоянно deprecated-тип ядра (D-0071).
**Связанные решения:** D-0070, D-0071, D-0072, D-0073 · **ADR:** ADR-0012 (новый)

### Added
- **ADR-0012 «Идентификатор типа хранится в определении (`ObjectType.type_id`)»**: поле обязательно,
  EN snake_case (`^[a-z][a-z0-9_]*$`, ≤ 64), глобально уникально среди `ObjectType`, не совпадает
  с идентификаторами системных типов M1, неизменяемо (изменение = миграция, отложена). Индекс типов
  строится из данных; D-0021 (типы как данные без ADR) становится выполнимым.
- `schema/0.15.0/**` (17 файлов) + точка входа `metamodel-0.15.0.schema.json`: поле `type_id`
  во фрагменте `object_type` (x-rules `naming.r12`); условное ограничение `meta.r16`
  (`scope: family` ⇒ `applies_to` присутствует; пустой список — явное «все ветви»).
- Правила каталога **`naming.r12`** (формат `type_id`, схема) и **`naming.r13`** (уникальность
  и несовпадение с M1, валидатор): `RULES.md` 0.16.0 — **117 правил** (86 error, 27 warn, 4 info).
- Контрольный пример `n16_object_type_without_type_id` — **34 примера**, 34 из 34 прошли.
- **Фаза 3c, пачка 1**: описания `entities/object_type.md`, `property.md`, `property_type.md`
  (status deprecated), `relation_type.md` — по `ENTITY_TEMPLATE` 1.1.0, статус `draft`;
  §4 каждого сверены с фрагментами схемы, §8 — выписки правил с отметкой «кто проверяет»,
  §11 — заметки канонического хранилища.
- `ENTITY_TEMPLATE.md` 1.1.0 (D-0070): описание сущности — семантика L-1, источник формы — схема
  (ADR → схема → типы); атрибуты приведены к ADR-0001/0002, D-0065, ADR-0009; frontmatter описания
  дополнен `schema_fragment`, `canonical_example`.
- `docs/plugin/WORKFLOW_PROPOSALS.md` (0.2.0, L-2): реестр предложений по рабочим процессам плагина;
  зарегистрированы и маршрутизированы **WF-01…WF-05** (действия с пустыми ссылками, псевдоним из
  пустой ссылки, кастомный виджет свойств — конфликт P-API-1, отображение `title` вместо имени
  файла — пересмотр отклонённого §4.4, автообновление `updated_at`). ADR-кандидатов нет.

### Changed
- `tools/examples/check.cjs`: индекс типов строится по `fm.type_id` определений; хардкод
  `PREFIX_TO_TYPE`/`PREFIX_TO_TYPE_REV` удалён; префикс экземпляра берётся из определения его типа;
  добавлена проверка `naming.r13`. `tools/examples/generate.cjs`: `type_id` пишется во frontmatter
  определений; каноническое хранилище пересобрано (105 заметок, прогон 0 error / 4 warn / 0 info).
- Покрытие каталога схемой: **31 из 117 (26 %)** (+`naming.r12`, +`meta.r16`), только валидатор: 86;
  exercised на примерах: 87 из 117.
- `NAME_MAPPING.md` → 0.13.0 (§1: формат `type_id`); `RULES.md` → 0.16.0.
- `schema/metamodel-0.14.0.schema.json` помечена `x-superseded-by`; каталог `schema/0.14.0/` сохранён.

### Deprecated
- **`PropertyType` — постоянно deprecated-тип ядра (D-0071, Q-63 = A)**: переходный статус D-0066
  стал постоянным. Ядро — 12 типов; 6 объектов канона с `lifecycle: deprecated`; `PTYPE` не
  переиспользуется; плагин не предлагает тип при создании. Исключение из ядра (Q-63 = B) отклонено.

### Removed
- Хардкод соответствия префиксов и идентификаторов типов из песочницы (`PREFIX_TO_TYPE`,
  `PREFIX_TO_TYPE_REV`); виртуальные записи индекса типов не возвращались (отменены D-0067).

### Fixed
- **F-3.27** (идентификатор типа не хранился) — закрыта ADR-0012/D-0073.
- **F-3.26** (description `sequential_parent` «cardinality 1» против `sequence.r2` «∈ {1, 0..1}») —
  исправлено в 0.15.0.
- Манифест примеров: `typeId` записей `object_type` (чекер падал с «Индекс типов пуст») — с этого
  выпуска индекс строится из данных заметок, зависимость от манифеста снята.

### Migrations
- Требуется: нет (данных в хранилище пользователя нет); канон и контрольные примеры пересобраны скриптами.
- Накопленный список (пять позиций) не меняется; изменение `type_id` существующего типа запрещено
  без отдельного решения (стало бы шестой миграцией).

### Артефакты выпуска
- `docs/adr/ADR-0012-object-type-identifier.md` (new)
- `schema/metamodel-0.15.0.schema.json`, `schema/0.15.0/**` (new, 17 файлов);
  `schema/dist/metamodel-0.15.0.bundle.json`, `src/generated/metamodel-0.15.0.types.ts` (производные)
- `schema/metamodel-0.14.0.schema.json` (updated: superseded)
- `docs/validation/RULES.md` → 0.16.0; `RULES_COVERAGE.md`, `SCHEMA_VALIDATION_RUN.md`,
  `EXAMPLES_VALIDATION_RUN.md`, `SCHEMA_VALIDATION_REPORT.md` (updated)
- `docs/metamodel/entities/*.md` (new, 4 описания), `docs/metamodel/NAME_MAPPING.md` → 0.13.0
- `docs/templates/ENTITY_TEMPLATE.md` → 1.1.0; `docs/plugin/WORKFLOW_PROPOSALS.md` (new → 0.2.0)
- `tools/fixtures/generate.cjs` (34 примера), `tools/examples/generate.cjs`, `tools/examples/check.cjs`
- `examples/vault/types/**` (пересобрано: +`type_id`), `examples/vault-manifest.json`
- `docs/decisions/DECISION_LOG.md` (D-0070…D-0073), `docs/PROJECT_MAP.md` → 0.15.0

### Сообщение коммита
```
feat(metamodel): ObjectType.type_id stored in the definition (0.15.0, ADR-0012)

- ADR-0012: required ObjectType.type_id — the type index is built from vault data, prefix hardcode removed (F-3.27, D-0073)
- schema 0.15.0: type_id field (naming.r12), meta.r16 condition (scope family ⇒ applies_to, D-0072), sequential_parent description fixed (F-3.26)
- catalog: naming.r12/naming.r13 — 117 rules (RULES 0.16.0); coverage 31/117, exercised 87/117
- PropertyType is permanently a deprecated core type (D-0071)
- phase 3c batch 1: entity descriptions for ObjectType, Property, PropertyType, RelationType (draft)
- fixtures: 34 examples, all pass; vault run: 0 errors / 4 intentional warns
```

---

## [0.14.0] - 2026-10-21

**Версия метамодели:** 0.14.0 · **Стадия:** review
**Причина выпуска:** завершён шаг 3b — построено каноническое хранилище примеров `examples/vault/`
(105 заметок, все шесть сценариев) и межобъектный чекер; постройка вскрыла шесть находок
(F-3.20…F-3.25, одна снята как неподтверждённая) и один вопрос пользователю (Q-55). Норма записи
системных типов принята (D-0067), фрагмент `media_asset` и запись пустых полей исправлены (D-0068),
режим предупреждений канона установлен (D-0069). Схема перевыпущена как 0.14.0, артефакты 0.13.0
сохранены. Выполнены редакционные правки примеров ADR, запланированные фазой 3b.
**Связанные решения:** D-0067, D-0068, D-0069 · **ADR:** нет (изменения уточняют и закрепляют
уже принятые решения ADR-0005, ADR-0006, ADR-0008, ADR-0011; новых механизмов нет)

### Added
- **Каноническое хранилище примеров `examples/vault/` — 105 заметок + 4 медиафайла-заглушки.**
  Все шесть сценариев фазы 3b: книга с главами и обложкой («Мастер и Маргарита»: Пролог, Глава 7,
  Глава 9; обложка-обёртка с активным аспектом `ai_generated_media`), человек с двумя профессиями
  и аспектами (Михаил Булгаков: `cat_profession` [Романист, Врач], аспект `literary_person`),
  проект с задачами, организация с типом (`org_type`), галерея иллюстраций, отношение с периодом
  (`valid_from`/`valid_to`) и слияние архивного дубликата. Хранилище **производное**: генерируется
  `tools/examples/generate.cjs` из реестров `tools/examples/data-*.cjs` и `vault-data.cjs`;
  ручные правки заметок запрещены. Прогон: **0 error / 4 warn / 0 info**, все четыре warn —
  намеренные демонстрации правил (`sequence.r5` ×2, `lifecycle.r2`, `meta.r13`), объяснены в телах
  заметок (D-0069).
- **Межобъектный чекер `tools/examples/check.cjs`** — песочница фазы 3b, не код плагина:
  двухпроходная валидация формы (нормативный алгоритм F-3.17) + межобъектные правила каталога
  (разрешение ссылок и каноническая форма, уникальность, наследование и эффективный набор свойств,
  активация аспектов, классификация, последовательности, область уникальности, медиа, жизненный
  цикл, имена файлов). На примерах exercised **85 из 114 правил**; результат — производный отчёт
  `docs/validation/EXAMPLES_VALIDATION_RUN.md` + `examples-validation.json`.
- `examples/vault-manifest.json` — производный реестр хранилища (вход чекера): ключ, ULID, тип,
  префикс, `typeId` определений `object_type` (индекс типов), путь к файлу.
- `schema/0.14.0/**` (17 файлов): `formats.json#/$defs/system_type_name` (enum `category`,
  `media_asset`, `relation` — D-0067); `Aspect.layer` (F-3.20); `Property.applies_to`
  (допущение A-7, F-3.23); условие `meta.r3` — строгое `target_types: [category]`;
  `media_asset` с открытым словарём аспектных полей (D-0068). Точка входа
  `schema/metamodel-0.14.0.schema.json` с `x-previous-schema` на 0.13.0.
- Контрольный пример `n15_aspect_bad_layer` (итого **33 примера**, 33 из 33 прошли).
- `SCHEMA_VALIDATION_REPORT.md` §2.2 — находки волны 0.14.0 (F-3.20…F-3.25); §3 — допущение A-7;
  §5 — Q-55 (закрыт D-0067).
- `package.json`: скрипты `examples:generate`, `examples:check`, `examples:all`;
  `test` = `schema:all` + `examples:all`; версия пакета 0.14.0. **`package-lock.json` закоммичен**:
  производные файлы (`src/generated/**`, `schema/dist/**`) обязаны пересобираться детерминированно.

### Changed
- **Норма записи системных типов (D-0067, Q-55 = A).** В `Taxonomy.applicable_types` и
  `Property.target_types` ссылка на `ObjectType` записывается wikilink-ссылкой в канонической
  форме (ADR-0002 §4); системный тип M1 (`relation`, `media_asset`, `category`) — **голой строкой
  snake_case**: у системных типов нет определения `ObjectType` и файла-цели. Запись согласована
  с полем `type` экземпляра (ADR-0005). `NAME_MAPPING.md` §7.1 → 0.12.0 (норма + унификация
  обозначений), `RULES.md` `meta.r5` → 0.14.0.
- `target_types` медиа-свойств стал точным: `[media_asset]` у `cover`, `portrait`, `logo`,
  `illustrations`, `source_image`; `[category]` у `role` — вместо пустого списка «любой тип».
- `m1/media_asset.json`: `unevaluatedProperties: true` (D-0068) — состав полей экземпляра
  системного типа определяют аспекты-данные (`prompt`, `model`, `seed`); эффективный набор
  проверяется межобъектно. Закрытый словарь (A-2) сохранён для определений M1.
- Пустое необязательное поле опускается, а не записывается как `null` (F-3.25): `source_url`
  канонических обёрток.
- Покрытие каталога схемой: **29 из 114** (+`meta.r3` — строгое условие покрыло правило),
  только валидатор: 85.
- `RULES.md` §17: восстановлены отсутствовавшие строки истории 0.12.0 и 0.13.0
  (пробел полноты реестра, предсуществовавший волне).
- `tools/examples/check.cjs`: `classif.r7` учитывает категории из `Aspect.trigger_categories`
  как используемые (D-0069); `link.r1` учитывается в exercised при успешном разрешении.
- **Редакционные правки примеров ADR (обязательство фазы 3b, отдельные коммиты):**
  F-3.9 — ADR-0003: кардинальность `0..n`/`1..n` (3 места); F-3.5 — ADR-0006 и RULES §6:
  интервалы в `YYYY-MM-DD` закавыченной строкой (D-0065); F-3.11 — ADR-0006 §3.1: `parent: null`;
  F-3.13 — `03_chapter_scenario` §3.4: `sys:title` вместо wikilink-записи sys-поля.
  F-3.14 (28-символьные «ULID») и правки `title` фасетов (F-3.1/D-0063) закрыты ранее при
  постройке хранилища — проверено программно: все идентификаторы в ADR ровно 26 символов
  и согласованы с идентификаторами `examples/vault/`.

### Deprecated
- `PropertyType`: без изменений — сохраняется в ядре с рекомендуемым `lifecycle: deprecated`,
  решение об исключении отложено в фазу 3c (D-0066).

### Removed
- Промежуточный механизм **виртуальных записей индекса типов** (фабрикации псевдо-ULID
  `…C1000M`/`…C1000R`/`…C1000C` для ссылок на системные типы, находка F-3.21) — отменён
  решением D-0067 до выпуска; в каноническом хранилище не использовался ни дня.
- Более ничего: артефакты 0.12.0 и 0.13.0 сохранены (точки входа помечены `x-superseded-by`).

### Fixed
- **F-3.20** (пример ADR-0008 §3.1 с `layer: system` отклонялся схемой) — поле объявлено
  во фрагменте аспекта.
- **F-3.21** (не определена форма ссылки на системные типы; условие `meta.r3` отклоняло канон) —
  закрыта D-0067.
- **F-3.22** — **снята как неподтверждённая**: ADR-0009 §5 формулирует `lifecycle.r1` так же,
  как RULES.md §12 (цель связи замены не архивная); ошибка была в тексте примера отношения —
  исправлен (`data-relations.cjs`), шаги процедуры слияния в тексте уточнены (4–6).
- **F-3.24** (`media_asset` отклонял поля активного аспекта), **F-3.25** (`source_url: null`) —
  закрыты D-0068.
- Манифест примеров терял `typeId` записей `object_type` — чекер падал с «Индекс типов пуст»;
  проекция манифеста исправлена.

### Migrations
- Требуется: нет (данных в хранилище пользователя нет).
- Накопленный список миграций прежний (пять позиций), все отложены до после-MVP.

### Артефакты выпуска
- `schema/metamodel-0.14.0.schema.json`, `schema/0.14.0/**` (new, 17 файлов)
- `schema/dist/metamodel-0.14.0.bundle.json`, `src/generated/metamodel-0.14.0.types.ts` (производные)
- `schema/metamodel-0.13.0.schema.json` (updated: superseded)
- `examples/vault/**` (new, 105 заметок + 4 заглушки), `examples/vault-manifest.json` (new)
- `tools/examples/**` (new: generate, check, 9 реестров данных)
- `tools/fixtures/invalid/n15_aspect_bad_layer.md` (new, 33 примера)
- `docs/metamodel/NAME_MAPPING.md` → 0.12.0; `docs/metamodel/03_chapter_scenario.md` (updated)
- `docs/validation/RULES.md` → 0.14.0 (meta.r5, §6, §17); `RULES_COVERAGE.md`,
  `SCHEMA_VALIDATION_RUN.md`, `EXAMPLES_VALIDATION_RUN.md` (updated/new)
- `docs/validation/SCHEMA_VALIDATION_REPORT.md` → 0.14.0 (§2.2, A-7, Q-55)
- `docs/adr/ADR-0003`, `ADR-0006` (updated: редакционные правки примеров)
- `docs/decisions/DECISION_LOG.md` (updated: D-0067…D-0069)
- `package.json` (0.14.0, скрипты examples:*), `package-lock.json` (new)

### Сообщение коммита
```
feat(metamodel): canonical examples vault and system-type notation (0.14.0)

- examples/vault: 105 generated notes, six scenarios; run is green (0 errors, 4 intentional warns)
- tools/examples: deterministic generator + cross-object checker (85 of 114 rules exercised)
- system types in applicable_types/target_types are bare snake_case strings (D-0067)
- media_asset fragment opens unevaluated properties for aspect fields; empty optional fields are omitted (D-0068)
- schema 0.14.0: Aspect.layer, Property.applies_to (A-7), strict meta.r3; 0.13.0 kept as superseded
- fixtures: 33 examples, all pass; ADR examples fixed (F-3.5, F-3.9, F-3.11, F-3.13)
```

---

## [0.13.0] - 2026-10-21

**Версия метамодели:** 0.13.0 · **Стадия:** review
**Причина выпуска:** пользователь ответил на четыре вопроса, поднятых постройкой схемы
(Q-51…Q-54). Три ответа меняют норму (роль поля `title`, таксономия-словарь, запись дат),
один — обязательность поля. Норма зафиксирована в документах и в схеме; схема перевыпущена
как 0.13.0, артефакты 0.12.0 сохранены.
**Связанные решения:** D-0063, D-0064, D-0065, D-0066 · **ADR:** нет (изменения уточняют
и закрепляют уже принятые решения ADR-0001, ADR-0005…ADR-0007, ADR-0011; новых механизмов нет)

### Added
- **`docs/metamodel/NAME_MAPPING.md` §0 «Два смысла поля `title`» (нормативно, D-0063).**
  `title` является **ключом** (EN snake_case) у `Property`, `PropertyType`, `RelationType`,
  `Facet`, `Aspect`, `Automation` и **отображаемым названием** у `ObjectType`, `Relation`,
  `Taxonomy`, `Category`, `MediaAsset`, `View` и экземпляров предметных типов. Четыре следствия:
  `label` не заменяется ключом; `Facet` хранит ключ дважды (`title` и обязательный `key`),
  расхождение — `error`; `contract.r6` применяется ко всем объектам, `contract.r11`/`r12` —
  только к объектам с отображаемым названием; примеры ADR подлежат редакционной правке.
- **`NAME_MAPPING.md` §7.1: норма таксономии-словаря (D-0064).** Фасет, чьи категории используются
  как значения свойства (`char_role` → `Relation.role`), принадлежит таксономии с
  `applicable_types: [relation]`. `meta.r5` не ослабляется; поле `cat_char_role` не создаётся;
  `classif.r3` к такому фасету не применяется.
- **`NAME_MAPPING.md` §8: правило записи даты (D-0065).** Нормативным остаётся ISO 8601 с offset;
  значение пишется **закавыченной строкой**, потому что YAML-парсер приводит незакавыченное значение
  к `Date`, а сериализация отдаёт UTC. `format.r3` (info) не меняется.
- **`docs/plugin/ARCHITECTURE.md` §4.1.2 «Запись дат и времени»** (нормативно для `ObjectWriter`):
  пять пунктов, включая запрет передачи `Date` в путь записи и проверку поведения панели свойств
  на этапе 0 фазы 5.
- `schema/0.13.0/**` — новая версия фрагментов: `title` как ключ у `relation_type`, `facet`,
  `property_type` (с обязательностью); помета `x-title-role` во всех 12 фрагментах M1;
  `x-decision` в `formats.json#/$defs/datetime`; `x-notes` о таксономии-словаре в `taxonomy.json`.
- `schema/metamodel-0.13.0.schema.json` — точка входа с `x-previous-schema` на 0.12.0.
- Два контрольных примера на новую норму: `n13_relation_type_title_not_key`, `n14_facet_title_not_key`
  (итого **32 примера**).
- Инструменты переведены на выбор активной версии по признаку `x-superseded-by` у точки входа,
  а не по сортировке имён: каталоги предыдущих версий сохраняются как артефакты выпусков.

### Changed
- `schema/0.13.0/m1/{relation_type,facet,property_type}.json`: поле `title` добавлено в `required`
  и ограничено регулярным выражением ключа. Для существующих данных изменение было бы ломающим;
  данных в хранилище нет, поэтому выпуск — `MINOR`.
- `docs/validation/RULES.md` → 0.13.0: уточнена область действия `contract.r6`, `contract.r11`,
  `contract.r12` (D-0063); `naming.r10` ограничено определениями M1 — на экземпляры системных типов
  (`Relation`, `MediaAsset`) не распространяется (D-0066). **Состав каталога не менялся: 114 правил**
  (83 error, 27 warn, 4 info) — пересчитано программно.
- `docs/metamodel/00_overview.md` → 0.12.0: §2 дополнен нормой о двух ролях `title`.
- `docs/metamodel/NAME_MAPPING.md` → 0.11.0.
- `docs/plugin/ARCHITECTURE.md` → 0.3.0.
- `schema/metamodel-0.12.0.schema.json`: проставлены `x-superseded-by` и `x-metamodel-stage:
  superseded`. Файл и каталог `schema/0.12.0/` сохранены (старое не удаляем).
- Покрытие правил схемой не изменилось: **28 из 114 (25 %)**, 86 у валидатора.

### Deprecated
- `PropertyType`: статус подтверждён решением D-0066 — тип сохраняется в ядре с рекомендуемым
  `lifecycle: deprecated`, префикс `PTYPE` не переиспользуется. **Решение об исключении из ядра
  отложено в фазу 3c** (описания 12 типов).

### Removed
- Ничего. Старые артефакты не удаляются.

### Fixed
- **F-3.1, F-3.19** (роль `title` и область действия `contract.r6/r11/r12`) — закрыты D-0063.
- **F-3.4** (формат `datetime`) — закрыт D-0065.
- **F-3.10** (таксономия-словарь `char_role` против `meta.r5`) — закрыта D-0064.
- **F-3.12** (`MediaAsset.label`) — закрыт D-0066.
- **F-3.2** (`PropertyType`) — переведён из «требует решения» в «отложен в фазу 3c» (D-0066).
- Восстановлены повреждённые отметки статуса находок в `SCHEMA_VALIDATION_REPORT.md` (артефакт
  правки регулярным выражением по многосимвольному emoji); файл проверен на одиночные суррогаты.

### Migrations
- Требуется: нет (данных в хранилище нет).
- Накопленный список миграций прежний (пять позиций), все отложены до после-MVP.
- Отдельно для фазы 3b: редакционные правки примеров в ADR-0003, ADR-0006, ADR-0008, ADR-0011,
  `00_overview.md` §7.3 и `03_chapter_scenario.md` — 28-символьные «ULID», `0..N`, `parent: []`,
  wikilink-запись `sys`-поля, целые годы в `valid_from`, `title: Профессия` у фасета.

### Артефакты выпуска
- `schema/metamodel-0.13.0.schema.json` (new), `schema/0.13.0/**` (new, 16 фрагментов)
- `schema/dist/metamodel-0.13.0.bundle.json`, `src/generated/metamodel-0.13.0.types.ts` (new, производные)
- `schema/metamodel-0.12.0.schema.json` (updated: superseded)
- `docs/metamodel/NAME_MAPPING.md` (updated: §0, §7.1, §8)
- `docs/metamodel/00_overview.md` (updated: §2)
- `docs/validation/RULES.md` (updated: §2, §3)
- `docs/validation/SCHEMA_VALIDATION_REPORT.md`, `RULES_COVERAGE.md`, `SCHEMA_VALIDATION_RUN.md` (updated)
- `docs/plugin/ARCHITECTURE.md` (updated: §4.1.2)
- `docs/decisions/DECISION_LOG.md` (updated: D-0063…D-0066)
- `tools/*.cjs` (updated: выбор активной версии схемы), `tools/fixtures/generate.cjs` (updated)

### Сообщение коммита
```
feat(metamodel): fix title semantics, dictionary taxonomy and datetime writing (0.13.0)

- NAME_MAPPING §0: title is a key for six definition types, a display name for the rest (D-0063)
- NAME_MAPPING §7.1: dictionary taxonomy declares applicable_types: [relation] (D-0064)
- NAME_MAPPING §8 + ARCHITECTURE §4.1.2: datetimes are written as quoted strings with offset (D-0065)
- RULES: scope of contract.r6/r11/r12 clarified, naming.r10 limited to M1 definitions (D-0066)
- schema 0.13.0: title required as key on relation_type, facet, property_type; 0.12.0 kept as superseded
- fixtures: 32 examples (2 new for the title norm), all pass
```

---

## [0.12.0] - 2026-10-21

**Версия метамодели:** 0.12.0 · **Стадия:** review (ядро описано машиночитаемо и проверено прогоном)
**Причина выпуска:** завершён шаг 3a — метамодель впервые записана в машиночитаемой форме и проверена:
собрана JSON Schema, из неё сгенерированы TypeScript-типы, прогнаны 30 контрольных примеров,
посчитано покрытие каталога правил. Постройка вскрыла 15 расхождений между прозой и схемой.
**Связанные решения:** D-0061, D-0062 (а также восстановленные записи D-0021, D-0022) · **ADR:** нет
(семантика ядра не менялась: выпуск фиксирует машиночитаемую форму уже принятых решений ADR-0001…ADR-0011)

### Added
- `schema/metamodel-0.12.0.schema.json` — точка входа: диспетчеризация объекта frontmatter по полю `type`
  (13 веток: 12 системных типов M1 и конверт экземпляра M0), снимок реестра префиксов (21 активный).
- `schema/0.12.0/common/` (4 фрагмента) — `formats.json` (ULID, `type_prefix`, `Facet.key`, `Property.key`
  с запретом зарезервированных префиксов, wikilink и его каноническая форма, дата, дата-время, тег,
  `sys:`-адрес, путь файла), `enums.json` (15 закрытых перечислений и наборы идентификаторов типов),
  `system_contract.json` (8 полей контракта + расширяемый слой `cat_*`), `m0_instance.json` (конверт экземпляра).
- `schema/0.12.0/m1/` (12 фрагментов) — по файлу на системный тип: `object_type`, `property`,
  `property_type`, `relation_type`, `relation`, `taxonomy`, `facet`, `category`, `aspect`,
  `media_asset`, `view`, `automation`. Условные ограничения выражены в схеме: `naming.r7`
  (префикс и абстрактность), `sequence.r1` (пара полей последовательности), `meta.r2` (`target_types`
  при `value_type: reference`), `meta.r3` (`target_facet` только при `target_types: [category]`),
  `inherit.r1`/`inherit.r2` (запрет `definition` и `value_type` в `property_overrides`).
- `schema/dist/metamodel-0.12.0.bundle.json` — **производный** единый файл (219 КБ) для инструментов,
  не разрешающих внешние `$ref`; собирается скриптом, не редактируется.
- `src/generated/metamodel-0.12.0.types.ts` — **производные** TypeScript-типы из схемы
  (19 экспортов, 47 КБ): `SystemContract`, 12 типов M1, `PropertyOverride`, `M0Instance`,
  объединение `MetamodelObject`, константа `METAMODEL_VERSION`. Ручные правки запрещены (D-0062).
- `tools/` — конвейер артефактов: `schema-lint.cjs` (9 статических проверок схемы: метаданные
  фрагментов, соответствие `$id` пути, разрешимость всех 125 `$ref`, согласование версий, запрет
  соседних с `$ref` ключевых слов в ветках диспетчеризации, наличие `type: const` и подчинение
  системному контракту у 12 фрагментов M1, соответствие аннотаций `x-rules` каталогу, свежесть
  производных файлов), `schema-bundle.cjs` (сборка), `schema-types.cjs` (генерация типов),
  `rule-coverage.cjs` (матрица покрытия), `fixtures/generate.cjs` (генерация контрольных примеров),
  `validate.cjs` (прогон). Команды — в `package.json` (`npm run schema:all`).
- `tools/fixtures/` — 30 контрольных примеров: 18 валидных (покрыты все 13 веток диспетчеризации,
  включая пользовательский тип как данные M1) и 12 невалидных (каждое условное ограничение схемы,
  обязательные поля, форматы ULID, префикса, ключа фасета). Примеры генерируются, а не пишутся руками.
- `docs/validation/RULES_COVERAGE.md` + `rules-coverage.json` — матрица покрытия каталога схемой:
  **28 из 114 правил (25 %), в том числе 27 из 83 уровня error; 86 правил остаются обязанностью
  валидатора** с указанием причины по каждому. Генерируется скриптом, все счётчики программные.
- `docs/validation/SCHEMA_VALIDATION_RUN.md` — результат прогона: **30 из 30 примеров прошли**.
- `docs/validation/SCHEMA_VALIDATION_REPORT.md` — отчёт фазы 3a: 15 находок по источникам
  (F-3.1…F-3.15), 4 находки инструментария (F-3.16…F-3.19), 6 допущений схемы, 10 случаев
  частичного покрытия, 4 вопроса пользователю (Q-51…Q-54).
- `package.json` — зависимости сборки артефактов (`ajv`, `ajv-formats`, `yaml`,
  `json-schema-to-typescript`, `@apidevtools/json-schema-ref-parser`) и скрипты. Плагин остаётся
  офлайн: зависимости нужны только на этапе сборки артефактов.
- Риски **R-12** (схема покрывает четверть каталога — до появления валидатора хранилище не защищено),
  **R-13** (TS-типы не выражают условные ограничений схемы), **R-14** (расхождения прозы и схемы)
  в `PROJECT_MAP.md` §6.

### Changed
- `docs/validation/RULES.md` → 0.12.0: добавлен §14.1 со ссылкой на матрицу покрытия и явной
  формулировкой следствия Q-50 = C. Каталог правил не менялся: **114 правил** (83 error, 27 warn, 4 info).
- `docs/changelog/METAMODEL_VERSIONS.md` → 0.12.0: правило синхронизации дополнено именами
  фрагментов (`schema/<version>/**`) и производных файлов (`schema/dist/`, `src/generated/`).
- `docs/plugin/ARCHITECTURE.md`: модуль валидации формы обязан применять **двухпроходный алгоритм**
  (выбор ветки по `type`, затем валидация её фрагментом) — иначе диагностика перечисляет провалы
  всех веток: 64–123 сообщения на один невалидный объект (F-3.17).
- `docs/decisions/DECISION_LOG.md` → 0.12.0: 62 записи, пропусков нет.
- `docs/context/CONTEXT_SNAPSHOT.md` → CS-0011.

### Deprecated
- `PropertyType` как механизм: набор значений закрыт на уровне ядра (enum `value_type`, ADR-0003),
  объекты типа не несут самостоятельной семантики. В схеме тип сохранён с рекомендуемым
  `lifecycle: deprecated`; префикс `PTYPE` не переиспользуется (`TYPE_PREFIX_REGISTRY` §1 R8).
  Решение об исключении из ядра не принято — вынесено как Q-54 (F-3.2).
- Поле `MediaAsset.source_url` остаётся в схеме по ADR-0011 §4, но механизм создания обёртки
  из сетевого адреса отложен (D-0054): заполнение вручную допустимо, автоматизации нет.

### Fixed
- **F-3.15**: `CHANGELOG.md` [Unreleased], `PROJECT_MAP.md` §2 и `CONTEXT_SNAPSHOT.md` ссылались на
  `schema/metamodel-1.0.0.schema.json`, что нарушало правило синхронизации
  `METAMODEL_VERSIONS.md` (`schema/metamodel-<version>.schema.json`). Имя исправлено на
  `metamodel-0.12.0.schema.json` во всех трёх документах.
- **F-3.16 (ошибка первой редакции схемы, найдена прогоном)**: ветки корневого `oneOf` содержали
  соседние с `$ref` ключевые слова (`properties`, `required`), которые по JSON Schema 2020-12
  применяются **наряду** с целью ссылки. Следствие: `required: ["type"]` отменял `required` фрагмента,
  и объект `type: object_type` без обязательного `label` проходил валидацию. Ветки содержат только
  `$ref`, диспетчеризация перенесена внутрь фрагментов; нарушение закрыто контрольным примером
  `n11_m0_type_collides_with_m1`.
- **F-3.6**: правило `meta.r10` сформулировано для поля `role`, переименованного в `roles`
  (ADR-0011 §3.2). Схема проверяет каждое значение списка; переформулировка правила — за фазой 3c.
- **Полнота реестра решений**: записи D-0021 и D-0022 отсутствовали в `DECISION_LOG.md` при полноте
  записей в `PROJECT_MAP.md` §4. Восстановлены с явной пометкой «запись восстановлена»; реестр
  содержит 62 записи без пропусков (проверено скриптом).

### Migrations
- Требуется: нет. Данные в хранилище отсутствуют, семантика ядра не менялась.
- Список накопленных миграций прежний (пять позиций), все отложены до после-MVP.
- Отдельно: примеры в ADR-0003, ADR-0006, ADR-0008, ADR-0011 и `00_overview.md` §7.3 требуют
  редакционных правок (28-символьные «ULID», `0..N` вместо `0..n`, `parent: []`, wikilink-запись
  `sys`-поля, целые годы в `valid_from`). Правки не меняют решений и выполняются в фазе 3b
  отдельными коммитами.

### Артефакты выпуска
- `schema/metamodel-0.12.0.schema.json` (new)
- `schema/0.12.0/common/{formats,enums,system_contract,m0_instance}.json` (new)
- `schema/0.12.0/m1/{object_type,property,property_type,relation_type,relation,taxonomy,facet,category,aspect,media_asset,view,automation}.json` (new)
- `schema/dist/metamodel-0.12.0.bundle.json` (new, производный)
- `src/generated/metamodel-0.12.0.types.ts` (new, производный)
- `tools/{schema-lint,schema-bundle,schema-types,rule-coverage,validate}.cjs`, `tools/fixtures/generate.cjs` (new)
- `tools/fixtures/{valid,invalid}/*.md` (new, 30 файлов, производные)
- `package.json` (new)
- `docs/validation/{RULES_COVERAGE.md,rules-coverage.json,SCHEMA_VALIDATION_RUN.md,SCHEMA_VALIDATION_REPORT.md}` (new)
- `docs/validation/RULES.md` (updated)
- `docs/changelog/METAMODEL_VERSIONS.md` (updated)
- `docs/decisions/DECISION_LOG.md` (updated)
- `docs/PROJECT_MAP.md`, `docs/README.md`, `docs/context/CONTEXT_SNAPSHOT.md`, `docs/plugin/ARCHITECTURE.md` (updated)

### Сообщение коммита
```
feat(schema): add metamodel 0.12.0 JSON Schema, generated TS types and validation sandbox

- split-file schema (Q-49 = B, D-0061): entry point + 16 fragments in schema/0.12.0/
- derived bundle and TypeScript types generated from the schema (Q-50 = C, D-0062)
- rule coverage matrix: 28 of 114 rules enforced by schema, 86 remain in the validator
- schema lint (9 invariants) passes; 30 sandbox fixtures (18 valid, 12 invalid) all pass
- fixed oneOf sibling-keyword bug that cancelled required fields of the referenced fragment
- findings report: 19 discrepancies between prose and machine-readable form (F-3.1...F-3.19)
- decision log completed: D-0021, D-0022 restored, D-0061, D-0062 added
```

---

## [0.11.0] - 2026-10-21

**Версия метамодели:** 0.11.0 · **Стадия:** draft → **готова к review** (фаза 2 завершена, реестр диагноза закрыт полностью)
**Причина выпуска:** пользователь подтвердил выполнение шага 7 — расслоение документов. Закрыты последние шесть позиций диагноза: C-04, C-05, C-36, C-37, C-38, C-41.
**Связанные решения:** D-0057…D-0060 · **ADR:** нет (изменения организационные, семантику ядра не меняют)

### Added
- `docs/plugin/ARCHITECTURE.md` — архитектура плагина как отдельный уровень: нормативное правило расслоения **L-1…L-4**; стек и нефункциональные требования; служебная область `.sb/` сужена до производных данных; **10 модулей ядра** (`MetamodelLoader`, `ObjectIndex`, `SchemaEngine`, `PropertyResolver`, `LinkResolver`, `ObjectWriter`, `CreationService`, `MediaResolver`, `LabelProvider`, `LegacyKeyMapper`); **5 модулей представлений**; 8 отложенных; **6 отклонённых** с обоснованием; три потока данных (загрузка, создание, внешнее изменение); требования черновика v1.1, перенесённые без изменений (§11, §15.4, §18.2, §18.4, §18.5, §18.9); **9 этапов фазы 5**; матрица интеграций с рисками и способами защиты метамодели.
- `docs/metamodel/05_document_status_register.md` — реестр исходных документов: авторитетные статусы трёх черновиков, постатейное сопоставление (48 позиций: сохранено / переработано / заменено / отклонено), недействительные идентификаторы с обоснованием структурного устранения, разделение версий документа и метамодели, статус служебных документов.
- Правило расслоения **L-1…L-4**: `docs/metamodel/**` — только семантика (запрещены имена классов и точки API); `docs/plugin/**` — только реализация (семантика не переопределяется); изменение семантики из реализации требует ADR; значения `mechanism` и `trigger` — абстрактные идентификаторы без названий инструментов.
- Приоритет источников зафиксирован нормативно: **ADR > сводное описание > правила > черновики**.
- Вопросы реализации Q-45…Q-48 распределены по этапам фазы 5.

### Changed
- `docs/metamodel/01_diagnosis.md` → 0.2.4: блок статуса переписан — **41 из 41 закрыто**, таблица по группам с указанием закрывающих артефактов. Текст диагноза по-прежнему сохранён без изменений как исторический снимок.
- `docs/PROJECT_MAP.md` → 0.11.0: фаза 2 отмечена завершённой, фаза 3 начата.
- `docs/README.md` → 0.11.0: добавлен каталог `docs/plugin/`, правило расслоения, индексы новых документов.
- Статусы черновиков в `inbox/` **не правились** (D-0059): каталог остаётся read-only, авторитетные статусы ведёт реестр.

### Fixed
- **C-36** (реализация внутри документа метамодели, ~60 % объёма v1.1): разделы 10, 11, 15, 17, 18 перенесены в `docs/plugin/ARCHITECTURE.md`; раздел 17 помещён в секцию «Отклонено».
- **C-37** (тип `документация` не определён, но использован): служебные документы не являются объектами метамодели, не имеют `id`-ULID и `type`; тип исключён из ядра (X-05 подтверждён).
- **C-38** (статусы документов не соответствуют действительности): авторитетные статусы зафиксированы в реестре — Спецификация и v1.0 `superseded`, v1.1 `partially superseded`.
- **C-41** (версии документа и метамодели смешаны): введены три независимые версии — документа, метамодели, плагина.
- **C-04, C-05** (один ID на несколько объектов в примерах черновиков): закрыты **структурно**, а не исправлением примеров — ULID не требует централизованной выдачи номеров, а нарушения обнаруживаются правилами `contract.r3`, `naming.r4…r6`, `naming.r9`.
- **Реестр диагноза закрыт полностью: 41 из 41.**

### Migrations
- Требуется: нет. Изменения организационные, семантика ядра не менялась.
- Список накопленных миграций прежний (пять позиций), все отложены до после-MVP.

### Артефакты выпуска
- `docs/plugin/ARCHITECTURE.md` (new)
- `docs/metamodel/05_document_status_register.md` (new)
- `docs/metamodel/01_diagnosis.md` (→ 0.2.4)
- `docs/PROJECT_MAP.md`, `docs/decisions/DECISION_LOG.md`, `docs/README.md` (→ 0.11.0)
- `docs/context/CONTEXT_SNAPSHOT.md` (→ CS-0010)

### Сообщение коммита
```
docs: v0.11.0 — layer metamodel from plugin architecture, close all 41 issues

- add docs/plugin/ARCHITECTURE.md: normative layering rule L-1..L-4, stack,
  .sb/ reduced to derived data, 10 core modules + 5 view modules + 8 deferred
  + 6 rejected, data flows, v1.1 requirements carried over unchanged,
  9 stages of phase 5, integration matrix with risks and protections
- add docs/metamodel/05_document_status_register.md: authoritative statuses of
  the three drafts, 48-position article-by-article mapping, void identifiers,
  document vs metamodel vs plugin versioning, service documents are not objects
- C-04/C-05 closed structurally: ULID removes the counter, contract.r3 and
  naming.r4..r6/r9 detect violations
- inbox/ stays read-only; source priority fixed: ADR > overview > rules > drafts
- diagnosis register fully closed: 41 of 41
- decisions D-0057..D-0060; phase 2 complete, phase 3 started
```

---

## [0.10.0] - 2026-10-21

**Версия метамодели:** 0.10.0 · **Стадия:** draft → **ядро M1 полное** (все 12 типов имеют определённое поведение)
**Причина выпуска:** пользователь принял Q-41 = A, Q-42 = B, Q-43 = B, Q-44 = A и подтвердил все четыре отклонения от черновика v1.1 §10. `MediaAsset` был последним типом M1 с неопределённым поведением.
**Связанные решения:** D-0049…D-0056 · **ADR:** ADR-0011

### Added
- `docs/adr/ADR-0011-media-asset.md` — медиаобёртки: связь через свойства объекта, множественные роли, метод создания как фасет, галереи, источники изображения, именование бинарных файлов, `MediaResolver`, граница применения, 13 подразделов решений.
- **`roles`** вместо `role`, кардинальность `0..n` (T10): одна обёртка может выполнять несколько ролей без реификации пары.
- **`MediaAsset.galleries`** (`0..n`) — привязка к галереям на стороне обёртки; **порядок не хранится**.
- **`Property.expected_media_roles`** — фильтр кандидатов для свойств, ссылающихся на `MediaAsset`.
- Фасет **`creation_method`** (`key: creation_method`) с категориями «Фото», «Коллаж», «Рисунок», «Генерация ИИ»; назначение в `cat_creation_method`.
- Аспект **`ai_generated_media`** активирует `prompt`, `negative_prompt`, `model`, `seed`, `sampler`, `steps`, `source_image` — **второе применение механизма `Aspect`** после профессии.
- Поля `MediaAsset`: `source_url`, `author`, `license`, `description`.
- Тип **`Gallery`** включён в ядро MVP: 9-й конкретный тип, первый в ветке `Collection`; префикс `GALLERY` перенесён из резерва в активные (итог **21 префикс**).
- Правила `media.r1…r9` и `naming.r11`. Каталог: **104 → 114 правил** (83 error, 27 warn, 4 info), пересчитано программно.
- Модуль `MediaResolver` как единая точка разрешения обёртка ↔ файл (§3.10).
- Конвенция именования ADR-0002 распространена на бинарные файлы: `{title} ({MEDIA}-{id}).{ext}`.

### Changed
- **BREAKING** `MediaAsset.role` → `roles` с изменением кардинальности `0..1` → `0..n`.
- `docs/metamodel/04_media_asset_scenario.md` → `actual` v0.3.0: Q-41…Q-44 закрыты со ссылками на ADR-0011; зафиксировано отклонение от рекомендации ассистента по Q-42 с обоснованием пользователя.
- `docs/metamodel/00_overview.md` → 0.10.0: добавлен §7.5 (медиаобёртки); конкретных типов 8 → 9; `blocked_by: null`, ядро объявлено полным.
- `docs/metamodel/TYPE_PREFIX_REGISTRY.md` → 0.10.0: `GALLERY` активен, зарезервировано 25, итог 21 префикс MVP.
- `docs/metamodel/NAME_MAPPING.md` → 0.10.0: `roles`, `galleries`, `cat_creation_method`, `expected_media_roles`; зафиксировано, что `width`/`height`/`aspect_ratio`/`file_size` не хранятся.
- `docs/validation/RULES.md` → 0.10.0: группа `media.*`, `naming.r11`, сводка пересчитана.
- ADR-0005 §3.3 изменён: `Gallery` перенесён из отложенных в конкретные типы MVP.
- ADR-0002 расширен: конвенция именования покрывает бинарные файлы.

### Rejected
- **`MediaAsset.targets`** — связь хранится в свойствах объектов (Q-37 = C, подтверждено T8).
- **`MediaAsset.is_primary`** — порядок списка значим (Q-40 = B).
- **`Relation` поверх обёртки** — двойная реификация; паттерн N1 из Exocortex, отклонённый D-0016.
- **`Gallery.items`** (рекомендация ассистента A по Q-42) — отклонено пользователем: порядок является свойством представления, а не хранения.
- **Хранение технических метаданных** (`width`, `height`, `aspect_ratio`, `file_size`) — читаются по требованию и кэшируются в `.sb/cache/` (принцип X-01).
- **Источник URL** — конфликт с рамкой «локально и офлайн».
- **Автозаполнение метаданных** (v1.1 §10.4 сценарий 2) — единственный сценарий, пишущий данные в объект на основании другого объекта.
- **Кнопка в Live Preview в MVP** — CM6-виджеты; перенесено на этап 2 фазы 5.

### Fixed
- Закрыты пробелы **G-5, G-7, G-9, G-10, G-11, G-12, G-13, G-14, G-15** и требования **T6…T14**.
- G-15 (порядок в галерее при нескольких галереях) **растворился** решением Q-42 = B: порядка, который нужно выразить, больше нет.
- **Ядро M1 объявлено полным** (D-0056): все 12 типов определены, расширение заморожено по умолчанию.

### Migrations
- Требуется: да, отложена. Добавлена **пятая** миграция: `role` → `roles` (скаляр → список).
- Накоплено: (1) ключи RU→EN; (2) имена файлов и ссылки; (3) дубли `title` в `aliases`; (4) `categories` → `cat_<key>`; (5) `role` → `roles`.

### Артефакты выпуска
- `docs/adr/ADR-0011-media-asset.md` (new)
- `docs/metamodel/04_media_asset_scenario.md` (→ actual v0.3.0)
- `docs/validation/RULES.md`, `docs/metamodel/00_overview.md`, `NAME_MAPPING.md`, `TYPE_PREFIX_REGISTRY.md` (→ 0.10.0)
- `docs/PROJECT_MAP.md`, `docs/decisions/DECISION_LOG.md`, `docs/README.md` (→ 0.10.0)
- `docs/context/CONTEXT_SNAPSHOT.md` (→ CS-0009)

### Сообщение коммита
```
docs(metamodel)!: v0.10.0 — MediaAsset, galleries, M1 core complete (ADR-0011)

BREAKING CHANGE: MediaAsset.role becomes roles with cardinality 0..n.

- link wrappers to objects via object properties (Book.cover), reverse list
  computed from MetadataCache; MediaResolver is the single resolution point
- roles is multi-valued (T10); add Property.expected_media_roles as a filter
- creation method is a facet (creation_method) with ai_generated_media aspect
  activating prompt/model/seed/source_image — second real use of Aspect
- galleries stored on the wrapper, order NOT stored: sorting belongs to the
  view (user decision over assistant recommendation, aligns with ADR-0005/0009)
- Gallery promoted into the MVP core: 9th concrete type, 21 prefixes total
- extend ADR-0002 file naming to binaries: {title} ({MEDIA}-{id}).{ext}
- sources: vault images, clipboard (prototype), disk (desktop-only); URL deferred
- four deviations from draft v1.1 section 10 confirmed by the user
- RULES.md: media.r1..r9, naming.r11; catalog 104 -> 114 (recomputed by script)
- closes G-5, G-7..G-15 and T6..T14; M1 core declared complete (D-0056)
```

---

## [0.9.0] - 2026-10-21

**Версия метамодели:** 0.9.0 · **Стадия:** draft (ядро: 12 типов, 104 правила; сценарий «Глава» закрыт)
**Причина выпуска:** пользователь принял Q-33 = B, Q-34 = C, Q-35 = A + C, Q-36 = A. Предложение по сценарию «Глава» стало нормативным.
**Связанные решения:** D-0042…D-0046 · **ADR:** ADR-0010

### Added
- `docs/adr/ADR-0010-sequences-and-creation-form.md` — упорядоченные последовательности, scoped uniqueness, шаблон заголовка, вывод формы создания. (D-0042)
- Поля `ObjectType`: `sequential_parent`, `sequence_key`, `sequence_step` (по умолчанию 10), `sequence_direction` (`ascending` | `descending`), `title_template`. Все необязательные.
- Поле `Property.unique_within` — **первое межобъектное ограничение** модели: пара (значение области, значение свойства) уникальна в хранилище.
- Поля `Automation`: `form_fields` (сужение и порядок полей формы), `defaults` (плейсхолдеры `{next_sequence}`, `{parent}`, `{today}`), `require_confirmation` (задел).
- Адресация `sys:` для полей системного контракта в `Automation.form_fields`; префикс зарезервирован.
- Правила `sequence.r1…r6`, `unique.r1…r2`, `meta.r14…r15` переведены из ожидающих в нормативные. Каталог: **94 → 104 правила** (79 error, 22 warn, 3 info).
- Правило вычисления `title` при создании: `chapter_label` → `title_template` → `error` (`contract.r6`).
- Правила нумерации: следующая = `max + step`, предыдущая = `min − step`, между = среднее с `warn` при совпадении.
- `docs/metamodel/03_chapter_scenario.md` → статус `actual`, вопросы Q-33…Q-36 закрыты со ссылками на ADR-0010.

### Changed
- `docs/metamodel/00_overview.md` → 0.9.0: дополнены строки `ObjectType`, `Property`, `Automation` в таблице ядра; незакрытым объявлен `MediaAsset`.
- `docs/metamodel/NAME_MAPPING.md` → 0.9.0: 9 новых полей, enum `sequence_direction`, адресация `sys:`.
- Разделы `RULES.md` перенумерованы; группа `sequence.*`/`unique.*` стала нормативной (§13).

### Rejected
- **Тип M1 `Sequence`** — последовательность полностью определяется парой полей на `ObjectType`; отдельный объект дублировал бы данные. Шаг и направление стали атрибутами типа.
- **Тип M1 `Form`** — форма создания **выводится** из эффективного набора свойств (алгоритм ADR-0008 §3.3), порядка в `ObjectType.properties`, `required`, `value_type`, `target_types`/`target_facet`.
- **Плотная нумерация 1, 2, 3** — потребовала бы перенумерации всех следующих глав при вставке.
- **Автосоздание соседа без подтверждения** — противоречит принципу S6.
- **Live Preview (CM6) и блок ```` ```sb-nav ```` в MVP** — перенесены на этап 2 фазы 5 как самые хрупкие точки интеграции.

### Fixed
- **Исправлена арифметическая ошибка ассистента в записи v0.8.0:** каталог после ADR-0009 содержит **94** правила, а не 95 (группа `lifecycle.*` — 5 правил, а не 6). Числа пересчитаны программно по всему репозиторию; исправлены `RULES.md`, `CHANGELOG.md`, `METAMODEL_VERSIONS.md`, `PROJECT_MAP.md`, `README.md`, `CONTEXT_SNAPSHOT.md`, `ADR-0010`.
- G-1, G-2, G-3, G-4 (пробелы, выявленные сценарием «Глава») — закрыты.

### Migrations
- Требуется: нет. Все новые поля необязательны, существующие определения останутся валидными.

### Артефакты выпуска
- `docs/adr/ADR-0010-sequences-and-creation-form.md` (new)
- `docs/validation/RULES.md`, `docs/metamodel/00_overview.md`, `NAME_MAPPING.md`, `03_chapter_scenario.md` (updated → 0.9.0)
- `docs/PROJECT_MAP.md`, `docs/decisions/DECISION_LOG.md`, `docs/README.md` (updated → 0.9.0)
- `docs/context/CONTEXT_SNAPSHOT.md` (updated → CS-0008)

### Сообщение коммита
```
docs(metamodel): v0.9.0 — ordered sequences and derived creation forms (ADR-0010)

- ObjectType: sequential_parent, sequence_key, sequence_step (default 10),
  sequence_direction, title_template — sequences are declared, not hardcoded,
  so the same mechanism covers Episode/Track/Task
- Property.unique_within: first cross-object constraint (scoped uniqueness),
  e.g. (part_of, order) unique per book
- Automation: form_fields, defaults, require_confirmation; creation form is
  DERIVED from the effective property set — no Form type
- title fallback: chapter_label -> title_template -> error (covers "Глава N")
- nav rendering in MVP: reading view + plugin pane; CM6 Live Preview deferred
- RULES.md: sequence.r1..r6, unique.r1..r2, meta.r14..r15 now normative;
  catalog 94 -> 104 rules
- fix assistant arithmetic error in v0.8.0 entry (95 -> 94 rules);
  counts recomputed programmatically across the repo
- closes G-1..G-4; decisions D-0042..D-0046
```

---

## [0.8.0] - 2026-10-21

**Версия метамодели:** 0.8.0 · **Стадия:** draft (шаги 1–6 фазы 2 закрыты; ядро 12 типов, 94 правила)
**Причина выпуска:** пользователь выбрал Q-30 = A и Q-31 = B; C-32 закрыт. На Q-32 получен первый живой сценарий («Глава»), разобранный как предложение.
**Связанные решения:** D-0039, D-0040, D-0041 · **ADR:** ADR-0009

### Added
- `docs/adr/ADR-0009-lifecycle-archive-merge.md` — архивирование только полем `status`; два типа отношений `supersedes` (1:1) и `merged_into` (N:1); запрет цепочек; нормативная процедура слияния из 7 шагов с предпросмотром, резервной копией и откатом. (D-0039, D-0040)
- `RelationType` `supersedes` и `merged_into`, оба `unique_subject`, `cardinality: 0..1`, с атрибутами `description`, `valid_from`, `source_ref`.
- Группа правил `lifecycle.r1…r5` (3 error, 2 warn, 1 info) и §12.1 `RULES.md` — процедура слияния.
- `docs/metamodel/03_chapter_scenario.md` — **предложение** (не утверждено): разбор сценария «Глава» на 5 требований, 4 пробела метамодели (G-1…G-4), 5 новых необязательных полей, 9 новых правил, рабочий пример книги с главами, проверка публичного API для навигационных кнопок. (D-0041)
- Правила `sequence.r1…r5`, `unique.r1…r2`, `meta.r14…r15` — внесены в `RULES.md` §13 как **ожидающие** ADR-0010.
- Проверка API для навигации: `registerMarkdownPostProcessor` (`@since 0.9.7`), `registerMarkdownCodeBlockProcessor` (0.9.7), `registerEditorExtension` (0.12.8), `registerView` — все публичны, правило P-API-1 соблюдается.

### Changed
- `docs/validation/RULES.md` → 0.8.0: нормативных правил **89 → 94**; добавлены разделы 12 (жизненный цикл) и 13 (ожидающие утверждения); нумерация разделов сдвинута.
- `docs/metamodel/00_overview.md` → 0.8.0: §7.4 дополнен двумя типами отношений; §8.1 дополнен правилами архивирования и запретом цепочек; `blocked_by` изменён на сценарий «Глава».
- `docs/metamodel/NAME_MAPPING.md` → 0.8.0: добавлены `supersedes`, `merged_into`.
- Спецификация §17 в части «новый объект получает новый ID» **отменена** для смены типа (следствие ADR-0002); связь замены применяется, когда объект действительно заменяется другим объектом.

### Rejected
- **13-й тип M1 `Sequence`** — последовательность полностью определяется парой полей `sequential_parent` + `sequence_key` на `ObjectType`; отдельный объект дублировал бы эти данные (нарушение принципа «один факт — одно место»). Шаг и направление сортировки, если понадобятся, — атрибуты `ObjectType`, аддитивно.
- **Отдельный тип `Form`** для формы создания — форма **выводится** из эффективного набора свойств, порядка в `ObjectType.properties`, `required`, `value_type` и `target_types`; `Automation` получает лишь необязательные `form_fields` и `defaults`.
- **Папка `Archive/`** как физическое выражение архивирования — создала бы второй источник состояния.

### Fixed
- C-32 (связи для миграции и слияния не определены, семантика архивирования отсутствует).
- **Итого закрыто 35 из 41.** Открыты 6: C-04, C-05 (некорректные ID в примерах черновиков — закроются при наполнении M1), C-36, C-37, C-38, C-41 (расслоение документов и статусы — шаг 7).

### Migrations
- Требуется: нет.
- Зафиксировано: введение папки `Archive/` в будущем рассматривается как представление, а не изменение хранения; автоматическое перемещение файлов не планируется.

### Артефакты выпуска
- `docs/adr/ADR-0009-lifecycle-archive-merge.md` (new)
- `docs/metamodel/03_chapter_scenario.md` (new, draft)
- `docs/validation/RULES.md`, `docs/metamodel/00_overview.md`, `NAME_MAPPING.md` (updated → 0.8.0)
- `docs/PROJECT_MAP.md`, `docs/decisions/DECISION_LOG.md`, `docs/README.md` (updated → 0.8.0)
- `docs/context/CONTEXT_SNAPSHOT.md` (updated → CS-0007)

### Сообщение коммита
```
docs(metamodel): v0.8.0 — lifecycle ADR-0009, chapter scenario proposal

- ADR-0009: archiving is status-only (no Archive/ folder, links stay valid);
  add supersedes (1:1) and merged_into (N:1) relation types, chains forbidden;
  normative 7-step merge procedure with preview, backup and rollback
- RULES.md: add lifecycle.r1..r5, normative rules 89 -> 94
- add 03_chapter_scenario.md (draft proposal): Chapter/Book sequence
  * 5 user requirements split into metamodel vs plugin layers
  * 4 model gaps: sequence declaration, scoped uniqueness, title template,
    creation form
  * 5 optional fields, no 13th M1 type; 9 pending rules
  * verified nav buttons against public API (postProcessor, editorExtension)
- closes C-32; 35 of 41 issues closed; decisions D-0039..D-0041
```

---

## [0.7.0] - 2026-10-21

**Версия метамодели:** 0.7.0 · **Стадия:** draft (ядро: 6 шагов из 7; 12 типов M1; 89 правил валидации)
**Причина выпуска:** пользователь выбрал Q-27 = B (тип `Aspect`), Q-28 = A (фасет `Organization type`), Q-29 = отложить. Требование R-TRIGGER реализовано; формализован контроль целостности из Спецификации §19.
**Связанные решения:** D-0035…D-0038 · **ADR:** ADR-0008

### Added
- `docs/adr/ADR-0008-aspect-activated-properties.md` — тип `Aspect` как механизм R-TRIGGER: `trigger_categories`, `properties`, `property_overrides`, `is_active`; активация включает потомков категории; алгоритм разрешения свойств редакция 2; правило конфликта; задел на расширение триггера. (D-0035)
- **Тип M1 `Aspect`** (`type: aspect`, `type_prefix: ASPECT`) — ядро выросло с 11 до 12 типов. Префикс перенесён из резерва в активный реестр; итог 20 префиксов MVP.
- `docs/validation/RULES.md` — каталог из **89 правил в 9 группах** (68 `error`, 19 `warn`, 2 `info`): `contract.*` (12), `naming.*`/`format.*` (13), `property.*` (7), `link.*`/`relation.*` (14), `classif.*` (12), `inherit.*` (7), `aspect.*` (6), `meta.*` (13), `view.*`/`alias.*` (5). Плюс уровни, шесть видов проверок из spec §19, триггеры проверки, запрет молчаливой перезаписи, контракт `Diagnostic` для `SchemaEngine`. (D-0036, закрывает C-33)
- Фасет `Organization type` (`key: org_type`, `applicable_types: [Organization]`, `strict`, `0..n`) — закрывает R-ORGTYPE без нового механизма. (D-0037)
- Правила `aspect.r1…r6`, включая `aspect.r1` (значение без активировавшего аспекта — `warn`, не удаление).
- Детерминированный порядок разрешения переопределений аспектов — по возрастанию `id` (ULID).

### Changed
- **BREAKING для реализации** Алгоритм разрешения свойств (ADR-0003 §3.4): 6 шагов и 3 источника → 7 шагов и 4 источника (`inherited`, `own`, `universal`, `triggered`).
- `docs/metamodel/00_overview.md` → 0.7.0: §3 (12 типов, `Aspect` на диаграмме), §7.3 закрыт и переписан, фасет `org_type` утверждён, `blocked_by: null`.
- `docs/metamodel/NAME_MAPPING.md` → 0.7.0: добавлен §6.1 с полями `Aspect`.
- `docs/metamodel/TYPE_PREFIX_REGISTRY.md` → 0.7.0: `ASPECT` в §2, §5.1 изменён на «снято с резерва».
- Требования R-TRIGGER (D-0032) и R-ORGTYPE (D-0034) переведены из `proposed` в `accepted` как реализованные.
- `Property.target_categories` отложено в фазу 4 (D-0038).

### Fixed
- C-33 (контроль целостности не формализован): шесть видов проверок из Спецификации §19 получили 89 конкретных правил с ID, уровнями и текстами сообщений.
- **Итого закрыто 34 из 41.** Открыты 7: C-04, C-05 (битые ID в примерах черновиков — закроются при наполнении M1), C-32 (архивирование и слияние — Q-30/Q-31), C-36, C-37, C-38, C-41 (расслоение документов и статусы — шаг 7).

### Migrations
- Требуется: нет (определений M1 в хранилище нет).
- Зафиксировано: добавление флага «только точное совпадение категории» в `Aspect` позже будет аддитивным, значение по умолчанию сохранит текущее поведение — миграция не потребуется.

### Артефакты выпуска
- `docs/adr/ADR-0008-aspect-activated-properties.md` (new)
- `docs/validation/RULES.md` (new)
- `docs/metamodel/00_overview.md`, `NAME_MAPPING.md`, `TYPE_PREFIX_REGISTRY.md` (updated → 0.7.0)
- `docs/PROJECT_MAP.md`, `docs/decisions/DECISION_LOG.md`, `docs/README.md` (updated → 0.7.0)
- `docs/context/CONTEXT_SNAPSHOT.md` (updated → CS-0006)

### Сообщение коммита
```
docs(metamodel): v0.7.0 — Aspect type for activated properties, validation catalog

- ADR-0008: Aspect becomes the 12th M1 type; implements R-TRIGGER
  (profession activates extra properties on the object itself)
  * activation includes category descendants
  * property resolution rev.2: 4 sources, deterministic aspect order by id
  * incompatible aspect conflict is a load-time error, values never auto-removed
- add docs/validation/RULES.md: 89 rules in 9 groups (68 error / 19 warn / 2 info),
  levels, six check kinds from spec section 19, Diagnostic contract for SchemaEngine
  (closes C-33)
- add facet `Organization type` (key: org_type); closes R-ORGTYPE with data only
- promote ASPECT prefix from reserved to active (20 MVP prefixes total)
- defer Property.target_categories to phase 4
- 34 of 41 diagnosed issues closed; decisions D-0035..D-0038
```

---

## [0.6.0] - 2026-10-21

**Версия метамодели:** 0.6.0 · **Стадия:** draft (ядро: имена, идентичность, классификация, свойства, отношения — согласованы)
**Причина выпуска:** пользователь ответил на Q-21…Q-26 и зарегистрировал два новых требования: R-TRIGGER (профессия активирует дополнительные свойства) и R-ORGTYPE (тип/роль организации).
**Связанные решения:** D-0026…D-0034 · **ADR:** ADR-0006, ADR-0007

### Added
- `docs/adr/ADR-0006-roles-and-professions.md` — правило роли: устойчивый факт об объекте → категория фасета; факт, связывающий два объекта или несущий атрибуты → `Relation`. Четыре случая разведены по механизмам. (D-0026…D-0028)
- `docs/adr/ADR-0007-category-assignment-storage.md` — назначения категорий ключами по фасетам `cat_<facet_key>`; новое обязательное поле `Facet.key`; зарезервирован префикс `cat_`; проверки `classif.r10`, `r11`, `r12`; упрощена `classif.r3`; описана интеграция с Bases через `displayName`. (D-0029)
- `Property.target_facet` — необязательное поле: при `value_type: reference` и `target_types: [category]` ограничивает значения одним фасетом. (D-0031)
- `Relation.role` (ссылка на `Category` фасета `Character roles`) и `Relation.position` (должность в контексте организации).
- Фасеты: `Profession` (`key: profession`, `applicable_types: [Person]`, `0..n`, иерархический), `Character roles` (`key: char_role`, словарь значений).
- Типы отношений: `author` (`Work` → `Person`), `portrays` (`Character` → `Work`), `member_of` (`Person` → `Organization`), `appears_in`, `derived_from`.
- Локальные свойства `Relation` специфицированы как `Property` с типами и кардинальностью: `order`, `is_primary`, `valid_from`, `valid_to`, `source_ref`, `context`, `description`. (C-30)
- Зарезервированы пространства имён: `cat_` (ADR-0007), `label_` (ADR-0001), `sb_` (задел). Префикс `ASPECT` зарезервирован под R-TRIGGER.
- Требования **R-TRIGGER** (D-0032) и **R-ORGTYPE** (D-0034) зарегистрированы со статусом `proposed`, механизмы не выбраны.
- Вопросы Q-27, Q-28, Q-29.

### Changed
- **BREAKING** Системный контракт: 9 полей → 8. Поле `categories` удалено, назначения хранятся в `cat_<facet_key>`. (ADR-0007)
- **BREAKING** `Facet.key` стало обязательным: `^[a-z][a-z0-9_]{1,30}$`, глобально уникальное, неизменяемое после первого использования.
- **BREAKING** для ADR-0005 §3.1 п.7: правило «объект хранит плоский список `categories`» заменено хранением по полям на ось.
- `docs/metamodel/00_overview.md` → 0.6.0: раздел 7 переписан (гибридная модель связей, правило роли, сводная таблица механизмов, 5 типов отношений); раздел 7.3 оставлен незакрытым до ADR-0008.
- `docs/metamodel/NAME_MAPPING.md` → 0.6.0: добавлены §7.1 (фасеты) и §7.2 (зарезервированные префиксы), новые поля.
- `docs/metamodel/02_concept_alignment.md` → 0.2.0: S-7 принято (ADR-0007), S-6 отложено (D-0030), вывод обновлён.

### Fixed
- C-27 (гибридная модель связей получила нормативное «правило повышения» и запрет двух форм одной связи).
- C-30 (локальные свойства `Relation` специфицированы).
- Устранена дыра целостности: без `target_facet` значением `Relation.role` могла стать любая категория.
- **Итого закрыто 33 из 41.** Открыты 8: C-04, C-05 (ID в примерах черновиков), C-32, C-33 (миграция, слияние, правила валидации), C-36, C-37, C-38, C-41 (расслоение документов и статусы).

### Migrations
- Требуется: да, отложена.
- Накоплено четыре миграции: (1) переименование ключей RU→EN; (2) переименование файлов и нормализация ссылок; (3) удаление дублей `title` из `aliases`; (4) **новая** — распределение `categories` по полям `cat_<facet_key>` с разрешением фасета каждой категории.
- Правило безопасности: категория с неразрешимым фасетом не мигрирует, попадает в отчёт, объект не перезаписывается (принцип S6).

### Артефакты выпуска
- `docs/adr/ADR-0006-roles-and-professions.md` (new)
- `docs/adr/ADR-0007-category-assignment-storage.md` (new)
- `docs/metamodel/00_overview.md` (updated → 0.6.0)
- `docs/metamodel/NAME_MAPPING.md` (updated → 0.6.0)
- `docs/metamodel/02_concept_alignment.md` (updated → 0.2.0)
- `docs/metamodel/TYPE_PREFIX_REGISTRY.md` (updated → 0.6.0)
- `docs/PROJECT_MAP.md`, `docs/decisions/DECISION_LOG.md` (updated → 0.6.0)
- `docs/context/CONTEXT_SNAPSHOT.md` (updated → CS-0005)

### Сообщение коммита
```
docs(metamodel)!: v0.6.0 — roles, professions and per-facet category storage

BREAKING CHANGE: system contract field `categories` is replaced by per-facet
cat_<facet_key> lists; Facet gains a mandatory globally-unique `key`.

- ADR-0006 role rule: stable fact about an object -> facet category;
  fact linking two objects or carrying attributes -> Relation
- profession becomes facet `Profession`; character role becomes `portrays`
  Relation with `role` attribute; affiliation becomes `member_of` with
  `position`, `valid_from`, `valid_to`
- add Property.target_facet to constrain category-valued references
- ADR-0007 per-facet storage enables one Bases column per axis and O(1)
  cardinality checks; add classif.r10..r12
- register R-TRIGGER (profession activates extra properties) and R-ORGTYPE
  as pending requirements; reserve ASPECT prefix
- closes C-27, C-30; 33 of 41 issues closed; decisions D-0026..D-0034
```

---

## [0.5.0] - 2026-10-21

**Версия метамодели:** 0.5.0 · **Стадия:** draft (ядро согласовано, классификация проверена на внешнюю совместимость)
**Причина выпуска:** пользователь предложил каноническую модель классификации «Домен → Таксономия → Категория + Фасет» и попросил проверить совместимость с нашей моделью. Проведено сопоставление, найдено три расхождения, два закрыты решениями, два вынесены на обсуждение.
**Связанные решения:** D-0023, D-0024, D-0025 · **ADR:** нет (изменения аддитивные, ADR не требуют)

### Added
- `docs/metamodel/02_concept_alignment.md` — сопоставление канонической модели классификации с моделью Second Brain: таблица соответствия понятий, проверка шести правил сочетания, три расхождения с решениями, семь предложений S-1…S-7 со статусами.
- Правило валидации `classif.r8` (error): названия категорий уникальны в пределах одного фасета. (D-0024, предложение S-1)
- Правило валидации `classif.r9` (warn): одинаковое название категории в разных фасетах одной таксономии — эвристика нарушения ортогональности осей. (D-0024, предложение S-2)
- Терминологическое предупреждение в `00_overview.md` §4.2: наша `Taxonomy` — контейнер осей, иерархией является `Facet` с `hierarchy_mode: strict`.
- Вопросы Q-25 (способ хранения назначений категорий) и Q-26 (основной фасет для навигации).

### Changed
- `docs/metamodel/00_overview.md` → 0.5.0: добавлены две проверки целостности классификации и терминологическое предупреждение.

### Rejected
- **S-4** Переименование `Taxonomy` → `Domain` и `Facet` → `Taxonomy` для совпадения с каноном. Причина: выигрыш только терминологический, механика не меняется; стоимость — переработка ADR-0005 и всей терминологии черновиков. Расхождение задокументировано в `02_concept_alignment.md` §2.1 и в глоссарии. (D-0025)
- **S-5** Введение типа `Domain` над `Taxonomy` в MVP. Причина: четвёртый уровень группировки не окупается для личной базы; `Taxonomy.applicable_types` уже задаёт границу; уровень понадобится только для пакетной поставки метамодели (Q-19, отложено). Задел — необязательное поле `Taxonomy.domain`, аддитивное изменение `MINOR`. (D-0023)

### Fixed
- Устранён непроверенный пробел: требование ортогональности фасетов присутствовало в канонической модели, но не проверялось в нашей. Закрыто правилами `classif.r8`, `classif.r9`.

### Migrations
- Требуется: нет. Изменения аддитивные; данных в хранилище нет.

### Артефакты выпуска
- `docs/metamodel/02_concept_alignment.md` (new)
- `docs/metamodel/00_overview.md` (updated → 0.5.0)
- `docs/PROJECT_MAP.md`, `docs/decisions/DECISION_LOG.md`, `docs/README.md` (updated → 0.5.0)

### Сообщение коммита
```
docs(metamodel): v0.5.0 — align classification with canonical domain/taxonomy/facet model

- add 02_concept_alignment.md: mapping table, check of 6 canonical rules,
  3 divergences, proposals S-1..S-7 with statuses
- add validation rules classif.r8 (unique category titles per facet)
  and classif.r9 (warn on duplicate titles across facets)
- reject S-4 (renaming Taxonomy/Facet) and S-5 (Domain level in MVP);
  document the terminology offset instead
- raise Q-25 (category assignment storage) and Q-26 (navigational facet)
- decisions D-0023..D-0025
```

---

## [0.4.0] - 2026-10-21

**Версия метамодели:** 0.4.0 · **Стадия:** draft (ядро: уровни, контракт, классификация — согласованы)
**Причина выпуска:** пользователь подтвердил Q-14 = B, Q-15 = A, Q-16 = B, Q-17 = A. Классификация зафиксирована, реестр префиксов создан.
**Связанные решения:** D-0017…D-0022 · **ADR:** ADR-0005

### Added
- `docs/adr/ADR-0005-classification.md` — четыре уровня классификации, абстрактные и конкретные типы, критерий `Source`/`Work`, строковое поле `type`, правила реестра префиксов. (D-0017…D-0020)
- `docs/metamodel/TYPE_PREFIX_REGISTRY.md` — 9 правил (включая запрет дефисов R4 и омоглифов R9), 19 префиксов MVP, 27 зарезервированных, 8 запрещённых значений, алгоритм проверки уникальности. (D-0018)
- `docs/metamodel/00_overview.md` — общее описание: уровни M0/M1/M2, источник истины и производные слои, системный контракт (9 полей), ядро из 11 типов с Mermaid, классификация из 4 уровней с 7 проверками целостности, иерархия типов, три слоя имени, перечисления, даты, идентичность. Раздел 7 (роли) оставлен незакрытым.
- `ObjectType.is_abstract` — обязательное boolean; у абстрактных типов `type_prefix: null`. (C-17)
- `ObjectType.layer` — обязательный enum `system` | `domain`. (C-19)
- Граница `tags` / `categories`: свободные метки без валидации против классификации с проверками. (D-0022)
- Ядро предметных типов MVP: `Person`, `Character`, `Organization`, `Project`, `Task`, `Book`, `Chapter`, `Article`. (D-0021)
- Связь `appears_in` (`Character` → `Work`, `0..n`) и `derived_from` (`Work` → `Source`).
- Риски: необходимость создавать Taxonomy + Facet + Category тремя объектами для одной классификации (митигция — одна команда плагина).

### Changed
- **BREAKING** для spec §7–8 и v1.0 §6–7: уровни классификации 3 → 4. Введён обязательный уровень `Facet`.
- `Taxonomy.hierarchy_mode`, `assignment_cardinality`, `root_requirement` — из основных полей становятся значениями по умолчанию, наследуемыми фасетом при пустом собственном поле. (C-14)
- `Character` введён в иерархию как наследник `Context`; префикс исправлен с `CHARACTЕR` (кириллическая U+0415) на `CHAR`. (C-06, C-16)
- Группы из spec §5 («Знание», «Произведение», «Коллекция», «Источник», «Контекст», «Деятельность») получили статус абстрактных типов M1 с `is_abstract: true`. (C-19)
- `docs/metamodel/01_diagnosis.md` → 0.2.1: добавлен блок статуса позиций, текст диагноза сохранён без изменений как исторический снимок.

### Removed
- `Taxonomy.facets` как хранимое поле — состав фасетов вычисляется из `Facet.taxonomy`. (C-15)

### Fixed
- Закрыто **10 позиций** реестра диагностики: C-07 (реестр префиксов), C-09 (`type` строкой), C-13 (уровни), C-14 (настройки иерархии), C-15 (взаимные ссылки), C-16 (`Character`), C-17 (абстрактные типы), C-18 (`Source`/`Work`), C-19 (статус групп).
- **Итого закрыто 31 из 41.** Открыты 10: C-04, C-05, C-27, C-30, C-32, C-33, C-36, C-37, C-38, C-41.

### Migrations
- Требуется: да, отложена. Категории, созданные по модели v1.0 со ссылкой `таксономия`, получают ссылку `facet`; для каждой таксономии v1.0 создаётся один фасет-наследник.
- Когда: фаза 3–4, при наполнении M1.

### Артефакты выпуска
- `docs/adr/ADR-0005-classification.md` (new)
- `docs/metamodel/TYPE_PREFIX_REGISTRY.md` (new)
- `docs/metamodel/00_overview.md` (new)
- `docs/metamodel/01_diagnosis.md` (updated → 0.2.1, статус позиций)
- `docs/PROJECT_MAP.md`, `docs/decisions/DECISION_LOG.md`, `docs/README.md` (updated → 0.4.0)
- `docs/context/CONTEXT_SNAPSHOT.md` (updated → CS-0004)

### Сообщение коммита
```
docs(metamodel): v0.4.0 — classification, abstract types, type prefix registry (ADR-0005)

- ADR-0005: 4-level classification (Taxonomy > Facet > Category > Object),
  links point upward only, hierarchy settings live on Facet
- add is_abstract and layer to ObjectType; spec section 5 groups become abstract types
- define Source vs Work criterion; Character becomes a Context subtype (prefix CHAR)
- store instance `type` as snake_case string, validated against the type index
- add TYPE_PREFIX_REGISTRY: 9 rules, 19 MVP prefixes, 27 reserved, 8 forbidden
- add 00_overview: M0/M1/M2 layers, system contract, 11 core types, enums, dates
- mark diagnosis status: 31 of 41 issues closed
- decisions D-0017..D-0022
```

---

## [0.3.0] - 2026-10-21

**Версия метамодели:** 0.3.0 · **Стадия:** draft (ядро формируется; закрыт уровень «идентичность + имена + привязка свойств»)
**Причина выпуска:** пользователь подтвердил Q1=C, Q2=C, Q3=A, Q4 (порядок работ) и решения по умолчанию X-01…X-05. Дополнительно принято во внимание замечание о разделении «ключ / отображаемое имя» (референс — плагин Exocortex).
**Связанные решения:** D-0009…D-0016 · **ADR:** ADR-0001, ADR-0002, ADR-0003, ADR-0004

### Added
- `docs/adr/ADR-0001-english-keys-russian-labels.md` — три слоя имени: `key` (EN, канон) / `label` (RU, обязателен для определений M1) / `label_*` (локализации, задел). Переходный слой RU-алиасов с `warn`-диагностикой и правилом приоритета при конфликте. (D-0009)
- `docs/adr/ADR-0002-identity-ulid-and-filename.md` — `id` = ULID; имя файла `{title} ({type_prefix}-{id}).md`; `title` в имени ≤ 60 символов; каноническая ссылка через `generateMarkdownLink()`; разрешение по стабильной подстроке `(PREFIX-ULID)`; правила для `type_prefix` и смены типа объекта. (D-0010)
- `docs/adr/ADR-0003-property-attachment.md` — привязка свойств: плоский упорядоченный `ObjectType.properties` + значения по умолчанию в `Property` + вложенный `property_overrides` для ужесточений; алгоритм разрешения ограничений из 6 шагов; правила наследования из spec §14 без изменений. (D-0011)
- `docs/adr/ADR-0004-aliases-only-real-aliases.md` — отмена правила `aliases[0] = название`. (D-0012)
- `docs/metamodel/NAME_MAPPING.md` — таблица маппинга RU → EN: ~90 переименований, 6 удалённых полей, 12 добавленных, 10 перечислений с единым форматом; правила именования; формат дат и интервалов; алгоритм использования таблицы плагином. (D-0008, D-0009)
- `docs/research/API_FEASIBILITY_NOTES.md` — проверка реализуемости по официальным типам `obsidian.d.ts` (306 430 Б): что есть в публичном API, чего нет; разбор Exocortex (берём E1–E4, не берём N1–N4); правило P-API-1; влияние на план. (D-0014, D-0015, D-0016)
- Системный контракт объекта дополнен полями `created_at`, `updated_at`, `status` (закрывает C-31).
- Введены перечисления: `value_type` (6 значений), `cardinality` (единый формат), `status`, `lifecycle`, `direction`, `uniqueness_rule`, `hierarchy_mode`, `root_requirement`, `scope`, `layer`, `mechanism`, `trigger`, `role`, `media_kind`.
- Риски R-09 (`minAppVersion` 1.10.0), R-10 (вечный слой RU-алиасов), R-11 (вложенный YAML не редактируется нативно).

### Changed
- **BREAKING** Все имена полей: кириллица → латиница snake_case (`название` → `title`, `тип_объекта` → `type`, `родительский_тип` → `parent_type`, `тип_значения` → `value_type`, `кардинальность` → `cardinality`, `обязательность` → `required` (enum → boolean), `определение` → `definition`, `прямое_название` → `forward_label`, `субъект` → `subject`, `допустимые_типы_объектов` → `applicable_types`, `режим_иерархии` → `hierarchy_mode`, `целевые_типы_объектов` → `target_types` и др.). Полный список — `NAME_MAPPING.md`. (ADR-0001)
- **BREAKING** Формат `id`: `КОДТИПА-000001` → ULID. (ADR-0002)
- **BREAKING** Имя файла: `Название — ID.md` и `{TYPE_PREFIX}-{ID}.md` → `{title} ({type_prefix}-{id}).md`. (ADR-0002)
- **BREAKING** Формат ссылки: два разных → `[[{title} ({prefix}-{id})|{title}]]`. (ADR-0002)
- **BREAKING** `PropertyType`: 8 значений → 6. Удалены `Список` и `Список ссылок`; множественность выражается через `cardinality`. (ADR-0003)
- **BREAKING** Формат `cardinality`: 4 разных способа → единый `0..1` / `1` / `0..n` / `1..n`. Булево `multiple` из JSON-примера v1.1 §15.3 упразднено. (ADR-0003)
- **BREAKING** `aliases`: правило `aliases[0] = название` отменено. (ADR-0004)
- `родительский_тип`: список → одиночная ссылка `0..1` (семантика «только непосредственный родитель» уже была заявлена в spec §1).
- `Обёртка изображения` → `MediaAsset` с полями `file`, `role`, `media_kind` (закрывает C-39, C-40).
- `Taxonomy.facets` удалено как хранимое поле — состав фасетов вычисляется из `Facet.taxonomy` (закрывает C-15).
- Риск R-07 **снят**: раздел 17 v1.1 выведен из MVP.
- Риск R-05 снижен до низкого: реализуемость подтверждена по публичному API.

### Deprecated
- Раздел 17 черновика v1.1 (отображаемые названия, `TitleResolver`, 13 адаптеров) — не входит в MVP. Причина: подмена имени файла недоступна через публичный API (D-0014), а потребность устранена ADR-0002.
- Поле `уровень` у `Property` — дубль `область_применения`; заменено единым `scope`.
- Тип `документация` (`Documentation`) — исключён из ядра (X-05).

### Removed
- Поле `Taxonomy.facets` как хранимое.
- Поле `Property.уровень`.
- Значения `PropertyType`: `Список`, `Список ссылок`.
- Правило синхронизации `aliases[0]` с `название`.

### Fixed
- C-01 (формат ID), C-02 (имя файла), C-03 (формат ссылки), C-06 (кириллическая «Е» в `CHARACTЕR`), C-08 (коллизия префиксов `PROPERTY`/`PROPERTY-TYPE`), C-10 и C-12 (смена типа объекта), C-11 (дубль в `aliases`), C-15 (взаимные ссылки Taxonomy↔Facet), C-20 (привязка свойств), C-21 (дубль `область_применения`/`уровень`), C-22 (списочные типы), C-23 (формат кардинальности), C-24 (допустимые значения), C-25 (двойное определение `название`), C-26 (язык имён), C-28 (`uniqueness_rule`), C-29 (`direction`), C-31 (поле жизненного цикла), C-34 (формат дат и интервалов), C-35 (два источника истины), C-39 (`file` у медиа).
- Исправлена опечатка черновика: «полиaрхическая» (латинская `a`) → `polyhierarchical`.

**Закрыто 21 позиция из 41.** Остались открытыми: C-04, C-05, C-07, C-09, C-13, C-14, C-16, C-17, C-18, C-19, C-27, C-30, C-32, C-33, C-36, C-37, C-38, C-40, C-41 — закрываются на шагах 3–7 фазы 2.

### Migrations
- Требуется: да, **все отложены до после-MVP** (данных в хранилище пока нет).
- Накоплено три миграции: (1) переименование ключей по `NAME_MAPPING.md`; (2) переименование файлов и нормализация ссылок по ADR-0002; (3) удаление из `aliases` элементов, равных `title`.
- До миграции работает переходный слой RU-алиасов (ADR-0001) с отключением настройкой `legacy_keys: false`.

### Артефакты выпуска
- `docs/adr/ADR-0001-english-keys-russian-labels.md` (new)
- `docs/adr/ADR-0002-identity-ulid-and-filename.md` (new)
- `docs/adr/ADR-0003-property-attachment.md` (new)
- `docs/adr/ADR-0004-aliases-only-real-aliases.md` (new)
- `docs/metamodel/NAME_MAPPING.md` (new)
- `docs/research/API_FEASIBILITY_NOTES.md` (new)
- `docs/PROJECT_MAP.md` (updated → 0.3.0)
- `docs/decisions/DECISION_LOG.md` (updated → 0.3.0)
- `docs/context/CONTEXT_SNAPSHOT.md` (updated → CS-0003)

### Сообщение коммита
```
docs(metamodel)!: v0.3.0 — identity, naming and property attachment (ADR-0001..0004)

BREAKING CHANGE: field keys switch to English snake_case; id format becomes ULID;
file name becomes "{title} ({PREFIX}-{id}).md"; PropertyType reduced 8 -> 6;
cardinality unified; aliases[0]=title rule dropped.

- ADR-0001 english keys + russian labels via mandatory `label` (rdfs:label analogue)
- ADR-0002 ULID identity decoupled from file name; link resolution by stable part
- ADR-0003 property attachment: flat list on ObjectType, defaults on Property,
  nested property_overrides for inheritance tightening
- ADR-0004 aliases hold real pseudonyms only
- add NAME_MAPPING.md (~90 renames, 10 enums, date/interval format)
- add research/API_FEASIBILITY_NOTES.md: verified against obsidian.d.ts;
  adopt E1-E4 from Exocortex, reject N1-N4; rule P-API-1 (public API only);
  minAppVersion 1.10.0; v1.1 section 17 dropped from MVP
- closes 21 of 41 diagnosed issues; decisions D-0009..D-0016
```

---

## [0.2.0] - 2026-10-21

**Версия метамодели:** 0.2.0 · **Стадия:** draft (диагноз выдан, ядро не согласовано)
**Причина выпуска:** получены черновики метамодели «Second Brain», проведён первичный анализ, сформулирована гипотеза целевого ядра.
**Связанные решения:** D-0006, D-0007, D-0008, X-01…X-05 · **ADR:** нет (будут в фазе 2)

### Added
- `inbox/` — три файла черновиков (109 КБ, 1845 строк) помещены в read-only: `01_Second_Brain_Architecture_Specification.md` (v1.0, «утверждён»), `02_Метамодель_v1.0.md` (v1.0, «утверждён»), `02_Метамодель_v1.1_черновик.md` (v1.1-draft). (D-0006)
- `docs/metamodel/01_diagnosis.md` — диагностика: инвентаризация файлов, 10 сильных решений черновиков (S1–S10), инвентарь сущностей и связей, реестр из 41 позиции (C-01…C-41: 22 противоречия, 7 дублей, 12 пробелов, 8 критичных), 5 главных проблем P-01…P-05 с порядком решения, гипотеза целевого ядра (3 уровня M0/M1/M2, 11 типов ядра M1, 6 абстрактных + 20 конкретных предметных типов, три незакрытых связки с вариантами и рекомендациями). (D-0007)
- `docs/decisions/DECISION_LOG.md` — новая секция «Решения, принятые по умолчанию» (X-01…X-05): источник истины Markdown+YAML, 4 уровня классификации, «правило повышения» для отношений, гипотеза о домене, исключение типа `Documentation` из ядра.
- `docs/PROJECT_MAP.md` §8 — инвентарь сырья с контрольными фактами о противоречиях между документами.
- Риски R-07 (хрупкость раздела 17 v1.1: 13 адаптеров UI, DOM, внутренние API) и R-08 (28 открытых вопросов создают ложное ощущение срочности).

### Changed
- Фаза проекта: 0 → 1 завершена, переход к фазе 2 ожидает подтверждения диагноза.
- Открытые вопросы перегруппированы: «требуют ответа сейчас» (Q1–Q4), «приняты по умолчанию» (Q-04, Q-07…Q-09), «отложены» (Q-05, Q-06, Q-10…Q-13).
- Риск R-03 переведён в статус «подтверждён» (выявлена 41 позиция), риск R-04 — вероятность повышена.

### Fixed
- Зафиксированы факты, требующие исправления в черновиках: `id: DOC-000002` присвоен двум разным документам (C-04); один и тот же ID `OBJECT-TYPE-000001/000003/000006` использован для разных типов (C-05); в префиксе `CHARACTЕR` буква «Е» кириллическая (C-06, проверено побайтово).

### Migrations
- Требуется: нет (модель ещё не наполнена данными).
- Зафиксирована необходимость на будущее: при утверждении D-0008 потребуется таблица маппинга RU→EN и, после наполнения vault, мигратор имён полей.

### Артефакты выпуска
- `docs/metamodel/01_diagnosis.md` (new)
- `inbox/01_Second_Brain_Architecture_Specification.md` (new, read-only)
- `inbox/02_Метамодель_v1.0.md` (new, read-only)
- `inbox/02_Метамодель_v1.1_черновик.md` (new, read-only)
- `docs/PROJECT_MAP.md` (updated → 0.2.0)
- `docs/decisions/DECISION_LOG.md` (updated → 0.2.0)
- `docs/context/CONTEXT_SNAPSHOT.md` (updated → CS-0002)
- `docs/changelog/METAMODEL_VERSIONS.md` (updated)

### Сообщение коммита
```
docs(metamodel): diagnose Second Brain drafts, register 41 issues (v0.2.0)

- import 3 draft documents into read-only inbox/
- add docs/metamodel/01_diagnosis.md: inventory, 10 strong decisions,
  entity/relation inventory, issue register C-01..C-41, top-5 problems P-01..P-05
- add target core hypothesis (draft): M0/M1/M2 layering, 11 core M1 types,
  abstract/domain type split, 3 open linkages with options
- record decisions D-0006..D-0008 and defaults X-01..X-05
- update project map (phase 1 done), context checkpoint CS-0002, risks R-07/R-08
```

---

## [0.1.0] - 2026-10-21

**Версия метамодели:** 0.1.0 · **Стадия:** draft (структурная, содержание метамодели ещё не определено)
**Причина выпуска:** создан каркас документации и набор шаблонов до начала работы над содержанием метамодели.
**Связанные решения:** D-0001, D-0002, D-0003, D-0004, D-0005 · **ADR:** нет

### Added
- `docs/PROJECT_MAP.md` — карта проекта: цель, фазы и ворота, утверждённые решения, открытые вопросы, реестр рисков, определения готовности. (D-0005)
- `docs/README.md` — индекс документации и правила её ведения: статусы документов, нумерация ADR, политика «старое не удаляем». (D-0002)
- `docs/templates/ADR_TEMPLATE.md` — шаблон архитектурного решения с секциями «влияние на метамодель» и «миграция». (D-0003)
- `docs/templates/DECISION_LOG_TEMPLATE.md` — формат сквозного реестра решений и справочник категорий. (D-0003)
- `docs/templates/CHANGELOG_ENTRY_TEMPLATE.md` — формат записи changelog и правила semver для метамодели. (D-0004)
- `docs/templates/ENTITY_TEMPLATE.md` — обязательный формат описания сущности: определение, проверка различимости, атрибуты, связи, enum, даты, валидация, идентичность, представления, RDF/OWL-расширение. (D-0003)
- `docs/templates/RELATION_TEMPLATE.md` — формат описания связи: семантика, роли, кардинальность, физическое представление в Obsidian, атрибуты связи, валидация, RDF/OWL-расширение. (D-0003)
- `docs/decisions/DECISION_LOG.md` — реестр решений, заполнен записями D-0001…D-0005.
- `docs/context/CONTEXT_SNAPSHOT.md` — контрольная точка CS-0001 для переноса состояния в новую сессию. (D-0005)
- Каталоги `docs/{metamodel,adr,glossary,validation,roadmap}`, `schema/`, `examples/`, `inbox/`.

### Changed
- —

### Deprecated
- —

### Removed
- —

### Fixed
- —

### Migrations
- Требуется: нет. Существующих артефактов метамодели в репозитории ещё нет.

### Артефакты выпуска
- `docs/PROJECT_MAP.md` (new)
- `docs/README.md` (new)
- `docs/templates/ADR_TEMPLATE.md` (new)
- `docs/templates/DECISION_LOG_TEMPLATE.md` (new)
- `docs/templates/CHANGELOG_ENTRY_TEMPLATE.md` (new)
- `docs/templates/ENTITY_TEMPLATE.md` (new)
- `docs/templates/RELATION_TEMPLATE.md` (new)
- `docs/decisions/DECISION_LOG.md` (new)
- `docs/context/CONTEXT_SNAPSHOT.md` (new)
- `docs/changelog/CHANGELOG.md` (new)
- `docs/changelog/METAMODEL_VERSIONS.md` (new)

### Сообщение коммита
```
docs: bootstrap documentation scaffold and templates (metamodel v0.1.0)

- add project map with phases, gates, decisions, risks
- add docs index and documentation rules
- add templates: ADR, decision log, changelog entry, entity, relation
- seed decision log (D-0001..D-0005), changelog and context checkpoint CS-0001
```
