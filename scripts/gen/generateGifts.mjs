import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { slugify } from "../utils.mjs";
import { allSimulacraMap } from "./generateSimulacra.mjs";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const DATA_PATH = path.join(__dirname, "..", "..", "src", "data");
const MapsDATA_PATH = path.join(__dirname, "..", "..", "maps");
const GENSHINGG_PATH = path.join(__dirname, "..", "..", "_content", "data_gg");

export let allItemsMap = {};

export async function main(textMap, locale, ENtextMap) {
  allItemsMap = {};
  const giftPath = path.join(GENSHINGG_PATH, "gifts");
  const giftFiles = fs.readdirSync(giftPath);

  console.log(`Getting gifts [${locale}]`);
  giftFiles.forEach((file) => {
    const json = JSON.parse(fs.readFileSync(path.join(giftPath, file), "utf8"));

    const found = Object.entries(ENtextMap[""]).find(([key, value]) => {
      return value.toLowerCase() === json.name.toLowerCase();
    });

    if (!found) {
      console.log("not found", json.name);
      return;
    }

    const data = {
      _id: Object.values(allItemsMap).length + 1,
      id: json.id,
      name: textMap[""][found[0]],
      description: textMap[""][found[0] + "_1"],
      rarity: json.rarity,
      value: json.value,
      favorite: json.favorite?.map((c) =>
        slugify(c).replace("bai_ling", "bailing")
      ),
      characters: json.characters.map((c) =>
        slugify(c).replace("bai_ling", "bailing")
      ),
    };

    allItemsMap[data.id] = data;

    const filePath = path.join(DATA_PATH, locale, "gifts", data.id + ".json");

    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath));
    }

    fs.writeFileSync(path.join(filePath), JSON.stringify(data, undefined, 2));
  });
}
