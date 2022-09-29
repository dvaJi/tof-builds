import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const DATA_PATH = path.join(__dirname, '..', '..', 'src', 'data');
const MapsDATA_PATH = path.join(__dirname, '..', '..', 'maps');

export let allItemsMap = {};

export async function main(textMap, locale) {
  allItemsMap = {};
  const items = JSON.parse(
    fs.readFileSync(path.join(MapsDATA_PATH, `items.json`))
  );

  console.log(`Getting items [${locale}]`);
  for await (const item of items) {
    console.log(`> Getting item [${locale}] ${item.id}`);
    const data = {
      _id: Object.values(allItemsMap).length + 1,
      id: item.id,
      name: textMap[''][item._locid + '1'],
      description: textMap[''][item._locid + '2'],
      usage: textMap[''][item._locid + '3'],
      rarity: item.rarity,
    };

    allItemsMap[data.id] = data;

    const filePath = path.join(DATA_PATH, locale, 'items', data.id + '.json');

    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath));
    }

    fs.writeFileSync(filePath, JSON.stringify(data, undefined, 2));
  }
}
