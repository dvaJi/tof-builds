import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const OFFICIALLOC_PATH = path.join(
  __dirname,
  '..',
  '..',
  'OfficialLocalization'
);

const ENtextMap = JSON.parse(
  fs.readFileSync(path.join(OFFICIALLOC_PATH, 'en', `Game.json`))
);

const TARGET_DIR = path.join(__dirname, '..', '..', 'EnTextMap');

export function main() {
  let fullTextMap = {};

  for (const [key, value] of Object.entries(ENtextMap)) {
    const textMap = {};

    for (const [key2, value2] of Object.entries(value)) {
      textMap[value2] = key2;

      const fullKey = `${key}.${value2}`.toLowerCase();
      if (fullTextMap[fullKey]) {
        console.log('Duplicate key found: ', value2);
        fullTextMap[`${formatTo(fullKey)}_`] = key2;
      } else {
        fullTextMap[formatTo(fullKey)] = key2;
      }
    }

    fs.writeFileSync(
      path.join(TARGET_DIR, `${key || 'main'}.json`),
      JSON.stringify(textMap, null, 2)
    );
  }

  fs.writeFileSync(
    path.join(TARGET_DIR, `full.json`),
    JSON.stringify(fullTextMap, null, 2)
  );
}

function formatTo(value) {
  return value.replaceAll(/<shuzhi>(.*?)\<\/>/g, '**$1**');
}
