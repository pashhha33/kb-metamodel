#!/usr/bin/env node
/**
 * tools/validate.cjs
 *
 * Песочница валидации: прогоняет контрольные примеры (frontmatter заметок) через
 * производный единый файл JSON Schema и сверяет результат с ожиданием, записанным
 * в самом примере.
 *
 *   вход:   schema/dist/metamodel-<version>.bundle.json (производный, см. schema-bundle.cjs)
 *           tools/fixtures/**\/*.md
 *   выход:  отчёт в stdout + docs/validation/SCHEMA_VALIDATION_RUN.md (между маркерами)
 *
 * Формат контрольного примера — заметка Obsidian: frontmatter YAML, тело Markdown,
 * в теле — строка ожидания:
 *
 *     expect: valid
 *     expect: invalid, errors: /title, /status
 *
 * `errors` перечисляет подстроки, которые обязаны встретиться в instancePath или message
 * хотя бы одной ошибки. Для корневого oneOf AJV сообщает путь ветки, поэтому достаточно
 * указать поле.
 *
 * Важно: это проверка СХЕМЫ, а не всех 114 правил. Межобъектные правила проверяются
 * валидатором плагина (матрица — docs/validation/RULES_COVERAGE.md).
 */
'use strict';

const fs = require('fs');
const path = require('path');
const Ajv2020 = require('ajv/dist/2020');
const addFormats = require('ajv-formats');
const YAML = require('yaml');

const ROOT = path.join(__dirname, '..');
const SCHEMA_DIR = path.join(ROOT, 'schema');
const FIXTURES_DIR = path.join(ROOT, 'tools', 'fixtures');
const REPORT_MD = path.join(ROOT, 'docs', 'validation', 'SCHEMA_VALIDATION_RUN.md');

const BEGIN = '<!-- BEGIN GENERATED: validation-run (tools/validate.cjs) -->';
const END = '<!-- END GENERATED: validation-run -->';

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

function collect(dir, ext) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collect(full, ext));
    else if (entry.name.endsWith(ext)) out.push(full);
  }
  return out.sort();
}

function parseFixture(file) {
  const text = fs.readFileSync(file, 'utf8');
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) throw new Error(file + ': нет frontmatter между --- и ---');
  const fm = YAML.parse(m[1]);
  const body = m[2];
  const expectMatch = body.match(/^expect:\s*(.+)$/m);
  if (!expectMatch) throw new Error(file + ': в теле нет строки «expect:»');
  const spec = expectMatch[1].trim();
  const [validPart, errorsPart] = spec.split(',').map((s) => s.trim());
  const expectation = {
    valid: validPart === 'valid',
    errors: errorsPart && errorsPart.startsWith('errors:')
      ? errorsPart.slice('errors:'.length).split(',').map((s) => s.trim()).filter(Boolean)
      : [],
  };
  if (!expectation.valid && expectation.errors.length === 0) {
    throw new Error(file + ': для expect: invalid нужно указать errors: <подстроки>');
  }
  return { file, frontmatter: fm, expectation, title: (body.match(/^#\s+(.+)$/m) || [])[1] || path.basename(file) };
}

function main() {
  const version = findActiveVersion();
  const bundlePath = path.join(SCHEMA_DIR, 'dist', 'metamodel-' + version + '.bundle.json');
  if (!fs.existsSync(bundlePath)) {
    throw new Error('Нет ' + bundlePath + '. Сначала выполните: npm run schema:bundle');
  }
  const schema = JSON.parse(fs.readFileSync(bundlePath, 'utf8'));

  const ajv = new Ajv2020({
    strict: false,
    allErrors: true,
    validateFormats: true,
    allowUnionTypes: true,
  });
  addFormats(ajv);
  const validate = ajv.compile(schema);

  const fixtures = collect(FIXTURES_DIR, '.md').map(parseFixture);
  const results = [];

  for (const fx of fixtures) {
    const ok = validate(fx.frontmatter);
    const errors = ok ? [] : validate.errors.map((e) => ({
      path: e.instancePath || '(корень)',
      keyword: e.keyword,
      message: e.message,
      branch: typeof e.params === 'object' && e.params !== null ? undefined : undefined,
    }));

    let pass;
    let note;
    if (fx.expectation.valid) {
      pass = ok;
      note = ok ? '' : errors.slice(0, 6).map((e) => e.path + ' ' + e.message).join('; ');
    } else {
      pass =
        !ok &&
        fx.expectation.errors.every((needle) =>
          errors.some((e) => e.path.includes(needle) || (e.message || '').includes(needle))
        );
      note = pass
        ? 'ожидаемо отклонено: ' +
          errors.slice(0, 3).map((e) => e.path + ' ' + e.message).join('; ')
        : ok
          ? 'схема приняла объект, который должен быть отклонён'
          : 'ошибки найдены, но не те: ' + errors.slice(0, 6).map((e) => e.path + ' ' + e.message).join('; ');
    }
    results.push({ ...fx, ok, errors, pass, note });
  }

  const passed = results.filter((r) => r.pass).length;
  const failed = results.length - passed;

  // Отчёт в консоль.
  for (const r of results) {
    console.log(
      (r.pass ? '[ok]   ' : '[FAIL] ') +
        path.relative(ROOT, r.file) +
        ' — ' +
        (r.expectation.valid ? 'valid' : 'invalid') +
        (r.pass ? '' : ' :: ' + r.note)
    );
  }
  console.log(
    '\n[итог] примеров: ' + results.length + ', прошло: ' + passed + ', провалено: ' + failed +
    ' (схема ' + version + ', ' + Math.round(fs.statSync(bundlePath).size / 1024) + ' КБ)'
  );

  // Отчёт в документ.
  if (fs.existsSync(REPORT_MD)) {
    const lines = [];
    lines.push(
      '> Прогон выполнен `tools/validate.cjs` (Node ' + process.versions.node +
      ', AJV ' + require('ajv/package.json').version + '). Дата: ' + new Date().toISOString().slice(0, 10) + '.'
    );
    lines.push('');
    lines.push(
      'Схема: `schema/dist/metamodel-' + version + '.bundle.json` (производная от ' +
      collect(path.join(SCHEMA_DIR, version), '.json').length + ' фрагментов).'
    );
    lines.push('');
    lines.push('**Итог: ' + passed + ' из ' + results.length + ' примеров прошли, ' + failed + ' провалено.**');
    lines.push('');
    lines.push('| Пример | Ожидание | Результат | Комментарий |');
    lines.push('|---|---|---|---|');
    for (const r of results) {
      lines.push(
        '| `' + path.relative(ROOT, r.file) + '` | ' + (r.expectation.valid ? 'valid' : 'invalid') +
        ' | ' + (r.pass ? '✅' : '❌') + ' | ' + (r.note || '—').replace(/\|/g, '\\|').slice(0, 220) + ' |'
      );
    }
    lines.push('');
    const text = fs.readFileSync(REPORT_MD, 'utf8');
    const start = text.indexOf(BEGIN);
    const end = text.indexOf(END);
    if (start === -1 || end === -1) throw new Error('В ' + REPORT_MD + ' нет маркеров генерируемого раздела');
    fs.writeFileSync(
      REPORT_MD,
      text.slice(0, start) + BEGIN + '\n' + lines.join('\n') + END + text.slice(end + END.length),
      'utf8'
    );
    console.log('[ok] отчёт записан: ' + path.relative(process.cwd(), REPORT_MD));
  }

  if (failed > 0) process.exit(1);
}

try {
  main();
} catch (err) {
  console.error('[fail] ' + (err.stack || err.message));
  process.exit(1);
}
