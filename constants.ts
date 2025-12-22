
import { Character, Difficulty } from './types';

export const CHARACTERS: Character[] = [
  { id: '1', name: 'Sunny Bunny', color: '#fbbf24', accessory: 'hat' },
  { id: '2', name: 'Cool Cat', color: '#60a5fa', accessory: 'glasses' },
  { id: '3', name: 'Pinky Panda', color: '#f472b6', accessory: 'ribbon' },
  { id: '4', name: 'Grumpy Gator', color: '#4ade80', accessory: 'none' },
];

export const DIFFICULTY_CONFIG = {
  [Difficulty.EASY]: { size: 9, coins: 5, multiplier: 1 },
  [Difficulty.MEDIUM]: { size: 15, coins: 10, multiplier: 2 },
  [Difficulty.HARD]: { size: 21, coins: 15, multiplier: 3 },
};

export const WALL_HEIGHT = 1.5;
export const CELL_SIZE = 2;
