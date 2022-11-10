import { main as reverseTextMap } from './reverseTextMap.mjs';
import { main as simulacraMain } from './simulacra.mjs';

import util from 'util';

util.inspect.defaultOptions.depth = null;

async function main() {
  // reverseTextMap();
  await simulacraMain();
}

main();
