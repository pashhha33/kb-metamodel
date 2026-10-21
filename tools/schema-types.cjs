#!/usr/bin/env node
/**
 * tools/schema-types.cjs
 *
 * Генерирует TypeScript-типы из JSON Schema метамодели (Q-50 = C, D-0062).
 *
 *   вход:   schema/metamodel-<version>.schema.json + schema/<version>/**
 *   выход:  src/generated/metamodel-<version>.types.ts
 *
 * Порядок нормативности: схема первична, типы — производное. Ручные правки
 * сгенерированного файла запрещены: они теряются при следующей генерации.
 * Если типом неудобно пользоваться — правится схема (через ADR, если задета семантика).
 *
 * Технически: фрагменты схемы собираются в один документ с внутренними $defs,
 * потому что генератор не разрешает внешние $ref. Каждый тип компилируется отдельно
 * как корень своей схемы: компиляция корневого диспетчера пересекла бы ветку oneOf
 * с её $ref-целью и потеряла бы поля типов. Диспетчер выражается объединением,
 * которое скрипт дописывает в конец файла из root.oneOf.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { compile } = require('json-schema-to-typescript');

const ROOT = path.join(__dirname, '..');
const SCHEMA_DIR = path.join(ROOT, 'schema');
const ID_BASE = 'https://secondbrain.local/schema/';

const COMPILE_OPTIONS = {
  additionalProperties: false,
  strictIndexSignatures: false,
  unknownAny: false,
  declareExternallyReferenced: true,
  enableConstEnums: false,
  ignoreMinItems: true,
  bannerComment: '',
  style: { singleQuote: true, semi: true, printWidth: 100 },
};

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

function collectFragments(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectFragments(full));
    else if (entry.name.endsWith('.json')) out.push(full);
  }
  return out;
}

function pascalCase(name) {
  return name
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join('');
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

/**
 * Разбивает сгенерированный TypeScript на блоки верхнего уровня,
 * чтобы отсечь повторяющиеся общие определения (Enums, Formats, SystemContract).
 */
function splitTopLevel(ts) {
  const chunks = [];
  let current = [];
  let depth = 0;
  let inComment = false;
  for (const line of ts.split('\n')) {
    const isStart = depth === 0 && !inComment && current.length > 0 && /^(export |interface |type )/.test(line);
    if (isStart) {
      chunks.push(current.join('\n'));
      current = [];
    }
    if (/^\s*\/\*\*/.test(line)) inComment = true;
    if (inComment && /\*\//.test(line)) inComment = false;
    current.push(line);
    for (const ch of line) {
      if (ch === '{') depth += 1;
      else if (ch === '}') depth = Math.max(0, depth - 1);
    }
  }
  if (current.join('').trim()) chunks.push(current.join('\n'));
  return chunks.filter((c) => c.trim().length > 0);
}


/**
 * Подготовка схемы к генерации типов.
 *
 * Валидационные конструкции, которые генератор понимает хуже, чем AJV, упрощаются
 * ТОЛЬКО в копии для типов — сама схема остаётся строгой:
 *
 * 1. allOf с единственным $ref разворачивается в пересечение, которое генератор
 *    и так умеет: SystemContract & {...}. Дополнительные ветки allOf (условия
 *    if/then/else, dependentRequired) из копии убираются — в TypeScript они
 *    вырождаются в индексную подпись [k: string]: any и обесценивают тип.
 *    Ограничение остаётся в силе при валидации и documented в x-notes поля.
 * 2. unevaluatedProperties заменяется на additionalProperties: генератор на
 *    unevaluatedProperties всегда выдаёт индексную подпись.
 */
function forTypeGeneration(schema) {
  const copy = clone(schema);
  const walk = (node) => {
    if (Array.isArray(node)) return node.forEach(walk);
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node.allOf)) {
      const refs = node.allOf.filter((b) => b && b.$ref && Object.keys(b).length === 1);
      const rest = node.allOf.filter((b) => !refs.includes(b));
      if (refs.length) {
        node.allOf = refs;
        // условия и прочие ветки в типы не переносим
        void rest;
      }
    }
    if (node.unevaluatedProperties !== undefined) {
      node.additionalProperties = node.unevaluatedProperties;
      delete node.unevaluatedProperties;
    }
    for (const key of Object.keys(node)) walk(node[key]);
  };
  walk(copy);
  return copy;
}

async function main() {
  const version = findActiveVersion();
  const rootFile = path.join(SCHEMA_DIR, 'metamodel-' + version + '.schema.json');
  if (!fs.existsSync(rootFile)) throw new Error('Не найден ' + rootFile);

  const root = JSON.parse(fs.readFileSync(rootFile, 'utf8'));
  const fragments = collectFragments(path.join(SCHEMA_DIR, version)).map((file) => ({
    file,
    schema: JSON.parse(fs.readFileSync(file, 'utf8')),
  }));

  // 1. Карта URI фрагмента -> имя типа.
  const uriToName = new Map();
  for (const f of fragments) {
    if (!f.schema.$id) throw new Error('Фрагмент без $id: ' + f.file);
    const name = pascalCase(f.schema.title || path.basename(f.file, '.json'));
    if ([...uriToName.values()].includes(name)) {
      throw new Error('Дублирующееся имя типа ' + name + ' (' + f.file + ')');
    }
    uriToName.set(f.schema.$id, name);
  }

  // 2. Переписывание $ref: внешние -> #/$defs/<Имя>, внутренние -> #/$defs/<Имя>/<указатель>.
  const rewriteRefs = (node, ownUri) => {
    if (Array.isArray(node)) return node.forEach((n) => rewriteRefs(n, ownUri));
    if (!node || typeof node !== 'object') return;
    for (const key of Object.keys(node)) {
      if (key === '$ref' && typeof node[key] === 'string') {
        const ref = node[key];
        const hashIndex = ref.indexOf('#');
        const uriPart = hashIndex === -1 ? ref : ref.slice(0, hashIndex);
        const pointerPart = hashIndex === -1 ? '' : ref.slice(hashIndex + 1);
        const absolute =
          uriPart === '' ? ownUri : uriPart.startsWith(ID_BASE) ? uriPart : new URL(uriPart, ownUri).href;
        const name = uriToName.get(absolute);
        if (!name) throw new Error('Неизвестный $ref ' + ref + ' в ' + ownUri);
        node[key] = '#/$defs/' + name + (pointerPart ? '/' + pointerPart.replace(/^\//, '') : '');
      } else if (key !== '$id') {
        rewriteRefs(node[key], ownUri);
      }
    }
  };

  // 3. Единый документ с общими $defs.
  const defs = {};
  for (const f of fragments) {
    const schema = clone(f.schema);
    rewriteRefs(schema, f.schema.$id);
    delete schema.$id;
    delete schema.$schema;
    defs[uriToName.get(f.schema.$id)] = schema;
  }

  // 4. Генерация: каждый тип — отдельный корень компиляции.
  const order = ['SystemContract', ...[...uriToName.values()].filter((n) => n !== 'SystemContract')];
  const blocks = [];
  const seen = new Set();
  for (const name of order) {
    if (!defs[name]) throw new Error('Ожидался фрагмент с именем ' + name);
    const schema = forTypeGeneration(clone(defs[name]));
    schema.$defs = clone(forTypeGeneration(clone(defs)));
    schema.title = name;
    const ts = await compile(schema, name, COMPILE_OPTIONS);
    const kept = [];
    for (const chunk of splitTopLevel(ts)) {
      const nameMatch = chunk.match(/^export\s+(?:interface|type|const)\s+([A-Za-z0-9_]+)/m);
      const key = nameMatch ? nameMatch[1] : chunk.replace(/\s+/g, ' ').trim();
      if (seen.has(key)) continue;
      seen.add(key);
      kept.push(chunk.trim());
    }
    if (kept.length) blocks.push(kept.join('\n\n'));
  }

  // 5. Диспетчер корневого объекта — производное от root.oneOf.
  const branches = (root.anyOf || root.oneOf || [])
    .map((b) => {
      if (!b.$ref) return null;
      const absolute = b.$ref.startsWith(ID_BASE) ? b.$ref : new URL(b.$ref, root.$id).href;
      return uriToName.get(absolute) || null;
    })
    .filter(Boolean);
  const uniqueBranches = [...new Set(branches)];

  const header = [
    '/* eslint-disable */',
    '/**',
    ' * ПРОИЗВОДНЫЙ ФАЙЛ. Сгенерирован tools/schema-types.cjs из schema/metamodel-' + version + '.schema.json',
    ' * и schema/' + version + '/** (Q-49 = B, Q-50 = C; решения D-0061, D-0062).',
    ' * Не редактировать вручную: правки вносятся в схему, затем типы перегенерируются.',
    ' * Версия метамодели: ' + version + '. Источник семантики — docs/metamodel/** и docs/adr/**.',
    ' *',
    ' * Порядок нормативности: ADR → схема → сгенерированные типы. Неудобный тип —',
    ' * признак расхождения схемы и семантики: фиксируется находкой, а не правкой этого файла.',
    ' */',
    '',
  ].join('\n');

  const dispatcher = [
    '/**',
    ' * Диспетчеризация объекта frontmatter по полю `type` (производное от oneOf корневой схемы).',
    ' * Ветки: 12 системных типов M1 и конверт экземпляра предметного типа M0.',
    ' */',
    'export type MetamodelObject =\n  | ' + uniqueBranches.join('\n  | ') + ';',
    '',
    '/** Версия метамодели, под которую сгенерированы типы. */',
    "export const METAMODEL_VERSION = '" + version + "';",
    '',
  ].join('\n');

  const outFile = path.join(ROOT, 'src', 'generated', 'metamodel-' + version + '.types.ts');
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, [header, dispatcher, blocks.join('\n\n'), ''].join('\n'), 'utf8');

  const result = fs.readFileSync(outFile, 'utf8');
  const exported = (result.match(/^export (?:interface|type|const) /gm) || []).length;
  const kb = (fs.statSync(outFile).size / 1024).toFixed(1);
  console.log(
    '[ok] ' + path.relative(process.cwd(), outFile) + ' — ' + kb + ' КБ, экспортов: ' + exported +
    ', фрагментов: ' + fragments.length + ', веток диспетчера: ' + uniqueBranches.length
  );
}

main().catch((err) => {
  console.error('[fail] ' + (err.stack || err.message));
  process.exit(1);
});
