import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const OFFICIALLOC_PATH = path.join(
  __dirname,
  '..',
  '..',
  'OfficialLocalization'
);

export const ENtextMap = JSON.parse(
  fs.readFileSync(path.join(OFFICIALLOC_PATH, 'en', `Game.json`))
);
