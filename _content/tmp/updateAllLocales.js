const fs = require("fs");
const path = require("path");

function main() {
  const locales = getLocales();

  const missingsObj = {};

  for (const locale of locales) {
    missingsObj[locale.locale] = {};

    const json = locale.data;
    const template = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "..", "..", "locales", "en.json"),
        "utf8"
      )
    );

    for (const pageKey in template) {
      const page = template[pageKey];
      missingsObj[locale.locale][pageKey] = {};

      for (const valueKey in page) {
        if (!json[pageKey] || !json[pageKey][valueKey]) {
          if (!json[pageKey]) {
            json[pageKey] = {};
          }
          json[pageKey][valueKey] = '';
          // console.log(locale.locale, valueKey);
          missingsObj[locale.locale][pageKey][valueKey] = page[valueKey];
        }
      }
    }

    fs.writeFileSync(
      path.join(__dirname, "..", "..", "locales", locale.locale + ".json"),
      JSON.stringify(json, null, 2) + '\n'
    );

    // console.log(locale.locale, jsonTemplate);
  }
  // console.log(missingsObj)
  fs.writeFileSync(
    path.join(__dirname, "missings_locale.json"),
    JSON.stringify(missingsObj, null, 2)
  );
  printSummary(missingsObj);
}

function getLocales() {
  const locales = [
    "de",
    "es",
    "fr",
    "id",
    "ja",
    "ko",
    "pt",
    "ru",
    "th",
    "vi",
    "zh-tw",
  ];

  return locales.map((locale) => {
    const data = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "..", "..", "locales", locale + ".json"),
        "utf8"
      )
    );
    return {
      locale,
      data,
    };
  });
}

function printSummary(obj) {
  const locales = Object.keys(obj);
  const summary = {};

  for (const locale of locales) {
    summary[locale] = {};
    const localeObj = obj[locale];

    for (const pageKey in localeObj) {
      if (Object.keys(localeObj[pageKey]).length > 0)
        summary[locale][pageKey] = Object.keys(localeObj[pageKey]).length;
    }
  }

  console.log(JSON.stringify(summary, null, 2));
}

main();
