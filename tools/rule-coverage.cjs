#!/usr/bin/env node
/**
 * tools/rule-coverage.cjs
 *
 * Строит матрицу покрытия каталога правил валидации JSON Schema.
 *
 *   вход:   docs/validation/RULES.md (каталог правил) + schema/<version>/** (аннотации x-rules)
 *   выход:  docs/validation/RULES_COVERAGE.md (генерируемый раздел между маркерами)
 *           docs/validation/rules-coverage.json (машиночитаемый снимок)
 *
 * Зачем: выбор Q-50 = C (D-0062) означает, что JSON Schema покрывает только форму объекта,
 * а межобъектные правила остаются обязанностью валидатора. Состав покрытия должен быть
 * проверяемым фактом, а не утверждением в прозе: все счётчики считаются здесь.
 *
 * Соглашение: x-rules перечисляет правила, которые схема ПОЛНОСТЬЮ обеспечивает
 * (нарушение невозможно для данных, прошедших схему). Частичное покрытие и пояснения —
 * в x-notes соответствующего поля.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SCHEMA_DIR = path.join(ROOT, 'schema');
const RULES_MD = path.join(ROOT, 'docs', 'validation', 'RULES.md');
const COVERAGE_MD = path.join(ROOT, 'docs', 'validation', 'RULES_COVERAGE.md');
const COVERAGE_JSON = path.join(ROOT, 'docs', 'validation', 'rules-coverage.json');

const BEGIN = '<!-- BEGIN GENERATED: rule-coverage (tools/rule-coverage.cjs) -->';
const END = '<!-- END GENERATED: rule-coverage -->';

function findActiveVersion() {
  const roots = fs
    .readdirSync(SCHEMA_DIR)
    .filter((f) => /^metamodel-\d+\.\d+\.\d+\.schema\.json$/.test(f))
    .map((f) => ({ file: f, doc: JSON.parse(fs.readFileSync(path.join(SCHEMA_DIR, f), 'utf8')) }))
    .filter((r) => !r.doc['x-superseded-by']);
  if (roots.length !== 1) {
    throw new Error(
      'Ожидалась ровно одна точка входа схемы без x-superseded-by, найдено: ' +
        (roots.map((r) => r.file).join(', ') || 'ни одной')
    );
  }
  const version = roots[0].file.match(/^metamodel-(\d+\.\d+\.\d+)\.schema\.json$/)[1];
  if (!fs.existsSync(path.join(SCHEMA_DIR, version))) {
    throw new Error('Для ' + roots[0].file + ' нет каталога фрагментов schema/' + version + '/');
  }
  return version;
}

/** Каталог правил: строки таблиц «| `group.rN` | level | ...» из RULES.md. */
function parseRules(text) {
  const rules = new Map();
  const re = /^\|\s*`([a-z]+(?:\s*\+\s*[a-z]+)*)\.r(\d+)`\s*\|\s*(error|warn|info)\s*\|/gm;
  let m;
  while ((m = re.exec(text)) !== null) {
    const group = m[1].replace(/\s*\+\s*[a-z]+/g, '');
    const id = group + '.r' + m[2];
    if (rules.has(id)) throw new Error('Правило ' + id + ' объявлено в RULES.md более одного раза');
    rules.set(id, { id, group, level: m[3] });
  }
  if (rules.size === 0) throw new Error('В RULES.md не найдено ни одного правила');
  return [...rules.values()];
}

function collectSchemaFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectSchemaFiles(full));
    else if (entry.name.endsWith('.json')) out.push(full);
  }
  return out;
}

/** Сбор x-rules с указанием файла, в котором аннотация найдена. */
function collectAnnotations(files) {
  const annotated = new Map();
  const walk = (node, file) => {
    if (Array.isArray(node)) return node.forEach((n) => walk(n, file));
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node['x-rules'])) {
      for (const id of node['x-rules']) {
        if (!annotated.has(id)) annotated.set(id, new Set());
        annotated.get(id).add(path.relative(ROOT, file));
      }
    }
    for (const key of Object.keys(node)) walk(node[key], file);
  };
  for (const file of files) {
    walk(JSON.parse(fs.readFileSync(file, 'utf8')), file);
  }
  return annotated;
}

function main() {
  const version = findActiveVersion();
  const rulesText = fs.readFileSync(RULES_MD, 'utf8');
  const rules = parseRules(rulesText);
  const files = [
    path.join(SCHEMA_DIR, 'metamodel-' + version + '.schema.json'),
    ...collectSchemaFiles(path.join(SCHEMA_DIR, version)),
  ];
  const annotated = collectAnnotations(files);

  const byId = new Map(rules.map((r) => [r.id, r]));
  const unknown = [...annotated.keys()].filter((id) => !byId.has(id)).sort();
  const covered = rules.filter((r) => annotated.has(r.id));
  const validatorOnly = rules.filter((r) => !annotated.has(r.id));

  const groups = [...new Set(rules.map((r) => r.group))];
  const count = (list, level) => list.filter((r) => r.level === level).length;

  const rows = groups.map((g) => {
    const all = rules.filter((r) => r.group === g);
    const cov = covered.filter((r) => r.group === g);
    return {
      group: g,
      total: all.length,
      error: count(all, 'error'),
      warn: count(all, 'warn'),
      info: count(all, 'info'),
      schema: cov.length,
      validator: all.length - cov.length,
    };
  });

  const totals = rows.reduce(
    (acc, r) => ({
      total: acc.total + r.total,
      error: acc.error + r.error,
      warn: acc.warn + r.warn,
      info: acc.info + r.info,
      schema: acc.schema + r.schema,
      validator: acc.validator + r.validator,
    }),
    { total: 0, error: 0, warn: 0, info: 0, schema: 0, validator: 0 }
  );

  const schemaError = count(covered, 'error');
  const schemaWarn = count(covered, 'warn');
  const schemaInfo = count(covered, 'info');

  const lines = [];
  lines.push(
    '> Раздел сгенерирован `tools/rule-coverage.cjs`. Все числа пересчитаны программно, а не вписаны вручную.'
  );
  lines.push('');
  lines.push(
    'Схема версии **' + version + '** (' + files.length + ' файлов), каталог правил — `docs/validation/RULES.md`.'
  );
  lines.push('');
  lines.push('## Покрытие по группам');
  lines.push('');
  lines.push('| Группа | Всего | error | warn | info | Покрывает схема | Только валидатор |');
  lines.push('|---|---|---|---|---|---|---|');
  for (const r of rows) {
    lines.push(
      '| `' + r.group + '` | ' + r.total + ' | ' + r.error + ' | ' + r.warn + ' | ' + r.info +
      ' | ' + r.schema + ' | ' + r.validator + ' |'
    );
  }
  lines.push(
    '| **Итого** | **' + totals.total + '** | **' + totals.error + '** | **' + totals.warn +
    '** | **' + totals.info + '** | **' + totals.schema + '** | **' + totals.validator + '** |'
  );
  lines.push('');
  lines.push('## Итог');
  lines.push('');
  lines.push(
    '- Всего правил в каталоге: **' + totals.total + '** (' + totals.error + ' error, ' +
    totals.warn + ' warn, ' + totals.info + ' info).'
  );
  lines.push(
    '- Полностью покрывает JSON Schema: **' + totals.schema + '** (' + schemaError + ' error, ' +
    schemaWarn + ' warn, ' + schemaInfo + ' info) — **' +
    Math.round((totals.schema / totals.total) * 100) + ' %** каталога.'
  );
  lines.push(
    '- Остаются обязанностью валидатора: **' + totals.validator + '** (' +
    count(validatorOnly, 'error') + ' error, ' + count(validatorOnly, 'warn') + ' warn, ' +
    count(validatorOnly, 'info') + ' info).'
  );
  lines.push(
    '- Из ' + totals.error + ' правил уровня error схема обеспечивает **' + schemaError + '**; ' +
    (totals.error - schemaError) + ' проверяются только валидатором. Это прямое следствие решения ' +
    'Q-50 = C (D-0062): межобъектные ограничения в JSON Schema невыразимы.'
  );
  if (unknown.length) {
    lines.push('');
    lines.push(
      '⚠️ Аннотации `x-rules` ссылаются на правила, которых нет в каталоге: ' +
      unknown.map((u) => '`' + u + '`').join(', ') + '. Требуется исправление.'
    );
  }
  lines.push('');
  lines.push('## Правила, которые покрывает схема (' + covered.length + ')');
  lines.push('');
  lines.push('| ID | Уровень | Файлы схемы с аннотацией |');
  lines.push('|---|---|---|');
  for (const r of covered) {
    lines.push(
      '| `' + r.id + '` | ' + r.level + ' | ' + [...annotated.get(r.id)].map((f) => '`' + f + '`').join(', ') + ' |'
    );
  }
  lines.push('');
  lines.push('## Правила только валидатора (' + validatorOnly.length + ')');
  lines.push('');
  lines.push('Причина — в комментарии. «Межобъектное» означает, что проверка требует индекса хранилища,');
  lines.push('разрешения ссылок или сравнения нескольких объектов, чего JSON Schema не умеет (D-0062).');
  lines.push('');
  lines.push('| ID | Уровень | Причина |');
  lines.push('|---|---|---|');
  for (const r of validatorOnly) {
    lines.push('| `' + r.id + '` | ' + r.level + ' | ' + reason(r.id) + ' |');
  }
  lines.push('');

  const block = BEGIN + '\n' + lines.join('\n') + END;

  let out;
  if (fs.existsSync(COVERAGE_MD)) {
    const text = fs.readFileSync(COVERAGE_MD, 'utf8');
    const start = text.indexOf(BEGIN);
    const end = text.indexOf(END);
    if (start === -1 || end === -1) {
      throw new Error('В ' + COVERAGE_MD + ' нет маркеров генерируемого раздела');
    }
    out = text.slice(0, start) + block + text.slice(end + END.length);
  } else {
    throw new Error('Файл ' + COVERAGE_MD + ' отсутствует: создайте его вручную (заголовок и пояснения), генерируется только раздел между маркерами');
  }
  fs.writeFileSync(COVERAGE_MD, out, 'utf8');

  fs.writeFileSync(
    COVERAGE_JSON,
    JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        schema_version: version,
        totals,
        covered: covered.map((r) => ({ id: r.id, level: r.level, files: [...annotated.get(r.id)] })),
        validator_only: validatorOnly.map((r) => ({ id: r.id, level: r.level, reason: reason(r.id) })),
        unknown_annotations: unknown,
      },
      null,
      2
    ) + '\n',
    'utf8'
  );

  console.log(
    '[ok] покрытие: ' + totals.schema + ' из ' + totals.total + ' правил (' +
    Math.round((totals.schema / totals.total) * 100) + ' %), только валидатор: ' + totals.validator +
    '; error — ' + schemaError + ' из ' + totals.error
  );
  if (unknown.length) {
    console.error('[fail] аннотации на несуществующие правила: ' + unknown.join(', '));
    process.exit(1);
  }
}

/**
 * Классификация причины, по которой правило не выражено в схеме.
 * Основание — формулировка правила в RULES.md; список поддерживается вместе с каталогом.
 */
function reason(id) {
  const group = id.split('.')[0];
  const perRule = {
    'contract.r3': 'Межобъектное: уникальность id в хранилище',
    'contract.r5': 'Требует индекса типов: абстрактность типа хранится в определении ObjectType',
    'contract.r9': 'Сравнение двух полей с приведением форматов даты',
    'contract.r10': 'Требует имени файла: схема проверяет только frontmatter',
    'contract.r11': 'Требует имени файла: соответствие шаблону {title} ({PREFIX}-{id}).md',
    'contract.r12': 'Требует имени файла: усечение title до 60 символов',
    'naming.r3': 'Межобъектное: уникальность key среди всех Property',
    'naming.r6': 'Межобъектное: уникальность type_prefix по реестру',
    'naming.r9': 'Межобъектное: глобальная уникальность Facet.key',
    'naming.r11': 'Требует имени бинарного файла, а не frontmatter',
    'format.r3': 'Уровень info: схема допускает Z как результат сериализации Obsidian',
    'property.r1': 'Требует эффективного набора свойств типа (алгоритм ADR-0008 §3.3)',
    'property.r2': 'Мощность значения зависит от cardinality свойства: производная схема типа',
    'property.r3': 'Соответствие значения value_type: производная схема типа',
    'property.r4': 'Значение allowed_values известно только из определения Property',
    'property.r5': 'Требует эффективного набора свойств типа и активированных аспектов',
    'property.r6': 'Требует назначенных категорий и состава аспектов',
    'property.r7': 'Сравнение переопределения с определением свойства',
    'link.r1': 'Разрешение ссылки по индексу хранилища',
    'link.r2': 'Требует типа цели ссылки',
    'link.r3': 'Требует фасета категории-цели',
    'link.r5': 'Сравнение подписи ссылки с актуальным title цели',
    'link.r6': 'Неоднозначность разрешения: несколько файлов на одну стабильную часть',
    'relation.r2': 'Требует типа субъекта и состава subject_types',
    'relation.r3': 'Требует типа объекта и состава object_types',
    'relation.r4': 'Межобъектное: правило уникальности экземпляров отношения',
    'relation.r5': 'Межобъектное: наличие обратной связи при direction: symmetric',
    'relation.r6': 'Межобъектное: связь не должна существовать в двух формах',
    'relation.r7': 'Сравнение фактических типов с рекомендацией RelationType',
    'relation.r8': 'Сравнение двух полей с приведением форматов даты',
    'classif.r1': 'Разрешение ссылки на фасет',
    'classif.r2': 'Требует таксономию категории и applicable_types',
    'classif.r3': 'Длина списка cat_<key> против assignment_cardinality фасета',
    'classif.r5': 'Межобъектное: цикл в Category.parent',
    'classif.r6': 'Межобъектное: число корневых категорий фасета',
    'classif.r7': 'Межобъектное: мёртвая категория',
    'classif.r8': 'Межобъектное: уникальность названия в пределах фасета',
    'classif.r9': 'Межобъектное: одинаковое название в разных фасетах таксономии',
    'classif.r11': 'Требует фасета категории-цели',
    'classif.r12': 'Межобъектное: поле cat_* без соответствующего фасета',
    'inherit.r1': 'Сравнение с унаследованным определением свойства',
    'inherit.r2': 'Сравнение с унаследованным определением свойства',
    'inherit.r3': 'Сравнение с унаследованным определением свойства',
    'inherit.r4': 'Сравнение с унаследованным определением свойства',
    'inherit.r5': 'Межобъектное: цикл в parent_type',
    'inherit.r6': 'Разрешение ссылки на родительский тип',
    'inherit.r7': 'Межобъектное: глубина иерархии типов',
    'aspect.r1': 'Требует назначенных категорий и состава аспектов',
    'aspect.r2': 'Межобъектное: конфликт двух активированных аспектов (error при загрузке)',
    'aspect.r3': 'Разрешение ссылок trigger_categories и проверка типа цели',
    'aspect.r4': 'Разрешение ссылок properties и проверка типа цели',
    'aspect.r5': 'Сравнение с ограничением, заданным типом объекта',
    'aspect.r6': 'Уровень info: сообщение о выключенном аспекте, нарушение формы отсутствует',
    'meta.r4': 'Разрешение ссылок subject_types и object_types',
    'meta.r5': 'Разрешение ссылок applicable_types',
    'meta.r6': 'Разрешение ссылок Facet.taxonomy и Category.facet',
    'meta.r11': 'Межобъектное: deprecated, но используется объектами',
    'meta.r12': 'Межобъектное: уникальность id среди определений M1',
    'meta.r13': 'Межобъектное: неиспользуемое определение',
    'meta.r14': 'Требует состава свойств типа: плейсхолдеры {key} в title_template',
    'view.r2': 'Требует состава свойств целевого типа',
    'alias.r1': 'Сравнение с title: нормализация пробелов и регистра',
    'alias.r2': 'Межобъектное: один псевдоним у нескольких объектов',
    'lifecycle.r1': 'Межобъектное: статус цели связи supersedes / merged_into',
    'lifecycle.r2': 'Межобъектное: ссылки активных объектов на архивный',
    'lifecycle.r3': 'Межобъектное: число исходящих связей замены',
    'lifecycle.r4': 'Требует состояния хранилища: файл существует, ссылки не переведены',
    'lifecycle.r5': 'Уровень info: необычный переход статуса',
    'sequence.r2': 'Требует определения свойства: value_type и cardinality',
    'sequence.r3': 'Требует определения свойства: value_type и cardinality',
    'sequence.r4': 'Проверяется на объекте M0, требует производной схемы типа',
    'sequence.r5': 'Межобъектное: разрыв нумерации между соседями',
    'unique.r1': 'Межобъектное: уникальность пары (область, значение) в хранилище',
    'unique.r2': 'Требует эффективного набора свойств типа',
    'media.r1': 'Требует хранилища: файл существует',
    'media.r3': 'Разрешение ссылок galleries и проверка типа цели',
    'media.r4': 'Межобъектное: обёртка-сирота',
    'media.r5': 'Сравнение ролей обёртки с expected_media_roles свойства',
    'media.r6': 'Межобъектное: один файл у нескольких обёрток',
    'media.r7': 'Число галерей: пороговая проверка warn',
    'media.r8': 'Уровень info: файл вложения без обёртки — норма',
    'media.r9': 'Требует имени бинарного файла',
  };
  if (perRule[id]) return perRule[id];
  const perGroup = {
    contract: 'Требует имени файла или индекса хранилища',
    naming: 'Межобъектная уникальность',
    classif: 'Требует индекса классификации',
    link: 'Разрешение ссылок',
    relation: 'Межобъектное',
    inherit: 'Сравнение с наследуемым определением',
    aspect: 'Требует состава аспектов',
    meta: 'Разрешение ссылок',
    property: 'Требует эффективного набора свойств',
    view: 'Требует состава целевого типа',
    alias: 'Межобъектное',
    lifecycle: 'Межобъектное',
    sequence: 'Требует определений свойств',
    unique: 'Межобъектное',
    media: 'Требует хранилища',
    format: 'Значение уже ограничено enum в схеме',
  };
  return perGroup[group] || 'Межобъектное или требующее индекса хранилища';
}

main();
