#!/usr/bin/env node
/**
 * tools/schema-bundle.cjs
 *
 * Собирает раздельные файлы JSON Schema (Q-49 = B, D-0061) в один производный файл.
 *
 *   вход:   schema/metamodel-<version>.schema.json + schema/<version>/**
 *   выход:  schema/dist/metamodel-<version>.bundle.json
 *
 * Зачем: внешние $ref не разрешаются большинством потребителей схемы без загрузчика.
 * Единый файл нужен (1) генератору TypeScript-типов (Q-50 = C, D-0062), (2) песочнице
 * валидации, (3) сборке плагина, где схема упаковывается в артефакт и работает офлайн.
 *
 * Статус выхода: производные данные, не источник истины (X-01). Файл пересобирается,
 * ручные правки запрещены.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const $RefParser = require('@apidevtools/json-schema-ref-parser');

const SCHEMA_DIR = path.join(__dirname, '..', 'schema');

/**
 * Пространство имён $id схемы — https://secondbrain.local/schema/...
 * Оно не разрешается по сети (проект локальный и офлайн), поэтому добавлен
 * резолвер, отображающий URI на каталог schema/ репозитория.
 */
const ID_BASE = 'https://secondbrain.local/schema/';
const localResolver = {
  order: 1,
  canRead: (file) => typeof file.url === 'string' && file.url.startsWith(ID_BASE),
  read: (file) => {
    const rel = file.url.slice(ID_BASE.length).split('#')[0];
    const abs = path.join(SCHEMA_DIR, rel);
    if (!fs.existsSync(abs)) {
      throw new Error(`Фрагмент схемы не найден: ${rel} (ожидался ${abs})`);
    }
    return fs.readFileSync(abs, 'utf8');
  },
};

/**
 * Активная версия схемы — та, у точки входа которой нет `x-superseded-by`.
 * Каталоги предыдущих версий сохраняются как артефакты своих выпусков (старое не удаляем),
 * поэтому выбор по «последней по сортировке» был бы неоднозначным.
 */
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

async function main() {
  const version = findActiveVersion();
  const rootFile = `metamodel-${version}.schema.json`;

  const dereferenced = await $RefParser.dereference(ID_BASE + rootFile, {
    resolve: { file: { order: 2 }, local: localResolver },
    dereference: { circular: 'ignore' },
  });

  // После разыменования вложенные $id становятся лишними: AJV трактует их как отдельные
  // схемы с тем же URI и сообщает «resolves to more than one schema». Корневой $id сохраняем.
  const rootId = dereferenced.$id;
  stripNestedIds(dereferenced);
  dereferenced.$id = rootId;

  // Версия из имени файла — источник истины для имени артефакта (правило синхронизации
  // docs/changelog/METAMODEL_VERSIONS.md). Проверяем согласие с полем внутри схемы.
  const declared = dereferenced['x-metamodel-version'];
  if (declared !== version) {
    throw new Error(
      `Имя файла (${version}) не совпадает с x-metamodel-version (${declared ?? 'отсутствует'})`
    );
  }

  dereferenced.$comment =
    `ПРОИЗВОДНЫЙ ФАЙЛ. Сгенерирован tools/schema-bundle.cjs из schema/${rootFile} и schema/${version}/**. Не редактировать вручную.`;

  const distDir = path.join(SCHEMA_DIR, 'dist');
  fs.mkdirSync(distDir, { recursive: true });
  const outFile = path.join(distDir, `metamodel-${version}.bundle.json`);
  fs.writeFileSync(outFile, JSON.stringify(dereferenced, null, 2) + '\n', 'utf8');

  const sources = countSources(path.join(SCHEMA_DIR, version));
  const size = fs.statSync(outFile).size;
  console.log(
    `[ok] ${path.relative(process.cwd(), outFile)} — ${size} Б, веток диспетчеризации: ${
      dereferenced.anyOf ? dereferenced.anyOf.length : dereferenced.oneOf ? dereferenced.oneOf.length : 0
    }, исходных фрагментов: ${sources}`
  );
}

function stripNestedIds(node) {
  if (Array.isArray(node)) return node.forEach(stripNestedIds);
  if (!node || typeof node !== 'object') return;
  for (const key of Object.keys(node)) {
    if (key === '$id') delete node[key];
    else stripNestedIds(node[key]);
  }
}

function countSources(dir) {
  if (!fs.existsSync(dir)) return 0;
  let n = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    n += entry.isDirectory()
      ? countSources(path.join(dir, entry.name))
      : entry.name.endsWith('.json')
        ? 1
        : 0;
  }
  return n;
}

main().catch((err) => {
  console.error(`[fail] ${err.message}`);
  process.exit(1);
});
