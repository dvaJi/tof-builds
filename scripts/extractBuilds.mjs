// extract every builds from toweroffantasy.info-main\data\en-US\characters\ssr directory and save them in a json file under _content as builds.json

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ssrPath = path.join(
  __dirname,
  '..',
  'toweroffantasy.info-main',
  'data',
  'en-US',
  'characters',
  'ssr'
);

const builds = [];

fs.readdirSync(ssrPath).forEach(async (file) => {
  const name = file.split('.')[0];
  const data = await import(`../toweroffantasy.info-main/data/en-US/characters/ssr/${file}`);
  const build = data.builds.map((build) => {
    return build.weapon.recommendedMatrices;
  });
  builds.push({ name, build });
});

fs.writeFileSync(
  path.join(__dirname, '..', '_content', 'builds.json'),
  JSON.stringify(builds)
);
