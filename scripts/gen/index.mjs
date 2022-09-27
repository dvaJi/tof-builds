import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { main as mainItems } from "./generateItems.mjs";
import { main as mainMatrices } from "./generateMatrices.mjs";
import { main as mainSimulacra } from "./generateSimulacra.mjs";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const OFFICIALLOC_PATH = path.join(
  __dirname,
  "..",
  "..",
  "OfficialLocalization"
);

const locales = ["en", "es", "de", "fr", "id", "ja", "pt", "th"];

async function main() {
  let bigMap = {
    items: {},
    matrices: {},
    simulacra: {},
  };
  const ENtextMap = JSON.parse(
    fs.readFileSync(path.join(OFFICIALLOC_PATH, "en", `Game.json`))
  );
  for (const locale of locales) {
    const textMap = JSON.parse(
      fs.readFileSync(path.join(OFFICIALLOC_PATH, locale, `Game.json`))
    );
    const items = await mainItems(textMap, locale, ENtextMap);
    const matrices = await mainMatrices(textMap, locale, ENtextMap);
    const simulacra = await mainSimulacra(textMap, locale, ENtextMap);
    await generateBigFile(items, "items", locale);
    await generateBigFile(matrices, "matrices", locale);
    await generateBigFile(simulacra, "simulacra", locale);

    bigMap["items"][locale] = items;
    bigMap["matrices"][locale] = matrices;
    bigMap["simulacra"][locale] = simulacra;
  }

  await generateBigChunkyFile(bigMap.items, "items");
  await generateBigChunkyFile(bigMap.matrices, "matrices");
  await generateBigChunkyFile(bigMap.simulacra, "simulacra");
}

async function generateBigFile(data, name, locale) {
  fs.writeFileSync(
    path.join(
      __dirname,
      "..",
      "..",
      "_content",
      "final",
      locale,
      name + ".json"
    ),
    JSON.stringify(data, undefined, 2)
  );
}

async function generateBigChunkyFile(data, name) {
  fs.writeFileSync(
    path.join(__dirname, "..", "..", "_content", "final", name + "_final.json"),
    JSON.stringify(data)
  );
}

main();
