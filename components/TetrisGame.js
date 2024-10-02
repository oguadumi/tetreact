"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameBoard from './GameBoard';
import ScoreBoard from './ScoreBoard';
import HoldDisplay from './HoldDisplay';
import NextDisplay from './NextDisplay';
import AIStats from './AIStats';
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
  const [generation, setGeneration] = useState(0); // State for generation
  const [mutationRate, setMutationRate] = useState(0.01); // State for mutation rate
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
    const newGameState = initializeGame();
    setGameState(newGameState);
    ai.current.gameState = newGameState; // Reset AI's game state
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
    }, 100);  //increase game speed

    return () => clearInterval(gameLoop);
  }, [aiEnabled]);

  useEffect(() => {
    if (aiEnabled) {
      ai.current.train(1000, () => {
        setGeneration(prev => prev + 1); // Increment generation
        setMutationRate(prev => prev * 0.995); // Decay mutation rate
        restartGame(); // Restart the game after each training episode
      });
    }
  }, [aiEnabled]);

  useEffect(() => {
    if (aiEnabled && gameState.isGameOver) {
      restartGame(); // Automatically restart the game when AI is enabled and game is over
    }
  }, [aiEnabled, gameState.isGameOver]);

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
      <AIStats generation={generation} mutationRate={mutationRate} /> {/* Add AIStats component */}

      <button
        onClick={() => setAiEnabled(!aiEnabled)}
        className="mt-2 p-2 bg-green-500 text-white rounded"
      >
        {aiEnabled ? 'Disable AI' : 'Enable AI'}
      </button>

      {gameState.isGameOver && !aiEnabled && (
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