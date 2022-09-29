export interface Gift {
  _id: number;
  id: string;
  name: string;
  description: string;
  rarity: string;
  value: number;
  favorite?: string[];
  characters: string[];
}
