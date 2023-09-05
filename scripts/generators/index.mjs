import fs from 'fs';
import path from 'path';
import { logger } from '../logger.mjs';
import { ENtextMap, GENERATED_PATH, MIN_PATH, getTextmap } from '../utils.mjs';

import { generateSimulacra } from './simulacras.mjs';
import { generateMatrices } from './matrices.mjs';

import dotenv from 'dotenv';
dotenv.config();

// const locales = ['en', 'es', 'de', 'fr', 'id', 'ja', 'pt', 'th', 'zh-CN', 'ru'];
const locales = ['en'];

async function main() {
  logger.info('Generating...', 'Is DEV: ', process.env.MYCUSTOM_DEV_ENV);
  if (process.env.MYCUSTOM_DEV_ENV === 'true') {
    for await (const locale of locales) {
      const textMap = await getTextmap(locale);
      // await generateSimulacra(textMap, locale, { ...ENtextMap });
      await generateMatrices(textMap, locale, { ...ENtextMap });
    }
  }

  // await generateBigFile();
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
