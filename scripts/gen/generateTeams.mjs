import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { formatDescription } from '../utils.mjs';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const DATA_PATH = path.join(__dirname, '..', '..', 'src', 'data');
const GGDATA_PATH = path.join(__dirname, '..', '..', '_content', 'data_gg');

const compMap = {
  balance: 'weaponoccupation1_name',
  benediction: 'weaponoccupation4_name',
  attack: 'weaponoccupation3_name',
  fortitude: 'weaponoccupation2_name',
};

export async function main(textMap, locale) {
  const allTeams = JSON.parse(
    fs.readFileSync(path.join(GGDATA_PATH, `teams.json`))
  );

  console.log(`Getting teams [${locale}]`);
  for await (const team of allTeams) {
    console.log(`> Getting team [${locale}] ${team.id}`);
    const data = {
      id: team.id,
      characters: team.characters,
      comp: textMap[''][compMap[team.comp]],
      mode: team.mode,
    };

    const filePath = path.join(DATA_PATH, locale, 'teams', data.id + '.json');

    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath));
    }

    fs.writeFileSync(filePath, JSON.stringify(data, undefined, 2));
  }
}
