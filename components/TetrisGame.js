"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameBoard from './GameBoard';
import ScoreBoard from './ScoreBoard';
import HoldDisplay from './HoldDisplay';
import NextDisplay from './NextDisplay';
import { 
  initializeGame, 
  moveTetrominoDown, 
  moveTetromino, 
  rotateTetromino, 
  hardDrop, 
  holdTetromino,
  calculateShadowPosition,
  getNextTetrominoes
} from '../lib/tetrisLogic';
import TetrisAI from '../lib/TetrisAI'; // Import TetrisAI

export default function TetrisGame() {
  const [gameState, setGameState] = useState(initializeGame());
  const [aiEnabled, setAiEnabled] = useState(false); // State to toggle AI
  const ai = useRef(new TetrisAI(gameState)); // Initialize AI with game state

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
      setGameState(prevState => {
        if (aiEnabled) {
          const bestMove = ai.current.findBestMove();
          if (bestMove) {
            const newState = applyAIMove(prevState, bestMove);
            ai.current.gameState = newState; // Update AI's game state
            return newState;
          }
        }
        return moveTetrominoDown(prevState);
      });
    }, 1000);

    return () => clearInterval(gameLoop);
  }, [aiEnabled]);

  const shadowY = calculateShadowPosition(gameState);
  const nextTetrominoes = getNextTetrominoes(gameState);

  console.log('Next Tetrominoes:', nextTetrominoes);

  return (
    <div className="flex flex-col items-center">
      <div className="flex">
        <HoldDisplay heldTetromino={gameState.heldTetromino} />
        <GameBoard gameState={gameState} shadowY={shadowY} />
        <NextDisplay nextPieces={nextTetrominoes} />
      </div>
      <ScoreBoard score={gameState.score} />

      <button
        onClick={() => setAiEnabled(!aiEnabled)}
        className="mt-2 p-2 bg-green-500 text-white rounded"
      >
        {aiEnabled ? 'Disable AI' : 'Enable AI'}
      </button>

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

function applyAIMove(gameState, move) {
  let newState = gameState;
  for (let i = 0; i < move.rotation; i++) {
    newState = rotateTetromino(newState);
  }
  newState = moveTetromino(newState, { x: move.x, y: 0 });
  return hardDrop(newState);
}