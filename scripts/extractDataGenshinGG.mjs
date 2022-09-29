// const asd = require("../_content/genshingg.js");
import asd from "../_content/genshingg.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const DATA_PATH = path.join(__dirname, "..", "_content", "data_gg");

function main() {
  const simulacras = asd["webpackJsonpgenshin-react"][0][1]["31"]();

  for (const simulacra of simulacras) {
    fs.writeFileSync(
      path.join(DATA_PATH, "simulacra", slugify(simulacra.name) + ".json"),
      JSON.stringify(
        { ...simulacra, id: slugify(simulacra.name) },
        undefined,
        2
      )
    );
  }


  const matrices = asd["webpackJsonpgenshin-react"][0][1]["48"]();

  for (const matrix of matrices) {
    fs.writeFileSync(
      path.join(DATA_PATH, "matrices", slugify(matrix.name) + ".json"),
      JSON.stringify(
        { ...matrix, id: slugify(matrix.name) },
        undefined,
        2
      )
    );
  }


  const gifts = asd["webpackJsonpgenshin-react"][0][1]["95"]();

  for (const gift of gifts) {
    fs.writeFileSync(
      path.join(DATA_PATH, "gifts", slugify(gift.name) + ".json"),
      JSON.stringify(
        { ...gift, id: slugify(gift.name) },
        undefined,
        2
      )
    );
  }

}

function slugify(value) {
  if (!value) return "";

  return value
    .toLowerCase()
    .replace(/\s/g, "_")
    .replace(/\W/g, "")
    .replace(/__+/g, "_");
}

main();
