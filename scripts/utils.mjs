import { logger } from './logger.mjs';
import { distance } from 'fastest-levenshtein';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

export const GENERATED_PATH = path.join(__dirname, '..', 'src', 'data');
export const MIN_PATH = path.join(__dirname, '..', 'src', 'min');
export const OFFICIALLOC_PATH = path.join(
  __dirname,
  '..',
  'OfficialLocalization'
);
export const CurveTable = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'maps', 'CurveTable.json'))
);

export const ENtextMap =
  process.env.MYCUSTOM_DEV_ENV === 'true'
    ? JSON.parse(
        fs.readFileSync(path.join(OFFICIALLOC_PATH, 'en', `Game.json`))
      )
    : {};

export const _ENtextMap = JSON.parse(
  fs.readFileSync(path.join(OFFICIALLOC_PATH, 'en', `Game.json`))
);

export const getTofData = async (fileId) => {
  return fs.readJSON(
    path.join(__dirname, '..', 'ToF-Data', 'DB', `${fileId}.json`)
  );
};

export const getTextmap = async (locale) => {
  return fs.readJSON(path.join(OFFICIALLOC_PATH, locale, `Game.json`));
};

/**
 *
 * @param {string} map is the path of the table. eg: CurveTable'Sword_Phy_SSR_EffectFigure'
 * @param {string[]} st contains the values of the table. eg: ['Buff_Matrix_SSR_6_level1','Buff_Matrix_SSR_6_level2_1','Buff_Matrix_SSR_6_level3_1','Buff_Matrix_SSR_6_level4_1']
 * @returns
 */
export const parseCurve = (map, st) => {
  if (!map) return 0;
  if (!st) return 0;
  const table = map.split("'")[1];
  const xcurve = CurveTable.find((c) => c.Name === table);

  if (!xcurve) {
    logger.error(`Missing curve table for ${table}`);
    return 0;
  }

  let values = [];
  for (const s of st) {
    const row = xcurve.Rows[s];
    if (!row) {
      logger.error(`Missing row for ${s}`);
      continue;
    }
    if (!Number.isInteger(row.Keys[0].Value)) {
      const roundedValue = row.Keys[0].Value * 100;
      const fixedValue = roundedValue.toFixed(roundedValue % 1 === 0 ? 0 : 2);
      values.push(parseFloat(fixedValue));
    } else {
      values.push(row.Keys[0].Value);
    }
  }

  return values;
};

/**
 *
 * @param {string} text
 * @returns string
 */
export function removeSimulacraName(text) {
  if (!text) return '';
  return text.replace(/.*・|.*: /g, '');
}

/**
 *
 * @param {string} value
 * @returns {string}
 */
export function slugify(value) {
  if (!value) return '';

  return value
    .toLowerCase()
    .replace(/\s/g, '_')
    .replace(/\W/g, '')
    .replace(/__+/g, '_');
}

/**
 *
 * @param {string} description
 * @param {number[]} values
 * @returns
 */
export function formatDescription(description, values = []) {
  if (!description) return '';
  // console.log(description, values);
  let newDesc = description;

  for (let index = 0; index < values.length; index++) {
    const value = values[index];
    newDesc = newDesc.replaceAll(`{${index}}`, value);
  }

  return newDesc
    .replaceAll(/\r\n/g, '\n')
    .replaceAll('×', 'x')
    .replaceAll(/<shuzhi>(.*?)<\/>/g, '<b>$1</b>')
    .replaceAll(
      /<yellow_lbl_15_1>(.*?)<\/>/g,
      `<span class="text-yellow">$1</span>`
    )
    .replaceAll(/<ComLblGreen>(.*?)<\/>/g, `<span class="text-green">$1</span>`)
    .replaceAll(/<red>(.*?)<\/>/g, `<span class="text-red">$1</span>`);
}

/**
 *
 * @param {Record<string, Record<string, string>>} tmap
 * @param {string} firstKey
 * @param {string[]} keys
 * @param {boolean} showError
 * @returns string
 */
export function safeGetTmap(tmap, firstKey, keys, showError = true) {
  let finalText = '';

  const firstKeyOS = firstKey + '_OS';
  const firstKeyOverseas = firstKey + '_Oversea';
  const allKeys = Object.keys(tmap);

  if (!Array.isArray(keys)) keys = [keys];

  // Loop through the keys and check for matching values
  for (const key of keys) {
    const keyOverseas = key + '_OS';
    if (tmap[firstKey][keyOverseas]) {
      // Check for key with '_OS' suffix
      finalText = tmap[firstKey][keyOverseas];
      return finalText;
    } else if (tmap[firstKeyOS] && tmap[firstKeyOS][key]) {
      // Check for key in firstKeyOS object
      finalText = tmap[firstKeyOS][key];
      return finalText;
    } else if (tmap[firstKeyOverseas] && tmap[firstKeyOverseas][key]) {
      // Check for key in firstKeyOverseas object
      finalText = tmap[firstKeyOverseas][key];
      return finalText;
    } else if (tmap[firstKey][key]) {
      // Check for original specific text
      finalText = tmap[firstKey][key];
      return finalText;
    } else {
      const findInAllKeys = allKeys.find((k) => tmap[k][key]);
      if (findInAllKeys) {
        // Fallback to other key
        if (showError)
          logger.warn(
            `Missing text for [${firstKey}][${key}], using [${findInAllKeys}][${key}]`
          );
        finalText = tmap[findInAllKeys][key];
        return finalText;
      } else if (ENtextMap[firstKey] && ENtextMap[firstKey][key]) {
        // Fallback to English text
        if (showError)
          logger.warn(
            `Missing text for [${firstKey}][${key}], using English text`
          );
        finalText = ENtextMap[firstKey][key];
        return finalText;
      } else {
        // // Fallback to empty text
        // if (showError) {
        //   logger.error(
        //     `Missing text for [${firstKey}][${key}], using empty text`
        //   );
        //   // console.log('You might want ', closest(key, keys))
        //   // const keyList = Object.keys(tmap[firstKey] || {});
        //   // keyList.forEach((k) => {
        //   //   if (distance(key, k) <= 1) {
        //   //     console.log(key, k, distance(key, k));
        //   //   }
        //   // });
        // }
      }
    }
  }

  return finalText;
}

export async function saveFile(data, ...paths) {
  const newFilePath = path.join(GENERATED_PATH, ...paths);

  if (!fs.existsSync(path.dirname(newFilePath))) {
    fs.mkdirSync(path.dirname(newFilePath));
  }

  fs.writeFileSync(newFilePath, JSON.stringify(data, null, 2));
  logger.info(path.join(GENERATED_PATH), ...paths);
}
