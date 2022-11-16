import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

import dishes from '../../toweroffantasy.info/data/en-US/food/dishes.mjs';
import { slugify } from '../utils.mjs';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const DATA_PATH = path.join(__dirname, '..', '..', 'maps');
const MapsDATA_PATH = path.join(__dirname, '..', '..', 'maps');
const TEXTMAP_PATH = path.join(__dirname, '..', '..', 'EnTextMap', 'full.json');

export async function main(lang) {
  const textMap = JSON.parse(fs.readFileSync(TEXTMAP_PATH, 'utf8'));
  let map = [];
  for await (const dish of dishes) {
    // console.log(dish);

    // if (dish) {
    //   console.log(`Skipping ${character.name} because it's China only`);
    //   continue;
    // }

    // if (character.name !== 'Ruby') {
    //   continue;
    // }

    const _locid = textMap['.' + dish.name.toLowerCase()];

    if (!_locid) {
      console.log('Missing locid for', dish.name);
      continue;
    }

    map.push({
      _locid,
      id: slugify(dish.name),
      rarity: dish.rarity,
      stars: dish.stars,
      ingredients: dish.ingredients.map(ing => {
        let rName = ing.item.name;

        if (rName === 'Chili') {
          rName = 'Chilis';
        } else if (rName === "Darby's Sturgeon") {
          rName = `Dabry's sturgeon`;
        } else if (rName === "Rose Petals") {
          rName = `Rose Petal`;
        } else if (rName === "Ribs") {
          rName = `Rib`;
        } else if (rName === "Soybeans") {
          rName = `Soy`;
        }
        if (!textMap['.' + rName.toLowerCase()]) {
          console.log(chalk.bold.red('Missing ingredient'), rName, dish.name);
        }
        return {
          id: slugify(rName),
          name: textMap['.' + rName.toLowerCase()],
          amount: ing.amount,
          rarity: ing.item.rarity,
        };
      })
      // type: dish.,
    });
  }

  // console.log(map);
  const filePath = path.join(
    DATA_PATH,
    'food.json'
  );

  if (!fs.existsSync(path.dirname(filePath))) {
    fs.mkdirSync(path.dirname(filePath));
  }

  fs.writeFileSync(filePath, JSON.stringify(map, undefined, 2));
}
