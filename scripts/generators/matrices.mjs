import { logger } from '../logger.mjs';
import {
  formatDescription,
  getTofData,
  parseCurve,
  safeGetTmap,
  saveFile,
  slugify,
} from '../utils.mjs';

export async function generateMatrices(textMap, locale, ENtextMap) {
  logger.info('Simulacra...', locale);

  const _othersData = [
    {
      id: 'matrix_N1',
      suitId: 'suit_N1',
      name: 'Wandering Aberrant',
      rarity: 'N',
    },
  ];
  const _otherssuitData = [
    {
      id: 'suit_N1',
      threepc: 'Buff_Matrix_N_1',
      numberstr: [],
      i: 0,
    },
  ]
    .flatMap((v) => {
      return Array(3)
        .fill(0)
        .map((_, i) => ({
          ...v,
          id: `${v.id}_${i + 1}`,
          i: i + 1,
        }));
    })
    .sort((a, b) => {
      return a.i - b.i;
    })
    .sort((a, b) => {
      return a.i - b.i;
    });

  const _suitsData = {
    ...(await getTofData('matrices_suit')),
    ..._otherssuitData,
  };
  const _matricesData = {
    ...(await getTofData('matrices')),
    ..._othersData,
  };

  for await (const _matrixData of Object.values(_matricesData)) {
    // logger.info('Simulacra...', _weaponKey);
    if (_matrixData.id !== 'matrix_N1') {
      // console.log (_weaponKey);
      continue;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _suits = Object.values(_suitsData).filter((v) =>
      v.id.startsWith(_matrixData.suitId)
    );

    const hash = _matrixData.suitId.split('_')[1];
    const rarity = _matrixData.rarity;
    let rarityNum = 0;
    switch (rarity) {
      case 'N':
        rarityNum = 10000;
        break;
      case 'R':
        rarityNum = 20000;
        break;
      case 'SR':
        rarityNum = 30000;
        break;
      case 'SSR':
        rarityNum = 40000;
        break;
      default:
        rarityNum = 0;
    }
    const _id = Number(hash.match(/\d+/g)[0]) + rarityNum;

    console.log({_matrixData, _suits});
    const _suitData = _suits[0];

    const suitsFmtd = _suits.map((s, i) => {
      const _id = s.id.replace('suit_', '');
      const num = Number(_id.split('_')[1]);
      const id = _id.replace(`_${num}`, `_${num + 1}`);
      console.log(
        i,
        id,
        `matrix_${id}`,
        safeGetTmap(textMap, 'ST_Item', `matrix_${id}`)
      );
      return {
        name: safeGetTmap(textMap, 'ST_Item', `matrix_${id}`),
        desc: formatDescription(
          safeGetTmap(textMap, 'ST_Item', `matrix_${id}_1`),
          [0]
        ),
      };
    });
    const pieces = suitsFmtd.reduce((acc, cur, i) => {
      const map = {
        0: 'mind',
        1: 'memory',
        2: 'belief',
        3: 'emotion',
      };
      const splitName = cur.name?.split(/・|:|·/);
      acc[map[i]] = {
        ...cur,
        name: splitName.length > 1 ? splitName[1]?.trim() : cur.name,
      };

      return acc;
    }, {});

    const name = suitsFmtd[0].name?.split(/・|:|·/)[0].trim();
    const bonus = [];

    if (_suitData.twopc) {
      const values = parseCurve(_suitData.numbermap, _suitData.numberst);
      bonus.push({
        count: 2,
        value: formatDescription(_suitData.twopc, values),
      });
    }
    if (_suitData.threepc) {
      const values = parseCurve(_suitData.numbermap, _suitData.numberstr);
      bonus.push({
        count: 2,
        value: formatDescription(_suitData.threepc, values),
      });
    }
    if (_suitData.fourpc) {
      const values = parseCurve(_suitData.numbermap, _suitData.numbersf);
      bonus.push({
        count: 4,
        value: formatDescription(_suitData.fourpc, values),
      });
    }

    const newData = {
      _id,
      id: slugify(_matrixData.name),
      name,
      suitName: safeGetTmap(textMap, 'ST_Item', [
        `MatrixSuit_${hash}_SuitName`,
        `Matrix_${hash}_Suitname`,
      ]),
      hash,
      rarity,
      bonus,
      ...pieces,
    };

    await saveFile(newData, locale, 'matrices', `${newData.id}.json`);
  }
}
