import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const DATA_PATH = path.join(__dirname, "..", "..", "_content", "final");
const OFFICIALLOC_PATH = path.join(
  __dirname,
  "..",
  "..",
  "OfficialLocalization"
);
const MapsDATA_PATH = path.join(__dirname, "..", "..", "maps");

const locales = ["en", "es", "de", "fr", "id", "ja", "pt", "th"];

export let allItemsMap = {};

export async function main() {
  for (const locale of locales) {
    const textMap = JSON.parse(
      fs.readFileSync(path.join(OFFICIALLOC_PATH, locale, `Game.json`))
    );
    const items = JSON.parse(
      fs.readFileSync(path.join(MapsDATA_PATH, `items.json`))
    );

    if (!allItemsMap[locale]) {
      allItemsMap[locale] = {};
    }

    console.log(`Getting items [${locale}]`);
    for await (const item of items) {
      console.log(`> Getting item [${locale}] ${item.id}`);
      const data = {
        _id: Object.values(allItemsMap[locale]).length + 1,
        id: item.id,
        name: textMap[""][item._locid + "1"],
        description: textMap[""][item._locid + "2"],
        usage: textMap[""][item._locid + "3"],
        rarity: item.rarity,
      };

      allItemsMap[locale][data.id] = data;

      fs.writeFileSync(
        path.join(DATA_PATH, locale, "items", data.id + ".json"),
        JSON.stringify(data, undefined, 2)
      );
    }

    fs.writeFileSync(
      path.join(DATA_PATH, locale, "items.json"),
      JSON.stringify(Object.values(allItemsMap[locale]), undefined, 2)
    );
  }
}
