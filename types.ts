
export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export interface Character {
  id: string;
  name: string;
  color: string;
  accessory: 'hat' | 'glasses' | 'ribbon' | 'none';
}

export enum GameState {
  MENU = 'MENU',
  CHARACTER_SELECT = 'CHARACTER_SELECT',
  PLAYING = 'PLAYING',
  WON = 'WON'
}

export interface Position {
  x: number;
  z: number;
}

export interface MazeData {
  grid: number[][]; // 1 for wall, 0 for path
  width: number;
  height: number;
  start: Position;
  end: Position;
  coins: Position[];
}
