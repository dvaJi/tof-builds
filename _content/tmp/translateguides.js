const fs = require("fs");
const path = require("path");
const googletranslate = require("google-translate-api-x");

const guidesPath = path.join(__dirname, "..", "..", "_content", "guides");

const GUIDE_SLUG = "spiralabyss-v2-8";
const FIXED_VALUES = ["Spiral Abyss", "Genshin Impact"];

async function main() {
  const guide = require(path.join(guidesPath, GUIDE_SLUG + ".json"));

  const titles = Object.entries(guide.title); // [["en", "Anemoculus locations"], ["de", "Anemokolonien"]]
  const descriptions = Object.entries(guide.description); // [["en", "Anemoculus locations"], ["de", "Anemokolonien"]]

  const translate = async (locale, englishLocale) => {
    let toTranslate = englishLocale;
    for (const value of FIXED_VALUES) {
      toTranslate = toTranslate.replace(
        value,
        officialLocale[value] ? officialLocale[value][locale] : `[${value}]`
      );
    }
    const res = await googletranslate(toTranslate, {
      to: correctLocaleMap[locale] ? correctLocaleMap[locale] : locale,
    });
    return res.text;
  };

  // translate titles
  for await (const [locale, desc] of titles) {
    if (desc) {
      continue;
    }

    guide.title[locale] = await translate(locale, guide.title.en);
  }

  // translate descriptions
  for await (const [locale, desc] of descriptions) {
    if (desc) {
      continue;
    }

    guide.description[locale] = await translate(locale, guide.description.en);
  }

  console.log(JSON.stringify(guide, null, 2));
}

const correctLocaleMap = {
  "zh-tw": "zh-TW",
};

const officialLocale = {
  "Genshin Impact": {
    en: "Genshin Impact",
    es: "Genshin Impact",
    de: "Genshin Impact",
    fr: "Genshin Impact",
    id: "Genshin Impact",
    ja: "原神(げんしん)",
    ko: "원신",
    pt: "Genshin Impact",
    ru: "Genshin Impact",
    th: "Genshin Impact",
    vi: "Genshin Impact",
    "zh-tw": "原神",
  },
};

main();
