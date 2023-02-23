import { ENtextMap } from './gen/texmap.mjs';
import { logger } from './logger.mjs';

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

export function safeGetTmap(tmap, firstKey, key, showError = true) {
  let finalText = '';

  const firstKeyOS = firstKey + '_OS';
  const firstKeyOverseas = firstKey + '_Oversea';
  const keyOverseas = key + '_OS';
  // console.log(firstKey, key, firstKeyOverseas, keyOverseas)

  if (tmap[firstKey][keyOverseas]) {
    finalText = tmap[firstKey][keyOverseas];
  } else if (tmap[firstKeyOS] && tmap[firstKeyOS][key]) {
    finalText = tmap[firstKeyOS][key];
  } else if (tmap[firstKeyOverseas] && tmap[firstKeyOverseas][key]) {
    finalText = tmap[firstKeyOverseas][key];
  } else if (tmap[firstKey][key]) {
    // Original specific text
    finalText = tmap[firstKey][key];
  } else if (ENtextMap[firstKey][key]) {
    // Fallback to English text
    if (showError)
      logger.warn(`Missing text for [${firstKey}][${key}], using English text`);
    finalText = ENtextMap[firstKey][key];
  } else {
    // Fallback to empty text
    if (showError)
      logger.error(`Missing text for [${firstKey}][${key}], using empty text`);
  }

  return finalText;
}
