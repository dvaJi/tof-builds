type Bonus = {
  count: number;
  value: string;
};
type SetType = {
  name: string;
  desc: string;
};

export interface Matrix {
  _id: number;
  id: string;
  name: string;
  suitName: string;
  hash: string;
  rarity: string;
  bonus: Bonus[];
  mind: SetType;
  memory: SetType;
  belief: SetType;
  emotion: SetType;
}
