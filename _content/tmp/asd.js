const fs = require("fs");
const path = require("path");

function main() {
  const locales = getLocales();

  for (const locale of locales) {
    const json = locale.data;
    const template = JSON.parse(
      fs.readFileSync(path.join(__dirname, "locales", "en.json"), "utf8")
    );
    const jsonTemplate = { ...template };

    for (const pageKey in jsonTemplate) {
      const page = jsonTemplate[pageKey];

      for (const valueKey in page) {
        if (valueKey === "title" || valueKey === "description") {
          switch (pageKey) {
            case "layout":
            case "ascension_planner":
              page["title"] = json[`title`];
              page["description"] = json[`title.description`];
              break;
            case "character":
              page["title"] = json[`title.character.detail`];
              break;
            case "weapon":
              page["title"] = json[`title.weapon.detail`];
              break;
            default:
              page["title"] = json[`title.${pageKey}`];
              page["description"] = json[`title.${pageKey}.description`];
              break;
          }
        } else {
          page[valueKey] = json[valueKey];
        }
      }
    }

    console.log(locale.locale, jsonTemplate);
    fs.writeFileSync(
      "locales/" + locale.locale + ".json",
      JSON.stringify(jsonTemplate, null, 2)
    );
  }
}

function getLocales() {
  const locales = [
    "de",
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
      fs.readFileSync(path.join(__dirname, "locales", locale + ".json"), "utf8")
    );
    return {
      locale,
      data,
    };
  });
}

main();
