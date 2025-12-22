
import { MazeData, Position } from '../types';

export const generateMaze = (width: number, height: number, coinCount: number): MazeData => {
  // Ensure odd dimensions for grid-based maze
  const w = width % 2 === 0 ? width + 1 : width;
  const h = height % 2 === 0 ? height + 1 : height;
  
  const grid: number[][] = Array(h).fill(null).map(() => Array(w).fill(1));

  const walk = (x: number, y: number) => {
    grid[y][x] = 0;
    const dirs = [
      [0, 2], [0, -2], [2, 0], [-2, 0]
    ].sort(() => Math.random() - 0.5);

    for (const [dx, dy] of dirs) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx > 0 && nx < w && ny > 0 && ny < h && grid[ny][nx] === 1) {
        grid[y + dy / 2][x + dx / 2] = 0;
        walk(nx, ny);
      }
    }
  };

  walk(1, 1);

  const start: Position = { x: 1, z: 1 };
  const end: Position = { x: w - 2, z: h - 2 };
  grid[end.z][end.x] = 0; // Ensure end is path

  // Place coins randomly on paths
  const coins: Position[] = [];
  let attempts = 0;
  while (coins.length < coinCount && attempts < 100) {
    const rx = Math.floor(Math.random() * (w - 2)) + 1;
    const rz = Math.floor(Math.random() * (h - 2)) + 1;
    if (grid[rz][rx] === 0 && !(rx === start.x && rz === start.z) && !(rx === end.x && rz === end.z)) {
      if (!coins.find(c => c.x === rx && c.z === rz)) {
        coins.push({ x: rx, z: rz });
      }
    }
    attempts++;
  }

  return { grid, width: w, height: h, start, end, coins };
};
