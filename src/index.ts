import type { Character } from './types/character';
import type { Gift } from './types/gift';
import type { Matrix } from './types/matrix';
import type { Team, TeamFull } from './types/team';

export type { Character, Gift, Matrix, Team, TeamFull };

export const languages = [
  'en',
  'es',
  'de',
  'fr',
  'id',
  'ja',
  'pt',
  'ru',
  'th',
  'cn'
] as const;

export type Languages = typeof languages[number];

type Folders = 'simulacra' | 'gifts' | 'items' | 'matrices' | 'teams';

export interface Options {
  language: Languages;
}

export interface QueryOpts<T> {
  select?: (keyof T)[];
}

export default class GenshinData {
  options: Options = {
    language: 'en',
  };

  constructor(opts?: Options) {
    if (opts) {
      this.options = { ...this.options, ...opts };
    }
  }

  setOptions(opts: Options) {
    this.options = { ...this.options, ...opts };
  }

  getOptions(): Options {
    return this.options;
  }

  getLang(): Languages {
    return this.options.language;
  }

  async characters(query?: QueryOpts<Character>): Promise<Character[]> {
    const lang = this.getLang();
    return await this.findByFolder(lang, 'simulacra', query);
  }

  async characterbyId(
    id: string,
    query?: QueryOpts<Character>
  ): Promise<Character | undefined> {
    const lang = this.getLang();
    return await this.findById(lang, 'simulacra', id, query);
  }

  async matrices(query?: QueryOpts<Matrix>): Promise<Matrix[]> {
    const lang = this.getLang();
    return await this.findByFolder(lang, 'matrices', query);
  }

  async matrixbyId(
    id: string,
    query?: QueryOpts<Matrix>
  ): Promise<Matrix | undefined> {
    const lang = this.getLang();
    return await this.findById(lang, 'matrices', id, query);
  }

  async gifts(query?: QueryOpts<Gift>): Promise<Gift[]> {
    const lang = this.getLang();
    return await this.findByFolder(lang, 'gifts', query);
  }

  async getFavoriteGiftByCharacterId(
    id: string,
    query?: QueryOpts<Gift>
  ): Promise<Gift[]> {
    const gifts = await this.gifts(query);
    return gifts.filter((gift) => gift.favorite?.includes(id));
  }

  async getGiftsByCharacterId(
    id: string,
    query?: QueryOpts<Gift>
  ): Promise<Gift[]> {
    const gifts = await this.gifts(query);
    return gifts.filter((gift) => gift.characters.includes(id));
  }

  async getTeams(query?: QueryOpts<Team>): Promise<Team[]> {
    const lang = this.getLang();
    return await this.findByFolder(lang, 'teams', query);
  }

  async getTeamsByCharacterId(
    id: string,
    query?: QueryOpts<Team>
  ): Promise<Team[]> {
    const teams = await this.getTeams(query);
    return teams.filter((team) =>
      team.characters.find((character) => character.id === id)
    );
  }

  private async findByFolder<T>(
    lang: Languages,
    folder: Folders,
    query?: QueryOpts<T>
  ): Promise<T[]> {
    let results = (await import(`./min/data_${lang}.min.json`)).default[folder];

    if (query) {
      results = this.selectProps(results, query);
    }

    return results;
  }

  private async findById<T>(
    lang: Languages,
    folder: Folders,
    id: unknown,
    query?: QueryOpts<T>
  ): Promise<T | undefined> {
    const results = await this.findByFolder(lang, folder, query);

    return results.find((r: T) => r['id' as keyof T] === id);
  }

  private selectProps<T>(results: T[], query: QueryOpts<T>): T[] {
    if (query.select) {
      return results.map((result) => {
        const obj: Partial<T> = {};
        query.select?.forEach((key) => {
          obj[key] = result[key];
        });

        return obj as T;
      });
    }

    return results;
  }
}
