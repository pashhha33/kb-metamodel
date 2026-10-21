#!/usr/bin/env node
/**
 * tools/quality-check.cjs — формальная сверка описаний сущностей (фаза 3c) с источниками.
 *
 * Модуль QualityReport (docs/plugin/ARCHITECTURE.md §4.3, фаза 3d; практика Exocortex, D-0016).
 * Проверяет docs/metamodel/entities/*.md против:
 *   1. frontmatter описания: schema_fragment и canonical_example существуют, type_id — из enum
 *      m1_type, имя файла = type_id, entity — PascalCase;
 *   2. §4 «Атрибуты»: каждое поле фрагмента схемы (кроме полей системного контракта) описано
 *      в таблице; каждое поле таблицы существует в схеме (или является контрактным/служебным);
 *   3. §8 «Ограничения и правила валидации»: каждый процитированный идентификатор правила
 *      существует в каталоге docs/validation/RULES.md;
 *   4. §11 «Пример заметки»: YAML примера совпадает с frontmatter канонической заметки
 *      (canonical_example) по составу и значениям полей.
 *
 * Результат: печать расхождений + производный docs/validation/quality-check.json.
 * Описание со статусом draft проверяется так же строго, как actual: расхождения —
 * материал ревью (Q-67/Q-69), а не повод смягчать проверку.
 *
 * Запуск: npm run quality:check (нужны зависимости: yaml).
 */
'use strict';

const fs = require('fs');
const path = require('path');
const YAML = require('yaml');

const ROOT = path.resolve(__dirname, '..');
const ENTITIES_DIR = path.join(ROOT, 'docs', 'metamodel', 'entities');
const RULES_MD = path.join(ROOT, 'docs', 'validation', 'RULES.md');
const OUT_JSON = path.join(ROOT, 'docs', 'validation', 'quality-check.json');

/** Поля системного контракта: описываются один раз (NAME_MAPPING, 00_overview §2),
 *  в таблицах §4 типов могут отсутствовать. cat_* — расширяемый слой контракта. */
const CONTRACT_FIELDS = new Set([
  'id', 'type', 'title', 'aliases', 'created_at', 'updated_at', 'status', 'tags',
]);
function isContractField(name) {
  return CONTRACT_FIELDS.has(name) || name.startsWith('cat_');
}

const M1_TYPES = new Set([
  'object_type', 'property_type', 'property', 'relation_type', 'relation', 'taxonomy',
  'facet', 'category', 'media_asset', 'view', 'automation', 'aspect',
]);

function readIfExists(p) {
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
}

function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  return YAML.parse(m[1]);
}

/** Секция "## N. …" — текст до следующего заголовка "## ". */
function section(body, num) {
  const out = [];
  let inSec = false;
  for (const line of body.split('\n')) {
    if (line.startsWith('## ')) {
      if (inSec) break;
      inSec = line.startsWith('## ' + num + '.');
      continue;
    }
    if (inSec) out.push(line);
  }
  return out.join('\n');
}

/** Имена полей в первом столбце строк таблицы: | `name` | … */
function tableFields(sectionText) {
  const out = new Set();
  for (const line of sectionText.split('\n')) {
    if (!line.startsWith('|')) continue;
    const cells = line.split('|');
    if (cells.length < 2) continue;
    // Первая ячейка может перечислять несколько полей: `label_ru`, `label_en`.
    for (const m of cells[1].matchAll(/`([a-z_][a-z0-9_]*)`/g)) out.add(m[1]);
  }
  return out;
}

function ruleIds(sectionText) {
  const out = new Set();
  for (const line of sectionText.split('\n')) {
    if (!line.startsWith('|')) continue;
    for (const m of line.matchAll(/`([a-z]+\.r\d+)`/g)) out.add(m[1]);
  }
  return out;
}

function firstYamlBlock(sectionText) {
  const m = sectionText.match(/```yaml\r?\n([\s\S]*?)```/);
  if (!m) return null;
  // Блок может быть обёрнут ограждением frontmatter (--- … ---) — снимаем его.
  let src = m[1].trim();
  if (src.startsWith('---')) src = src.replace(/^---\r?\n/, '');
  src = src.replace(/\r?\n---\s*$/, '');
  return src;
}

function normValue(v) {
  return JSON.stringify(v === undefined ? null : v);
}

function compareFrontmatter(example, vault) {
  const diffs = [];
  const keys = new Set([...Object.keys(example || {}), ...Object.keys(vault || {})]);
  for (const k of [...keys].sort()) {
    const a = normValue((example || {})[k]);
    const b = normValue((vault || {})[k]);
    if (a !== b) diffs.push({ field: k, example: a, vault: b });
  }
  return diffs;
}

function main() {
  const rulesText = readIfExists(RULES_MD);
  if (!rulesText) throw new Error('Не найден каталог: ' + RULES_MD);
  const catalog = new Set();
  for (const m of rulesText.matchAll(/^\|\s*`([a-z]+\.r\d+)`\s*\|/gm)) catalog.add(m[1]);

  const files = fs
    .readdirSync(ENTITIES_DIR)
    .filter((f) => f.endsWith('.md') && !f.startsWith('.'))
    .sort();

  const report = {
    generated_by: 'tools/quality-check.cjs',
    generated_at: new Date().toISOString(),
    entities: [],
    totals: { files: 0, mismatches: 0 },
  };

  let mismatchTotal = 0;
  for (const file of files) {
    const rel = 'docs/metamodel/entities/' + file;
    const text = fs.readFileSync(path.join(ENTITIES_DIR, file), 'utf8');
    const fm = parseFrontmatter(text);
    const body = text.replace(/^---[\s\S]*?---\n/, '');
    const entry = { file: rel, type_id: fm ? fm.type_id : null, status: fm ? fm.status : null, issues: [] };
    const issue = (check, msg) => entry.issues.push({ check, message: msg });

    if (!fm || fm.doc !== 'entity') {
      issue('frontmatter', 'нет frontmatter doc: entity');
      report.entities.push(entry);
      mismatchTotal += entry.issues.length;
      continue;
    }

    // 1. Frontmatter
    if (!M1_TYPES.has(fm.type_id)) issue('frontmatter', 'type_id «' + fm.type_id + '» не входит в m1_type');
    if (path.basename(file, '.md') !== fm.type_id) {
      issue('frontmatter', 'имя файла ' + file + ' ≠ type_id ' + fm.type_id);
    }
    if (!/^[A-Z][A-Za-z]*$/.test(String(fm.entity || ''))) issue('frontmatter', 'entity не PascalCase: ' + fm.entity);
    const fragPath = fm.schema_fragment ? path.join(ROOT, fm.schema_fragment) : null;
    if (!fragPath || !fs.existsSync(fragPath)) {
      issue('frontmatter', 'schema_fragment не найден: ' + fm.schema_fragment);
    }
    const exPath = fm.canonical_example ? path.join(ROOT, fm.canonical_example) : null;
    if (!exPath || !fs.existsSync(exPath)) {
      issue('frontmatter', 'canonical_example не найден: ' + fm.canonical_example);
    }

    // 2. §4 Атрибуты против фрагмента схемы
    if (fragPath && fs.existsSync(fragPath)) {
      const frag = JSON.parse(fs.readFileSync(fragPath, 'utf8'));
      const schemaFields = new Set(Object.keys(frag.properties || {}));
      const docFields = tableFields(section(body, '4'));
      for (const f of [...schemaFields].sort()) {
        if (!docFields.has(f) && !isContractField(f)) {
          issue('fields', 'поле схемы не описано в §4: ' + f);
        }
      }
      for (const f of [...docFields].sort()) {
        if (!schemaFields.has(f) && !isContractField(f)) {
          issue('fields', 'поле §4 отсутствует во фрагменте схемы: ' + f);
        }
      }
    }

    // 3. §8 Правила против каталога
    for (const r of [...ruleIds(section(body, '8'))].sort()) {
      if (!catalog.has(r)) issue('rules', 'правило не найдено в каталоге RULES.md: ' + r);
    }

    // 4. §11 Пример против канонической заметки
    const exampleYaml = firstYamlBlock(section(body, '11'));
    if (!exampleYaml) {
      issue('example', 'в §11 нет yaml-блока');
    } else if (exPath && fs.existsSync(exPath)) {
      const vaultFm = parseFrontmatter(fs.readFileSync(exPath, 'utf8'));
      let exampleFm = null;
      try {
        exampleFm = YAML.parse(exampleYaml);
      } catch (e) {
        issue('example', 'yaml-блок §11 не парсится: ' + e.message);
      }
      if (exampleFm) {
        for (const d of compareFrontmatter(exampleFm, vaultFm)) {
          issue('example', '§11 ≠ канон: поле ' + d.field + ' (пример: ' + d.example + ', канон: ' + d.vault + ')');
        }
      }
    }

    report.entities.push(entry);
    mismatchTotal += entry.issues.length;
  }

  report.totals.files = report.entities.length;
  report.totals.mismatches = mismatchTotal;
  report.catalog_rules = catalog.size;

  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify(report, null, 2) + '\n', 'utf8');

  for (const e of report.entities) {
    if (e.issues.length === 0) {
      console.log('[ok]   ' + e.file + ' (' + e.status + ')');
    } else {
      console.log('[FAIL] ' + e.file + ' (' + e.status + ')');
      for (const i of e.issues) console.log('       ' + i.check + ': ' + i.message);
    }
  }
  console.log('\n[итог] описаний: ' + report.totals.files + ', расхождений: ' + mismatchTotal +
    ', правил в каталоге: ' + catalog.size);
  console.log('[ok] отчёт записан: docs/validation/quality-check.json');
  if (mismatchTotal > 0) process.exit(1);
}

main();
