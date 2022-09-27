/**
 *
 * @param {string} text
 * @returns string
 */
export function removeSimulacraName(text) {
  return text.replace(/.*・|.*: /g, "");
}

/**
 *
 * @param {string} value
 * @returns {string}
 */
export function slugify(value) {
  if (!value) return "";

  return value
    .toLowerCase()
    .replace(/\s/g, "_")
    .replace(/\W/g, "")
    .replace(/__+/g, "_");
}

/**
 *
 * @param {string} description
 * @param {number[]} values
 * @returns
 */
export function formatDescription(description, values = []) {
  // console.log(description, values);
  let newDesc = description;

  for (let index = 0; index < values.length; index++) {
    const value = values[index];
    newDesc = newDesc.replace(`{${index}}`, value);
  }

  return newDesc
    .replaceAll(/\r\n/g, "\n")
    .replaceAll("×", "x")
    .replaceAll(/<shuzhi>(.*?)\<\/>/g, "<b>$1</b>")
    .replaceAll(
      /<yellow_lbl_15_1>(.*?)\<\/>/g,
      `<span class="text-yellow">$1</span>`
    )
    .replaceAll(
      /<ComLblGreen>(.*?)\<\/>/g,
      `<span class="text-green">$1</span>`
    )
    .replaceAll(/<red>(.*?)\<\/>/g, `<span class="text-red">$1</span>`);
}
