import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  formatDescription,
  removeSimulacraName,
  safeGetTmap,
} from '../utils.mjs';
import { logger } from '../logger.mjs';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const DATA_PATH = path.join(__dirname, '..', '..', 'src', 'data');
const MapsDATA_PATH = path.join(__dirname, '..', '..', 'maps');

export let allMatricesMap = {};

export async function main(textMap, locale) {
  allMatricesMap = {};
  const matrices = JSON.parse(
    fs.readFileSync(path.join(MapsDATA_PATH, `matrices.json`))
  );

  logger.info(`Getting matrix [${locale}]`);
  for await (const item of matrices) {
    logger.debug(`> Getting matrix [${locale}] ${item.id}`);
    const data = {
      _id: Object.values(allMatricesMap).length + 1,
      id: item.id,
      name:
        safeGetTmap(textMap, 'QRSLCommon_ST', item.name, false) ||
        safeGetTmap(textMap, 'ST_Item', item.name),
      suitName: safeGetTmap(textMap, 'ST_Item', item.suitName),
      hash: item.hash || item._id,
      rarity: item.rarity,
      bonus: item.bonus.map((b) => ({
        ...b,
        value:
          b.value.length === 2
            ? formatDescription(
                safeGetTmap(textMap, 'ST_Item', b.value[0]),
                b.value[1]
              )
            : formatDescription(safeGetTmap(textMap, 'ST_Item', b.value)),
      })),
      mind: {
        name: removeSimulacraName(
          safeGetTmap(textMap, 'ST_Item', `matrix_${item._id}_1`)
        ),
        desc: formatDescription(
          safeGetTmap(textMap, 'ST_Item', `matrix_${item._id}_1_1`)
        ),
      },
      memory: {
        name: removeSimulacraName(
          safeGetTmap(textMap, 'ST_Item', `matrix_${item._id}_2`)
        ),
        desc: formatDescription(
          safeGetTmap(textMap, 'ST_Item', `matrix_${item._id}_2_1`)
        ),
      },
      belief: {
        name: removeSimulacraName(
          safeGetTmap(textMap, 'ST_Item', `matrix_${item._id}_3`)
        ),
        desc: formatDescription(
          safeGetTmap(textMap, 'ST_Item', `matrix_${item._id}_3_1`)
        ),
      },
      emotion: {
        name: removeSimulacraName(
          safeGetTmap(textMap, 'ST_Item', `matrix_${item._id}_4`)
        ),
        desc: formatDescription(
          safeGetTmap(textMap, 'ST_Item', `matrix_${item._id}_4_1`)
        ),
      },
    };

    allMatricesMap[data.id] = data;

    const filePath = path.join(
      DATA_PATH,
      locale,
      'matrices',
      data.id + '.json'
    );

    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath));
    }

    fs.writeFileSync(filePath, JSON.stringify(data, undefined, 2));
  }
}
