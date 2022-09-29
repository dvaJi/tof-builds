import { Character } from './types/character';
import { Gift } from './types/gift';
import { Matrix } from './types/matrix';

export const languages = [
  'en',
  'es',
  'de',
  'fr',
  'id',
  'ja',
  'pt',
  'th',
] as const;

export type Languages = typeof languages[number];

type Folders = 'simulacra' | 'gifts' | 'items' | 'matrices';

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

  async matrices(query?: QueryOpts<Matrix>): Promise<Matrix[]> {
    const lang = this.getLang();
    return await this.findByFolder(lang, 'matrices', query);
  }

  async gifts(query?: QueryOpts<Gift>): Promise<Gift[]> {
    const lang = this.getLang();
    return await this.findByFolder(lang, 'gifts', query);
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

  private selectProps<T>(results: T[], query: QueryOpts<T>): T[] {
    if (query.select) {
      return results.map((result) => {
        let obj: Partial<T> = {};
        query.select?.forEach((key) => {
          obj[key] = result[key];
        });

        return obj as T;
      });
    }

    return results;
  }
}
