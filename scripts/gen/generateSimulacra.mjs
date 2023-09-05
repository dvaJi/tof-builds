import fs from 'fs-extra';
import path from 'path';
import { red } from 'colorette';
import { fileURLToPath } from 'url';
import {
  removeSimulacraName,
  formatDescription,
  slugify,
  safeGetTmap,
} from '../utils.mjs';
import { allItemsMap } from './generateItems.mjs';

import { logger } from '../logger.mjs';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const DATA_PATH = path.join(__dirname, '..', '..', 'src', 'data');
const MapsDATA_PATH = path.join(__dirname, '..', '..', 'maps');

export let allSimulacraMap = {};

export async function main(textMap, locale) {
  allSimulacraMap = {};
  const allCharacters = [];
  const simulacrasDir = await fs.readdir(
    path.join(MapsDATA_PATH, 'simulacras')
  );
  const simulacras = simulacrasDir.map(async (file) =>
    JSON.parse(
      await fs.readFile(path.join(MapsDATA_PATH, 'simulacras', file), 'utf8')
    )
  );

  logger.info(`Getting simulacra [${locale}]`);
  for await (const simulacra of simulacras) {
    logger.debug(`> Getting simulacra [${locale}] ${simulacra.id}`);

    const data = {
      _id: simulacra._id || allCharacters.length + 1,
      id: simulacra.id,
      name:
        textMap['ST_Imitationtest'][simulacra._locid + '_EN'] ??
        textMap['ST_Imitationtest'][simulacra._locid + '_CN'] ??
        textMap['QRSLCommon_ST'][simulacra._name],
      weapon: textMap['ST_Imitationtest'][simulacra._locid + '_chenghao'],
      weapon_id: slugify(simulacra.weapon),
      birthday: textMap['ST_Imitationtest'][simulacra._locid + '_birthday'],
      birthplace: textMap['ST_Imitationtest'][simulacra._locid + '_zhenying'],
      gender: textMap['ST_Imitationtest'][simulacra._locid + '_xingbie'],
      info: formatDescription(
        safeGetTmap(textMap, 'ST_Imitationtest', simulacra._locid + '_xingge')
      ),
      description: formatDescription(
        safeGetTmap(
          textMap,
          'ST_Imitationtest',
          simulacra._locid + '_jibenxinxi'
        )
      ),
      like: formatDescription(
        safeGetTmap(textMap, 'ST_Imitationtest', simulacra._locid + '_like')
      ),
      dislike: formatDescription(
        safeGetTmap(textMap, 'ST_Imitationtest', simulacra._locid + '_dislike')
      ),
      element: simulacra.element,
      rarity: simulacra.rarity,
      role: simulacra.role,
      resonance: simulacra.resonance,
      shatter: simulacra.shatter,
      charge: simulacra.charge,
      skills: simulacra.skills.map((skill) => ({
        name: formatDescription(safeGetTmap(textMap, 'SkillDes', skill.name)),
        type: skill.type,
        description: formatDescription(
          safeGetTmap(textMap, 'SkillDes', skill.description),
          skill.values
        ),
      })),
      weapon_type: {
        name: safeGetTmap(textMap, 'QRSLCommon_ST', simulacra.weapon_type.name),
        description: formatDescription(
          safeGetTmap(
            textMap,
            'QRSLCommon_ST',
            simulacra.weapon_type.description
          ),
          simulacra.weapon_type.values
        ),
      },
      weapon_resonance: simulacra.weapon_resonance
        ? {
            name: safeGetTmap(
              textMap,
              'BuffDes',
              simulacra.weapon_resonance.name
            ),
            description: formatDescription(
              safeGetTmap(
                textMap,
                'BuffDes',
                simulacra.weapon_resonance.description
              ),
              simulacra.weapon_resonance.values
            ),
          }
        : undefined,
      advancement: simulacra.advancement.map((advancement) =>
        advancement.length === 2
          ? formatDescription(
              safeGetTmap(textMap, 'BuffDes', advancement[0]),
              advancement[1]
            )
          : formatDescription(safeGetTmap(textMap, 'BuffDes', advancement))
      ),
      traits: simulacra.traits.map((trait) => ({
        ...trait,
        name: removeSimulacraName(textMap['BuffDes'][trait.name]),
        description: formatDescription(
          safeGetTmap(textMap, 'BuffDes', trait.description)
        ),
      })),
      ascension: simulacra.ascension.map((ascension) => {
        const mat1Id = ascension.mat1.id ?? ascension.mat1.name;
        const mat2Id = ascension.mat2?.id ?? ascension.mat2?.name;
        const mat3Id = ascension.mat3?.id ?? ascension.mat3?.name;

        if (!allItemsMap[mat1Id]) {
          console.log(red(`Mat ${mat1Id} not found`));
        }
        if (mat2Id && !allItemsMap[mat2Id]) {
          console.log(red(`Mat ${mat2Id} not found`));
        }
        if (mat3Id && !allItemsMap[mat3Id]) {
          console.log(red(`Mat ${mat3Id} not found`));
        }

        return {
          ascension: Number(ascension.ascension),
          level: Number(ascension.level),
          cost: Number(ascension.cost),
          mat1: {
            id: mat1Id,
            name: allItemsMap[mat1Id].name,
            rarity: allItemsMap[mat1Id].rarity,
            amount: Number(ascension.mat1.amount),
          },
          mat2: ascension.mat2
            ? {
                id: mat2Id,
                name: allItemsMap[mat2Id].name,
                rarity: allItemsMap[mat2Id].rarity,
                amount: Number(ascension.mat2.amount),
              }
            : undefined,
          mat3: ascension.mat3
            ? {
                id: mat3Id,
                name: allItemsMap[mat3Id].name,
                rarity: allItemsMap[mat3Id].rarity,
                amount: Number(ascension.mat3.amount),
              }
            : undefined,
        };
      }),
    };

    allSimulacraMap[data.id] = data;

    const filePath = path.join(
      DATA_PATH,
      locale,
      'simulacra',
      data.id + '.json'
    );

    if (!(await fs.exists(path.dirname(filePath)))) {
      await fs.mkdir(path.dirname(filePath));
    }

    await fs.writeFile(filePath, JSON.stringify(data, undefined, 2));
    allCharacters.push(data);
  }
}
