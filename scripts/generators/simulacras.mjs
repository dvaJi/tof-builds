import { logger } from '../logger.mjs';
import { getTofData, slugify } from '../utils.mjs';

export async function generateSimulacra(textMap, locale, ENtextMap) {
  logger.info('Simulacra...', locale);

  const _weaponsData = await getTofData('weapons');
  const _simulacrasData = await getTofData('simulacra');
  const _advancementData = await getTofData('advancement');
  const _imitationsData = await getTofData('imitations');
  const _itemsData = await getTofData('advancement');

  for await (const [_weaponKey, _weaponData] of Object.entries(_weaponsData)) {
    // logger.info('Simulacra...', _weaponKey);
    if (_weaponKey !== 'Chainsaw_physic') {
      // console.log (_weaponKey);
      continue;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, _simulacraData] = Object.entries(_simulacrasData).find(
      ([key]) => key === _weaponKey
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [__, _imitationData] = Object.values(_imitationsData).find(
      (d) => d.weapon === _weaponKey
    );

    console.log(_simulacraData, _weaponData, _imitationData);
    const newData = {
      id: slugify(_imitationData.name),
      name: _imitationData.name,
    };

    console.log(newData);
  }
}
