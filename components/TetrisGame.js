"use client";

import React, { useState, useEffect, useCallback } from 'react';
import GameBoard from './GameBoard';
import ScoreBoard from './ScoreBoard';
import HoldDisplay from './HoldDisplay';
import NextDisplay from './NextDisplay'; // Import NextDisplay component
import { 
  initializeGame, 
  moveTetrominoDown, 
  moveTetromino, 
  rotateTetromino, 
  hardDrop, 
  holdTetromino,
  calculateShadowPosition, // Import shadow logic
  getNextTetrominoes // Import getNextTetrominoes function
} from '../lib/tetrisLogic';

export default function TetrisGame() {
  const [gameState, setGameState] = useState(initializeGame());

  const handleKeyPress = useCallback((event) => {
    if (gameState.isGameOver) return;
    switch (event.key) {
      case 'ArrowLeft':
        setGameState(prevState => moveTetromino(prevState, { x: -1, y: 0 }));
        break;
      case 'ArrowRight':
        setGameState(prevState => moveTetromino(prevState, { x: 1, y: 0 }));
        break;
      case 'ArrowDown':
        setGameState(prevState => moveTetrominoDown(prevState));
        break;
      case 'ArrowUp':
        setGameState(prevState => rotateTetromino(prevState));
        break;
      case ' ':
        setGameState(prevState => hardDrop(prevState));
        break;
      case 'c':
        setGameState(prevState => holdTetromino(prevState));
        break;
    }
  }, [gameState.isGameOver]);

  const restartGame = () => {
    setGameState(initializeGame());
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  useEffect(() => {
    const gameLoop = setInterval(() => {
      setGameState(prevState => moveTetrominoDown(prevState));
    }, 1000);

    return () => clearInterval(gameLoop);
  }, []);

  const shadowY = calculateShadowPosition(gameState); // Calculate shadow position
  const nextTetrominoes = getNextTetrominoes(gameState); // Get next Tetrominoes

  console.log('Next Tetrominoes:', nextTetrominoes); // Log next Tetrominoes

  return (
    <div className="flex flex-col items-center">
      <div className="flex">
        <HoldDisplay heldTetromino={gameState.heldTetromino} />
        <GameBoard gameState={gameState} shadowY={shadowY} /> {/* Pass shadow position */}
        <NextDisplay nextPieces={nextTetrominoes} /> {/* Display next Tetrominoes */}
      </div>
      <ScoreBoard score={gameState.score} />

      {gameState.isGameOver && (
        <div className="text-center mt-4">
          <h2 className="text-2xl font-bold text-red-600">Game Over!</h2>
          <button
            onClick={restartGame}
            className="mt-2 p-2 bg-blue-500 text-white rounded"
          >
            Restart Game
          </button>
        </div>
      )}
    </div>
  );
}