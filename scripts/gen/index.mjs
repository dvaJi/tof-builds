import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { main as mainItems } from './generateItems.mjs';
import { main as mainMatrices } from './generateMatrices.mjs';
import { main as mainMounts } from './generateMounts.mjs';
import { main as mainSimulacra } from './generateSimulacra.mjs';
import { main as mainGifts } from './generateGifts.mjs';
import { main as mainTeams } from './generateTeams.mjs';

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

const locales = ['en', 'es', 'de', 'fr', 'id', 'ja', 'pt', 'th'];

async function main() {
  if (process.env.DEV_ENV) {
    const ENtextMap = JSON.parse(
      fs.readFileSync(path.join(OFFICIALLOC_PATH, 'en', `Game.json`))
    );
    for (const locale of locales) {
      const textMap = JSON.parse(
        fs.readFileSync(path.join(OFFICIALLOC_PATH, locale, `Game.json`))
      );
      await mainItems(textMap, locale, ENtextMap);
      await mainMatrices(textMap, locale, ENtextMap);
      await mainSimulacra(textMap, locale, ENtextMap);
      await mainMounts(textMap, locale, ENtextMap);
      await mainGifts(textMap, locale, ENtextMap);
      await mainTeams(textMap, locale, ENtextMap);
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
    console.log(path.join(MIN_PATH), `data_${lang}.min.json`);
  }
}

main();
