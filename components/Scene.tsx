
import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, PerspectiveCamera, OrbitControls, Float, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Character, MazeData, Position } from '../types';
import { CELL_SIZE, WALL_HEIGHT } from '../constants';
import { audio } from '../utils/audio';

interface SceneProps {
  maze: MazeData;
  character: Character;
  onWin: (score: number) => void;
  movement: { x: number; z: number };
}

const Player: React.FC<{ 
  pos: Position; 
  character: Character; 
  targetPos: Position;
}> = ({ pos, character, targetPos }) => {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.lerp(new THREE.Vector3(targetPos.x * CELL_SIZE, 0.5, targetPos.z * CELL_SIZE), 0.2);
      // Small bounce animation
      meshRef.current.position.y = 0.5 + Math.sin(Date.now() * 0.01) * 0.1;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Body */}
      <mesh castShadow>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color={character.color} />
      </mesh>
      {/* Head/Eyes */}
      <mesh position={[0, 0.5, 0.3]}>
        <boxGeometry args={[0.6, 0.3, 0.1]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[0.15, 0.5, 0.36]}>
        <sphereGeometry args={[0.05]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh position={[-0.15, 0.5, 0.36]}>
        <sphereGeometry args={[0.05]} />
        <meshStandardMaterial color="black" />
      </mesh>
      
      {/* Accessory */}
      {character.accessory === 'hat' && (
        <mesh position={[0, 0.6, 0]}>
          <coneGeometry args={[0.4, 0.6, 16]} />
          <meshStandardMaterial color="red" />
        </mesh>
      )}
      {character.accessory === 'glasses' && (
        <group position={[0, 0.5, 0.36]}>
          <mesh position={[0.15, 0, 0]}>
            <ringGeometry args={[0.08, 0.12, 16]} />
            <meshStandardMaterial color="black" />
          </mesh>
          <mesh position={[-0.15, 0, 0]}>
            <ringGeometry args={[0.08, 0.12, 16]} />
            <meshStandardMaterial color="black" />
          </mesh>
        </group>
      )}
    </group>
  );
};

const Maze: React.FC<{ maze: MazeData }> = ({ maze }) => {
  const walls = [];
  for (let z = 0; z < maze.height; z++) {
    for (let x = 0; x < maze.width; x++) {
      if (maze.grid[z][x] === 1) {
        walls.push(
          <mesh key={`${x}-${z}`} position={[x * CELL_SIZE, WALL_HEIGHT / 2, z * CELL_SIZE]} receiveShadow castShadow>
            <boxGeometry args={[CELL_SIZE, WALL_HEIGHT, CELL_SIZE]} />
            <meshStandardMaterial color="#8b5cf6" roughness={0.3} metalness={0.2} />
          </mesh>
        );
      }
    }
  }

  return (
    <group>
      {walls}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[(maze.width * CELL_SIZE) / 2 - CELL_SIZE / 2, -0.1, (maze.height * CELL_SIZE) / 2 - CELL_SIZE / 2]} receiveShadow>
        <planeGeometry args={[maze.width * CELL_SIZE, maze.height * CELL_SIZE]} />
        <meshStandardMaterial color="#ddd6fe" />
      </mesh>
    </group>
  );
};

const Coin: React.FC<{ pos: Position; onCollect: () => void }> = ({ pos, onCollect }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [collected, setCollected] = useState(false);

  useFrame((state) => {
    if (meshRef.current && !collected) {
      meshRef.current.rotation.y += 0.05;
      meshRef.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  if (collected) return null;

  return (
    <mesh 
      ref={meshRef} 
      position={[pos.x * CELL_SIZE, 0.5, pos.z * CELL_SIZE]}
      onClick={(e) => { e.stopPropagation(); setCollected(true); onCollect(); }}
    >
      <cylinderGeometry args={[0.3, 0.3, 0.1, 16]} rotation={[Math.PI / 2, 0, 0]} />
      <meshStandardMaterial color="gold" metalness={0.8} roughness={0.2} />
    </mesh>
  );
};

const GameScene: React.FC<SceneProps> = ({ maze, character, onWin, movement }) => {
  const [playerPos, setPlayerPos] = useState<Position>(maze.start);
  const [score, setScore] = useState(0);
  const [collectedCoins, setCollectedCoins] = useState<Set<string>>(new Set());

  // Handle movement
  useEffect(() => {
    if (movement.x === 0 && movement.z === 0) return;

    const nextX = playerPos.x + movement.x;
    const nextZ = playerPos.z + movement.z;

    if (
      nextX >= 0 && nextX < maze.width &&
      nextZ >= 0 && nextZ < maze.height &&
      maze.grid[nextZ][nextX] === 0
    ) {
      setPlayerPos({ x: nextX, z: nextZ });
      audio.playStep();

      // Check coin collection
      const coinKey = `${nextX}-${nextZ}`;
      if (maze.coins.find(c => c.x === nextX && c.z === nextZ) && !collectedCoins.has(coinKey)) {
        setCollectedCoins(prev => new Set(prev).add(coinKey));
        setScore(s => s + 10);
        audio.playCollect();
      }

      // Check win
      if (nextX === maze.end.x && nextZ === maze.end.z) {
        onWin(score + 50); // Finish bonus
      }
    }
  }, [movement]);

  return (
    <Canvas shadows>
      <PerspectiveCamera makeDefault position={[maze.start.x * CELL_SIZE, 10, maze.start.z * CELL_SIZE + 10]} fov={50} />
      <OrbitControls 
        target={[playerPos.x * CELL_SIZE, 0, playerPos.z * CELL_SIZE]} 
        enablePan={false}
        maxPolarAngle={Math.PI / 2.1}
      />
      
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
      <directionalLight 
        position={[5, 10, 5]} 
        intensity={1} 
        castShadow 
        shadow-camera-left={-20} 
        shadow-camera-right={20} 
        shadow-camera-top={20} 
        shadow-camera-bottom={-20} 
      />

      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <Maze maze={maze} />
      
      <Player pos={maze.start} character={character} targetPos={playerPos} />

      {maze.coins.map((coin, i) => (
        !collectedCoins.has(`${coin.x}-${coin.z}`) && (
          <Coin key={i} pos={coin} onCollect={() => {}} />
        )
      ))}

      {/* Exit portal/marker */}
      <mesh position={[maze.end.x * CELL_SIZE, 0.1, maze.end.z * CELL_SIZE]}>
        <cylinderGeometry args={[0.8, 0.8, 0.2, 32]} />
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.5} />
      </mesh>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <Text
          position={[maze.end.x * CELL_SIZE, 2, maze.end.z * CELL_SIZE]}
          fontSize={0.5}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          出口
        </Text>
      </Float>

      <fog attach="fog" args={['#f0f9ff', 10, 50]} />
    </Canvas>
  );
};

export default GameScene;
