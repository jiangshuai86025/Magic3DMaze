
import React, { useState, useEffect, useCallback } from 'react';
import { GameState, Difficulty, Character, MazeData, Position } from './types';
import { CHARACTERS, DIFFICULTY_CONFIG } from './constants';
import { generateMaze } from './utils/mazeGenerator';
import { audio } from './utils/audio';
import { getEncouragement } from './services/geminiService';
import GameScene from './components/Scene';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.EASY);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [maze, setMaze] = useState<MazeData | null>(null);
  const [score, setScore] = useState(0);
  const [movement, setMovement] = useState<{ x: number; z: number }>({ x: 0, z: 0 });
  const [victoryMsg, setVictoryMsg] = useState("");

  const startNewGame = useCallback((diff: Difficulty, char: Character) => {
    const config = DIFFICULTY_CONFIG[diff];
    const newMaze = generateMaze(config.size, config.size, config.coins);
    setMaze(newMaze);
    setScore(0);
    setGameState(GameState.PLAYING);
    setVictoryMsg("");
  }, []);

  const handleWin = async (finalScore: number) => {
    setScore(finalScore);
    setGameState(GameState.WON);
    audio.playWin();
    const msg = await getEncouragement(finalScore, difficulty);
    setVictoryMsg(msg);
  };

  // Input Handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== GameState.PLAYING) return;
      let dx = 0, dz = 0;
      switch (e.key) {
        case 'ArrowUp': case 'w': dz = -1; break;
        case 'ArrowDown': case 's': dz = 1; break;
        case 'ArrowLeft': case 'a': dx = -1; break;
        case 'ArrowRight': case 'd': dx = 1; break;
      }
      if (dx !== 0 || dz !== 0) {
        setMovement({ x: dx, z: dz });
        // Reset movement immediately so next key triggers again
        setTimeout(() => setMovement({ x: 0, z: 0 }), 50);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  const onTouchMove = (dx: number, dz: number) => {
    if (gameState !== GameState.PLAYING) return;
    setMovement({ x: dx, z: dz });
    setTimeout(() => setMovement({ x: 0, z: 0 }), 50);
  };

  return (
    <div className="relative w-full h-screen font-sans select-none overflow-hidden bg-sky-50">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-300 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-purple-300 rounded-full blur-3xl"></div>
      </div>

      {/* Game Scene */}
      {gameState === GameState.PLAYING && maze && selectedCharacter && (
        <>
          <div className="absolute inset-0 z-10">
            <GameScene 
              maze={maze} 
              character={selectedCharacter} 
              onWin={handleWin}
              movement={movement}
            />
          </div>

          {/* HUD */}
          <div className="absolute top-4 left-4 z-20 bg-white/80 backdrop-blur p-4 rounded-2xl shadow-xl flex items-center space-x-6">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-500 uppercase">得分</span>
              <span className="text-2xl font-black text-purple-600">{score}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-500 uppercase">难度</span>
              <span className="text-sm font-bold text-gray-700">{difficulty}</span>
            </div>
          </div>

          {/* Mobile Controls Overlay */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center md:hidden">
            <div className="grid grid-cols-3 gap-2">
              <div />
              <button 
                className="w-16 h-16 bg-white/50 rounded-2xl flex items-center justify-center shadow-lg active:scale-95 text-2xl"
                onPointerDown={() => onTouchMove(0, -1)}
              >⬆️</button>
              <div />
              <button 
                className="w-16 h-16 bg-white/50 rounded-2xl flex items-center justify-center shadow-lg active:scale-95 text-2xl"
                onPointerDown={() => onTouchMove(-1, 0)}
              >⬅️</button>
              <button 
                className="w-16 h-16 bg-white/50 rounded-2xl flex items-center justify-center shadow-lg active:scale-95 text-2xl"
                onPointerDown={() => onTouchMove(0, 1)}
              >⬇️</button>
              <button 
                className="w-16 h-16 bg-white/50 rounded-2xl flex items-center justify-center shadow-lg active:scale-95 text-2xl"
                onPointerDown={() => onTouchMove(1, 0)}
              >➡️</button>
            </div>
          </div>
        </>
      )}

      {/* Main Menu */}
      {gameState === GameState.MENU && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/10 backdrop-blur-sm p-6">
          <h1 className="text-6xl font-black text-purple-600 mb-8 drop-shadow-lg animate-bounce">
            3D 魔法迷宫
          </h1>
          <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full border-4 border-purple-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">选择难度</h2>
            <div className="flex flex-col gap-4">
              {Object.keys(DIFFICULTY_CONFIG).map((d) => (
                <button
                  key={d}
                  onClick={() => { setDifficulty(d as Difficulty); setGameState(GameState.CHARACTER_SELECT); }}
                  className={`py-4 px-6 rounded-2xl font-bold text-xl transition-all shadow-md
                    ${d === Difficulty.EASY ? 'bg-green-100 text-green-700 hover:bg-green-200' : 
                      d === Difficulty.MEDIUM ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 
                      'bg-red-100 text-red-700 hover:bg-red-200'}`}
                >
                  {d === Difficulty.EASY ? '简单 🌱' : d === Difficulty.MEDIUM ? '普通 🚀' : '困难 🔥'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Character Select */}
      {gameState === GameState.CHARACTER_SELECT && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/80 backdrop-blur p-6">
          <button 
            onClick={() => setGameState(GameState.MENU)}
            className="absolute top-6 left-6 text-gray-500 font-bold hover:text-purple-600"
          >
            ← 返回
          </button>
          <h2 className="text-4xl font-black text-gray-800 mb-10">选择你的冒险家</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {CHARACTERS.map((char) => (
              <button
                key={char.id}
                onClick={() => { setSelectedCharacter(char); startNewGame(difficulty, char); }}
                className="group flex flex-col items-center transition-transform hover:scale-110"
              >
                <div 
                  className="w-32 h-32 rounded-3xl shadow-xl border-8 border-white mb-4 flex items-center justify-center"
                  style={{ backgroundColor: char.color }}
                >
                  {/* Simplistic face emoji preview */}
                  <span className="text-5xl">{char.accessory === 'hat' ? '🎩' : char.accessory === 'glasses' ? '🕶️' : '😊'}</span>
                </div>
                <span className="font-bold text-gray-700">{char.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Victory Screen */}
      {gameState === GameState.WON && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-purple-600/90 backdrop-blur-md p-6 animate-in fade-in duration-500">
          <div className="bg-white p-10 rounded-3xl shadow-2xl text-center max-w-sm border-8 border-yellow-400">
            <span className="text-8xl mb-6 block">🏆</span>
            <h2 className="text-3xl font-black text-gray-800 mb-2">太棒了!</h2>
            <p className="text-xl text-purple-600 font-bold mb-4">{victoryMsg || "正在获取AI鼓励..."}</p>
            <div className="bg-purple-50 p-4 rounded-xl mb-6">
              <span className="text-gray-500 font-bold block mb-1">你的得分</span>
              <span className="text-4xl font-black text-purple-700">{score}</span>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => startNewGame(difficulty, selectedCharacter!)}
                className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold text-lg hover:bg-purple-700 shadow-lg"
              >
                再玩一次
              </button>
              <button
                onClick={() => setGameState(GameState.MENU)}
                className="w-full py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold text-lg hover:bg-gray-200"
              >
                返回菜单
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
