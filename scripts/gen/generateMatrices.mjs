import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { removeSimulacraName } from "../utils.mjs";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const DATA_PATH = path.join(__dirname, "..", "..", "_content", "final");
const MapsDATA_PATH = path.join(__dirname, "..", "..", "maps");

export let allMatricesMap = {};

export async function main(textMap, locale) {
  const matrices = JSON.parse(
    fs.readFileSync(path.join(MapsDATA_PATH, `matrices.json`))
  );

  console.log(`Getting items [${locale}]`);
  for await (const item of matrices) {
    console.log(`> Getting item [${locale}] ${item.id}`);
    const data = {
      _id: Object.values(allMatricesMap).length + 1,
      id: item.id,
      name: textMap[""][item.name],
      suitName: textMap[""][item.suitName],
      hash: item.hash || item._id,
      rarity: item.rarity,
      bonus: item.bonus.map((b) => ({ ...b, value: textMap[""][b.value] })),
      mind: {
        name: removeSimulacraName(textMap[""][`matrix_${item._id}_1`]),
        desc: textMap[""][`matrix_${item._id}_1_1`],
      },
      memory: {
        name: removeSimulacraName(textMap[""][`matrix_${item._id}_2`]),
        desc: textMap[""][`matrix_${item._id}_2_1`],
      },
      belief: {
        name: removeSimulacraName(textMap[""][`matrix_${item._id}_3`]),
        desc: textMap[""][`matrix_${item._id}_3_1`],
      },
      emotion: {
        name: removeSimulacraName(textMap[""][`matrix_${item._id}_4`]),
        desc: textMap[""][`matrix_${item._id}_4_1`],
      },
    };

    allMatricesMap[data.id] = data;

    const filePath = path.join(
      DATA_PATH,
      locale,
      "matrices",
      data.id + ".json"
    );

    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath));
    }

    fs.writeFileSync(filePath, JSON.stringify(data, undefined, 2));
  }

  return Object.values(allMatricesMap);
}
