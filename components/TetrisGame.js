"use client";

import React, { useState, useEffect, useCallback } from 'react';
import GameBoard from './GameBoard';
import ScoreBoard from './ScoreBoard';
import HoldDisplay from './HoldDisplay';
import NextDisplay from './NextDisplay';
import AITrainer from './AITrainer';
import LinesCleared from './LinesCleared';
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
import { AIPlayer } from '../lib/AIPlayer';

export default function TetrisGame() {
  const [gameState, setGameState] = useState(initializeGame());
  const [aiPlayer, setAiPlayer] = useState(new AIPlayer(5, 4, 1, 1));
  const [isAIPlaying, setIsAIPlaying] = useState(false);
  const [generation, setGeneration] = useState(1);
  const [bestScore, setBestScore] = useState(0);
  const [showAITrainer, setShowAITrainer] = useState(false);

  const handleKeyPress = useCallback((event) => {
    if (gameState.isGameOver || isAIPlaying) return;
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
  }, [gameState.isGameOver, isAIPlaying]);

  const restartGame = useCallback(() => {
    if (isAIPlaying) {
      // Update AI fitness before restarting
      aiPlayer.updateFitness(gameState.score, gameState.linesCleared);
      
      // Train AI here (simplified version)
      aiPlayer.mutate(0.1); // 10% mutation rate
      
      // Update best score
      if (gameState.score > bestScore) {
        setBestScore(gameState.score);
      }
      
      // Increment generation
      setGeneration(prev => prev + 1);
      
      // Reset AI player for next game
      aiPlayer.reset();
    }
    setGameState(initializeGame());
  }, [isAIPlaying, gameState.score, gameState.linesCleared, aiPlayer, bestScore]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  useEffect(() => {
    const gameLoop = setInterval(() => {
      if (!gameState.isGameOver) {
        if (isAIPlaying) {
          const aiMove = aiPlayer.calculateBestMove(gameState);
          if (aiMove) {
            setGameState(prevState => {
              let newState = prevState;
              if (aiMove.hold) {
                newState = holdTetromino(newState);
              } else {
                for (let i = 0; i < aiMove.rotation; i++) {
                  newState = rotateTetromino(newState);
                }
                newState = moveTetromino(newState, { x: aiMove.x - newState.currentPosition.x, y: 0 });
                newState = hardDrop(newState);
              }
              return newState;
            });
          }
        } else {
          setGameState(prevState => moveTetrominoDown(prevState));
        }
      } else if (isAIPlaying) {
        restartGame();
      }
    }, isAIPlaying ? 100 : 1000);

    return () => clearInterval(gameLoop);
  }, [gameState, isAIPlaying, aiPlayer, restartGame]);

  const toggleAIPlay = () => {
    setIsAIPlaying(!isAIPlaying);
    if (!isAIPlaying) {
      restartGame();
    }
  };

  const toggleAITrainer = () => {
    setShowAITrainer(!showAITrainer);
  };

  const shadowY = calculateShadowPosition(gameState);
  const nextTetrominoes = getNextTetrominoes(gameState);

  return (
    <div className="flex flex-col items-center">
      <div className="flex">
        <HoldDisplay heldTetromino={gameState.heldTetromino} />
        <GameBoard gameState={gameState} shadowY={shadowY} />
        <NextDisplay nextPieces={nextTetrominoes} />
      </div>
      <ScoreBoard score={gameState.score} />
      <LinesCleared linesCleared={gameState.linesCleared} />

      <div className="mt-4">
        <button
          onClick={toggleAIPlay}
          className="p-2 bg-green-500 text-white rounded mr-2"
        >
          {isAIPlaying ? "Disable AI" : "Enable AI"}
        </button>
        
      </div>

      <button
        onClick={toggleAITrainer}
        className="mt-2 p-2 bg-purple-500 text-white rounded"
      >
        {showAITrainer ? "Hide AI Trainer" : "Show AI Trainer"}
      </button>

      {showAITrainer && <AITrainer />}

      {gameState.isGameOver && !isAIPlaying && (
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