import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { main as mainItems } from "./generateItems.mjs";
import { main as mainMatrices } from "./generateMatrices.mjs";
import { main as mainMounts } from "./generateMounts.mjs";
import { main as mainSimulacra } from "./generateSimulacra.mjs";
import { main as mainGifts } from "./generateGifts.mjs";

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
    mounts: {},
    gifts: {},
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
    const mounts = await mainMounts(textMap, locale, ENtextMap);
    const gifts = await mainGifts(textMap, locale, ENtextMap);
    await generateBigFile(items, "items", locale);
    await generateBigFile(matrices, "matrices", locale);
    await generateBigFile(simulacra, "simulacra", locale);
    await generateBigFile(mounts, "mounts", locale);
    await generateBigFile(gifts, "gifts", locale);

    bigMap["items"][locale] = items;
    bigMap["matrices"][locale] = matrices;
    bigMap["simulacra"][locale] = simulacra;
    bigMap["mounts"][locale] = mounts;
    bigMap["gifts"][locale] = gifts;
  }

  await generateBigChunkyFile(bigMap.items, "items");
  await generateBigChunkyFile(bigMap.matrices, "matrices");
  await generateBigChunkyFile(bigMap.simulacra, "simulacra");
  await generateBigChunkyFile(bigMap.mounts, "mounts");
  await generateBigChunkyFile(bigMap.gifts, "gifts");
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
