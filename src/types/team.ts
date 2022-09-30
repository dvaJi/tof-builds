import { Character } from './character';

type CharacterTeam = {
  id: string;
  role?: string;
};

export interface Team {
  id: number;
  characters: CharacterTeam[];
  comp: string;
  mode: string;
}

export interface TeamFull extends Team {
  characters: Character[];
}
