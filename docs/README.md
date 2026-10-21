---
doc: docs-index
status: actual
version: 0.13.0
updated: 2026-10-21
---

# Документация проекта: метамодель личной базы знаний

## Структура репозитория

```
kb-metamodel/
├── docs/
│   ├── PROJECT_MAP.md          # карта проекта: цель, фаза, решения, вопросы, риски  ← читать первым
│   ├── README.md               # этот файл: индекс и правила ведения документации
│   ├── templates/              # шаблоны всех документов (обязательны к применению)
│   │   ├── ADR_TEMPLATE.md
│   │   ├── DECISION_LOG_TEMPLATE.md
│   │   ├── CHANGELOG_ENTRY_TEMPLATE.md
│   │   ├── ENTITY_TEMPLATE.md
│   │   └── RELATION_TEMPLATE.md
│   ├── metamodel/              # описание метамодели: ядро, сущности, связи, классификация
│   │   ├── 00_overview.md      # общее описание и классификация (draft)
│   │   ├── 01_diagnosis.md     # диагностика черновиков: 41 позиция, 5 проблем, гипотеза ядра
│   │   ├── NAME_MAPPING.md     # таблица переименований RU → EN, enum, формат дат
│   │   ├── 02_concept_alignment.md # сопоставление с каноном «домен/таксономия/категория/фасет»
│   │   ├── 03_chapter_scenario.md  # сценарий «Глава» — принят (ADR-0010)
│   │   ├── 04_media_asset_scenario.md # MediaAsset — предложение, не утверждено
│   │   ├── TYPE_PREFIX_REGISTRY.md # реестр префиксов типов
│   │   ├── entities/           # (будет) по файлу на сущность
│   │   └── relations/          # (будет) по файлу на связь
│   ├── adr/                    # архитектурные решения ADR-0001…ADR-0011 (accepted)
│   ├── research/
│   │   └── API_FEASIBILITY_NOTES.md # проверка реализуемости по Obsidian API + разбор референсов
│   ├── decisions/
│   │   └── DECISION_LOG.md     # сквозной реестр всех решений, включая мелкие
│   ├── changelog/
│   │   ├── CHANGELOG.md        # основной changelog (Keep a Changelog + semver)
│   │   └── METAMODEL_VERSIONS.md # история версий метамодели и маппинг на changelog
│   ├── glossary/
│   │   └── GLOSSARY.md         # (будет) термины: RU-определение + EN-идентификатор
│   ├── validation/
│   │   └── RULES.md            # каталог правил: ID, уровень, сообщение
│   ├── plugin/
│   │   └── ARCHITECTURE.md     # архитектура плагина: модули, API, этапы, интеграции
│   ├── roadmap/
│   │   ├── ROADMAP.md          # (будет) этапы реализации
│   │   ├── MODULES.md          # (будет) модули: реализуемые / отложенные / нереализуемые
│   │   └── READINESS_CHECKLIST.md # (будет) чек-лист «метамодель утверждена»
│   └── context/
│       └── CONTEXT_SNAPSHOT.md # контрольная точка для переноса в новую сессию
├── schema/                     # JSON Schema (machine-readable) — источник истины для формы данных
│   ├── metamodel-<version>.schema.json # точка входа: диспетчеризация объекта по полю type
│   ├── <version>/common/       # форматы, перечисления, системный контракт, конверт экземпляра M0
│   ├── <version>/m1/           # по файлу на системный тип M1 (12 файлов)
│   └── dist/                   # ПРОИЗВОДНЫЙ единый файл схемы (не редактируется)
├── src/
│   └── generated/              # ПРОИЗВОДНЫЕ TypeScript-типы из схемы (не редактируются)
├── tools/                      # конвейер артефактов: сборка схемы, генерация типов, покрытие, прогон
│   └── fixtures/               # контрольные примеры песочницы (генерируются)
├── examples/                   # канонические примеры заметок каждого типа (фаза 3b)
├── inbox/                      # СЫРЬЁ: загруженные черновики, без правок (read-only)
├── package.json                # зависимости и команды сборки артефактов
└── (позже) plugin/             # исходники плагина Obsidian — только после фазы 5
```

## Конвейер артефактов

Схема нормативна для формы данных, TypeScript-типы и матрица покрытия правил — **производные**
от неё (D-0062). Производные файлы не редактируются руками: правка вносится в схему, затем
конвейер перезапускается. Зависимости нужны только на этапе сборки артефактов; плагин работает
офлайн.

| Команда | Действие |
|---|---|
| `npm install` | установить зависимости сборки (`ajv`, `ajv-formats`, `yaml`, `json-schema-to-typescript`, `@apidevtools/json-schema-ref-parser`) |
| `npm run schema:lint` | статически проверить схему: `$ref`, версии, ветки диспетчеризации, аннотации правил |
| `npm run schema:bundle` | собрать `schema/dist/metamodel-<version>.bundle.json` из фрагментов |
| `npm run schema:types` | сгенерировать `src/generated/metamodel-<version>.types.ts` |
| `npm run schema:coverage` | пересчитать матрицу покрытия правил (`RULES_COVERAGE.md`, `rules-coverage.json`) |
| `npm run fixtures` | пересоздать контрольные примеры песочницы |
| `npm run schema:validate` | прогнать контрольные примеры и обновить `SCHEMA_VALIDATION_RUN.md` |
| `npm run schema:all` | всё перечисленное по порядку (`npm test` — то же) |

Активная версия схемы — та, у точки входа которой нет `x-superseded-by`. Каталоги фрагментов и
производные файлы предыдущих выпусков сохраняются как артефакты своих версий и не пересобираются
(старое не удаляем): `schema/0.12.0/`, `schema/dist/metamodel-0.12.0.bundle.json` и
`src/generated/metamodel-0.12.0.types.ts` соответствуют выпуску 0.12.0.

## Правила ведения документации

1. **Язык.** Проза и описания — русский. Идентификаторы, имена файлов, поля, код — английские (snake_case для полей frontmatter, PascalCase для типов сущностей, kebab-case для имён файлов).
2. **Артефакт немедленно.** Утверждённое решение в тот же ход превращается в файл/запись, а не «на потом».
3. **Старое не удаляем.** Устаревший документ получает в frontmatter `status: deprecated` или `status: superseded`, `superseded_by: <путь>`, `deprecated_at: <дата>`. Файл остаётся в репозитории.
4. **Статусы документов.** `draft` → `review` → `actual` → `deprecated` / `superseded`.
5. **Версионирование.** Metamodель — semver (`MAJOR.MINOR.PATCH`). Каждое утверждённое изменение → запись в `docs/changelog/CHANGELOG.md`.
6. **ADR vs decision log.** ADR — для решений, меняющих ядро, структуру данных, стек или имеющих необратимые последствия. Мелкие и операционные решения — только строка в `DECISION_LOG.md`. Правило: если решение может породить вопрос «почему так?» через месяц — это ADR.
7. **Нумерация.** ADR: `ADR-0001-kebab-title.md`, сквозная, никогда не переиспользуется. Решения в логе: `D-0001`, сквозная.
8. **Пометки в диалоге.** «предложение», «рекомендация», «решение», «вопрос», «риск», «изменение, требующее подтверждения», «предположение, которое можно изменить».
9. **Коммиты.** К каждому артефакту или группе прилагается готовое сообщение коммита в формате Conventional Commits (`docs:`, `feat:`, `refactor:`, `chore:`). Коммит делает пользователь.
10. **Источник истины и производные.** `schema/metamodel-<version>.schema.json` и `schema/<version>/**` — источник истины для формы данных. `schema/dist/**`, `src/generated/**`, `tools/fixtures/**` и разделы документов между маркерами `BEGIN GENERATED` / `END GENERATED` — производные: не редактируются руками, пересобираются скриптом. Расхождение между источником и производным считается ошибкой сборки.
11. **Счётчики считаются программно.** Число правил, решений, префиксов, типов и покрытие схемы не вписываются вручную, а пересчитываются скриптом. Урок фазы 2: вписанное руками число правил разошлось с фактическим.
12. **Расхождение прозы и схемы — находка.** Если машиночитаемая запись противоречит ADR или сводному описанию, расхождение фиксируется в `docs/validation/SCHEMA_VALIDATION_REPORT.md` и, если оно меняет норму, выносится пользователю как вопрос. Молча выбирать одну из трактовок в схеме запрещено (D-0059: приоритет источников **ADR > сводное описание > правила > черновики**).

## Индекс ключевых документов

| Документ | Путь | Статус |
|---|---|---|
| Карта проекта | `docs/PROJECT_MAP.md` | actual |
| Реестр решений | `docs/decisions/DECISION_LOG.md` | actual |
| Changelog | `docs/changelog/CHANGELOG.md` | actual |
| Контрольная точка контекста | `docs/context/CONTEXT_SNAPSHOT.md` | actual (CS-0003) |
| Диагностика черновиков | `docs/metamodel/01_diagnosis.md` | draft (фаза 1 завершена) |
| Таблица имён RU → EN | `docs/metamodel/NAME_MAPPING.md` | actual |
| Заметки по реализуемости API | `docs/research/API_FEASIBILITY_NOTES.md` | actual |
| ADR-0001 Имена полей и подписи | `docs/adr/ADR-0001-english-keys-russian-labels.md` | accepted |
| ADR-0002 Идентичность | `docs/adr/ADR-0002-identity-ulid-and-filename.md` | accepted |
| ADR-0003 Привязка свойств | `docs/adr/ADR-0003-property-attachment.md` | accepted |
| ADR-0004 aliases | `docs/adr/ADR-0004-aliases-only-real-aliases.md` | accepted |
| ADR-0005 Классификация | `docs/adr/ADR-0005-classification.md` | accepted |
| ADR-0006 Роли и профессии | `docs/adr/ADR-0006-roles-and-professions.md` | accepted |
| ADR-0007 Хранение назначений категорий | `docs/adr/ADR-0007-category-assignment-storage.md` | accepted |
| ADR-0008 Активируемые свойства (`Aspect`) | `docs/adr/ADR-0008-aspect-activated-properties.md` | accepted |
| ADR-0009 Жизненный цикл, слияние | `docs/adr/ADR-0009-lifecycle-archive-merge.md` | accepted |
| ADR-0010 Последовательности и формы создания | `docs/adr/ADR-0010-sequences-and-creation-form.md` | accepted |
| ADR-0011 `MediaAsset` | `docs/adr/ADR-0011-media-asset.md` | accepted |
| Описание метамодели | `docs/metamodel/00_overview.md` | draft (ядро полное; статус будет повышен в фазе 4) |
| JSON Schema метамодели | `schema/metamodel-0.13.0.schema.json` + `schema/0.13.0/**` | actual (источник истины для формы данных); `0.12.0` сохранён как артефакт выпуска |
| TypeScript-типы | `src/generated/metamodel-0.13.0.types.ts` | производный (генерируется из схемы) |
| Покрытие правил схемой | `docs/validation/RULES_COVERAGE.md` | actual (28 из 114 правил; генерируется) |
| Отчёт о постройке схемы | `docs/validation/SCHEMA_VALIDATION_REPORT.md` | actual (19 находок: 11 закрыты, 8 приняты как допущения или отложены; Q-51…Q-54 закрыты) |
| Прогон контрольных примеров | `docs/validation/SCHEMA_VALIDATION_RUN.md` | actual (32 из 32; генерируется) |
| Реестр префиксов типов | `docs/metamodel/TYPE_PREFIX_REGISTRY.md` | actual |
| Сопоставление понятий классификации | `docs/metamodel/02_concept_alignment.md` | actual |
| Правила валидации | `docs/validation/RULES.md` | actual (114 правил) |
| Архитектура плагина | `docs/plugin/ARCHITECTURE.md` | draft (уровень реализации) |
| Реестр исходных документов | `docs/metamodel/05_document_status_register.md` | actual |
| Сценарий «Глава» | `docs/metamodel/03_chapter_scenario.md` | actual (принят, ADR-0010) |
| Сценарий `MediaAsset` | `docs/metamodel/04_media_asset_scenario.md` | actual (принят, ADR-0011) |
| Roadmap | `docs/roadmap/ROADMAP.md` | не создан (фаза 3–4) |
