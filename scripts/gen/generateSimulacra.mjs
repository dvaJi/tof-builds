import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { allItemsMap } from "./generateItems.mjs";

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

export async function main() {
  const allCharacterByLocale = {};
  for (const locale of locales) {
    const allCharacters = [];
    const textMap = JSON.parse(
      fs.readFileSync(path.join(OFFICIALLOC_PATH, locale, `Game.json`))
    );
    const simulacras = JSON.parse(
      fs.readFileSync(path.join(MapsDATA_PATH, `simulacra.json`))
    );

    console.log(`Getting simulacra [${locale}]`);
    for await (const simulacra of simulacras) {
      console.log(`> Getting simulacra [${locale}] ${simulacra.id}`);
      const data = {
        _id: allCharacters.length + 1,
        id: simulacra.id,
        name:
          textMap["ST_"][simulacra._locid + "_EN"] ??
          textMap["ST_"][simulacra._locid + "_CN"] ??
          textMap[""][simulacra._name],
        weapon: textMap["ST_"][simulacra._locid + "_chenghao"],
        weapon_id: slugify(simulacra.weapon),
        birthday: textMap["ST_"][simulacra._locid + "_birthday"],
        birthplace: textMap["ST_"][simulacra._locid + "_zhenying"],
        gender: textMap["ST_"][simulacra._locid + "_xingbie"],
        info: formatDescription(textMap["ST_"][simulacra._locid + "_xingge"]),
        description: formatDescription(
          textMap["ST_"][simulacra._locid + "_jibenxinxi"]
        ),
        like: formatDescription(textMap["ST_"][simulacra._locid + "_like"]),
        dislike: formatDescription(
          textMap["ST_"][simulacra._locid + "_dislike"]
        ),
        element: simulacra.element,
        rarity: simulacra.rarity,
        role: simulacra.role,
        resonance: textMap[""]["artifact_sr_002_type"],
        shatter: simulacra.shatter,
        charge: simulacra.charge,
        skills: simulacra.skills.map((skill) => ({
          name: formatDescription(textMap[""][skill.name] ? textMap[""][skill.name] : ''), // FIXME: THIS SHOULD FALLBACK TO ENGLISH
          type: skill.type,
          description: formatDescription(
            textMap[""][skill.description],
            skill.values
          ),
        })),
        weapon_type: {
          name: textMap[""][simulacra.weapon_type.name],
          description: formatDescription(
            textMap[""][simulacra.weapon_type.description],
            simulacra.weapon_type.values
          ),
        },
        weapon_resonance: simulacra.weapon_resonance
          ? {
              name: textMap[""][simulacra.weapon_resonance.name],
              description: formatDescription(
                textMap[""][simulacra.weapon_resonance.description],
                simulacra.weapon_resonance.values
              ),
            }
          : undefined,
        advancement: simulacra.advancement.map((advancement) =>
          formatDescription(textMap[""][advancement])
        ),
        traits: simulacra.traits.map((trait) => ({
          ...trait,
          name: textMap[""][trait.name],
          description: formatDescription(
            textMap[""][trait.description + "_OS"] ??
              textMap[""][trait.description]
          ),
        })),
        ascension: simulacra.ascension.map((ascension) => {
          const mat1Id = ascension.mat1.id ?? ascension.mat1.name;
          const mat2Id = ascension.mat2?.id ?? ascension.mat2?.name;
          const mat3Id = ascension.mat3?.id ?? ascension.mat3?.name;

          if (!allItemsMap[locale][mat1Id]) {
            console.log(`Mat ${mat1Id} not found`);
          }

          return {
            ascension: Number(ascension.ascension),
            level: Number(ascension.level),
            cost: Number(ascension.cost),
            mat1: {
              id: mat1Id,
              name: allItemsMap[locale][mat1Id].name,
              rarity: allItemsMap[locale][mat1Id].rarity,
              amount: Number(ascension.mat1.amount),
            },
            mat2: ascension.mat2
              ? {
                  id: mat2Id,
                  name: allItemsMap[locale][mat2Id].name,
                  rarity: allItemsMap[locale][mat2Id].rarity,
                  amount: Number(ascension.mat2.amount),
                }
              : undefined,
            mat3: ascension.mat3
              ? {
                  id: mat3Id,
                  name: allItemsMap[locale][mat3Id].name,
                  rarity: allItemsMap[locale][mat3Id].rarity,
                  amount: Number(ascension.mat3.amount),
                }
              : undefined,
          };
        }),
      };

      fs.writeFileSync(
        path.join(DATA_PATH, locale, "simulacra", data.id + ".json"),
        JSON.stringify(data, undefined, 2)
      );
      allCharacters.push(data);
    }
    fs.writeFileSync(
      path.join(DATA_PATH, locale, "simulacra.json"),
      JSON.stringify(allCharacters, undefined, 2)
    );

    allCharacterByLocale[locale] = allCharacters;
  }

  fs.writeFileSync(
    path.join(DATA_PATH, "simulacra_final.json"),
    JSON.stringify(allCharacterByLocale)
  );
}

/**
 *
 * @param {string} description
 * @param {number[]} values
 * @returns
 */
function formatDescription(description, values = []) {
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

function slugify(value) {
  if (!value) return "";

  return value
    .toLowerCase()
    .replace(/\s/g, "_")
    .replace(/\W/g, "")
    .replace(/__+/g, "_");
}
