import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { CHARACTERS } from '../../toweroffantasy.info/data/en-US/characters/characterList.mjs';
import { slugify } from '../utils.mjs';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const DATA_PATH = path.join(__dirname, '..', '..', 'src', 'data');
const MapsDATA_PATH = path.join(__dirname, '..', '..', 'maps');
const TEXTMAP_PATH = path.join(__dirname, '..', '..', 'EnTextMap', 'full.json');

export async function main(lang) {
  const textMap = JSON.parse(fs.readFileSync(TEXTMAP_PATH, 'utf8'));
  let map = [];
  for await (const character of CHARACTERS) {
    if (character.name === 'Coco Ritter') {
      character.name = 'Cocoritter';
    }

    if (character.chinaOnly) {
      console.log(`Skipping ${character.name} because it's China only`);
      continue;
    }

    // if (character.name !== 'Ruby') {
    //   continue;
    // }

    const _locid =
      textMap['st_.' + character.name.toLowerCase()] ||
      textMap['.' + character.name.toLowerCase()];

    if (!_locid) {
      console.log('Missing locid for', character.name);
      continue;
    }

    const weaponName =
      textMap['.' + character.weapon.name.toLowerCase() + '_'] ||
      textMap['.' + character.weapon.name.toLowerCase()];

    const simplename = slugify(character.name).replace('_', '');

    map.push({
      _locid,
      id: slugify(character.name),
      weapon: character.weapon.name,
      element: character.weapon.element,
      rarity: character.rarity,
      role: character.weapon.type,
      // resonance: simulacra.resonance,
      // shatter: simulacra.shatter,
      // charge: simulacra.charge,
      skills: Object.values(character.weapon.abilities)
        .flatMap((skills) => skills)
        .map((skill) => {
          const _locid = textMap['.' + skill.name.toLowerCase()];
          if (!_locid) {
            console.log('Missing skill name for', skill.name, character.name);
          }
          return {
            name: _locid,
            type: skill.input,
            description: _locid?.replace('_name', '_des'),
          };
        }),
      weapon_type: {
        name: weaponName,
        type: character.weapon.type,
        description: weaponName?.replace('_0', '_desc_0'),
      },
      advancement: Object.values(character.weapon.advancement).map(
        (a) => textMap['.' + a.toLowerCase()]
      ),
      traits: [
        {
          name: `buff_${simplename}_level1_name`,
          description: `buff_${simplename}_level1`,
        },
        {
          name: `buff_${simplename}_level2_name`,
          description: `buff_${simplename}_level2`,
        },
      ],
      // ascension: [
      //   {
      //     ascension: '1',
      //     level: '10',
      //     cost: '250',
      //     mat1: {
      //       name: 'rockcore',
      //       rarity: 'N',
      //       amount: '1',
      //     },
      //   },
      //   {
      //     ascension: '2',
      //     level: '20',
      //     cost: '500',
      //     mat1: {
      //       name: 'rockcore',
      //       rarity: 'N',
      //       amount: '2',
      //     },
      //   },
      //   {
      //     ascension: '3',
      //     level: '30',
      //     cost: '750',
      //     mat1: {
      //       name: 'rockcore',
      //       rarity: 'N',
      //       amount: '2',
      //     },
      //     mat2: {
      //       name: 'acidproof_glaze_i',
      //       rarity: 'R',
      //       amount: '2',
      //     },
      //   },
      //   {
      //     ascension: '4',
      //     level: '40',
      //     cost: '1000',
      //     mat1: {
      //       name: 'rockcore',
      //       rarity: 'N',
      //       amount: '2',
      //     },
      //     mat2: {
      //       name: 'acidproof_glaze_i',
      //       rarity: 'R',
      //       amount: '3',
      //     },
      //     mat3: {
      //       name: 'nanofiber_frame_i',
      //       rarity: 'SR',
      //       amount: '2',
      //     },
      //   },
      // ],
    });
  }

  console.log(map);
}
