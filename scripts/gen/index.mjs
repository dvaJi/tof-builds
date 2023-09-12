import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { main as mainItems } from './generateItems.mjs';
import { main as mainMatrices } from './generateMatrices.mjs';
import { main as mainMounts } from './generateMounts.mjs';
import { main as mainSimulacra } from './generateSimulacra.mjs';
import { ENtextMap } from './texmap.mjs';
import { logger } from '../logger.mjs';

import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const GENERATED_PATH = path.join(__dirname, '..', '..', 'src', 'data');
const MIN_PATH = path.join(__dirname, '..', '..', 'src', 'min');

const OFFICIALLOC_PATH = path.join(
  __dirname,
  '..',
  '..',
  'OfficialLocalization'
);

const locales = ['en', 'es', 'de', 'fr', 'id', 'ja', 'pt', 'th', 'ru', 'zh-CN'];

async function main() {
  logger.info('Generating items...', process.env.MYCUSTOM_DEV_ENV);
  if (process.env.MYCUSTOM_DEV_ENV === 'true') {
    for (const locale of locales) {
      const textMap = JSON.parse(
        fs.readFileSync(path.join(OFFICIALLOC_PATH, locale, `Game.json`))
      );
      const lang = locale === 'zh-CN' ? 'cn' : locale;
      await mainItems(textMap, lang, { ...ENtextMap });
      await mainMatrices(textMap, lang, { ...ENtextMap });
      await mainSimulacra(textMap, lang, { ...ENtextMap });
      await mainMounts(textMap, lang, { ...ENtextMap });
    }
  }

  await generateBigFile();
}

async function generateBigFile() {
  const languages = fs.readdirSync(GENERATED_PATH);
  for (const lang of languages) {
    const folders = fs.readdirSync(path.join(GENERATED_PATH, lang));
    let data = {};
    for (const folder of folders) {
      if (!fs.existsSync(path.join(GENERATED_PATH, lang, folder))) continue;
      data[folder.replace('.json', '')] = [];

      if (folder.endsWith('.json')) {
        data[folder.replace('.json', '')].push(
          JSON.parse(fs.readFileSync(path.join(GENERATED_PATH, lang, folder)))
        );
        continue;
      }

      fs.readdirSync(`${GENERATED_PATH}/${lang}/${folder}`).forEach(
        (filename) => {
          if (!filename.endsWith('.json')) return;
          data[folder].push(
            JSON.parse(
              fs.readFileSync(path.join(GENERATED_PATH, lang, folder, filename))
            )
          );
        }
      );
    }

    const newFilePath = path.join(MIN_PATH, `data_${lang}.min.json`);

    if (!fs.existsSync(path.dirname(newFilePath))) {
      fs.mkdirSync(path.dirname(newFilePath));
    }

    fs.writeFileSync(newFilePath, JSON.stringify(data));
    logger.info(path.join(MIN_PATH), `data_${lang}.min.json`);
  }
}

main();
