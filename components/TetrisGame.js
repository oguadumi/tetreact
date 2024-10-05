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


const ControlsModal = ({ onClose }) => (
  <div 
    className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50"
    onClick={onClose} // Close modal when background is clicked
  >
    <div 
      className="bg-white p-6 rounded shadow-lg relative"
      onClick={(e) => e.stopPropagation()} // Prevent click from closing when clicking inside the modal
    >
      <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
        &times;
      </button>
      <h2 className="text-center font-bold mb-2">Controls</h2>
      <ul className="list-disc list-inside">
        <li><strong>W</strong> or <strong>Up Arrow</strong>: Rotate</li>
        <li><strong>A</strong> or <strong>Left Arrow</strong>: Move Left</li>
        <li><strong>D</strong> or <strong>Right Arrow</strong>: Move Right</li>
        <li><strong>S</strong> or <strong>Down Arrow</strong>: Move Down</li>
        <li><strong>Space</strong>: Hard Drop</li>
        <li><strong>C</strong>: Hold</li>
      </ul>
    </div>
  </div>
);

export default function TetrisGame() {
  const [gameState, setGameState] = useState(initializeGame());
  const [aiPlayer, setAiPlayer] = useState(new AIPlayer(5, 4, 1, 1));
  const [isAIPlaying, setIsAIPlaying] = useState(false);
  const [generation, setGeneration] = useState(1);
  const [bestScore, setBestScore] = useState(0);
  const [showAITrainer, setShowAITrainer] = useState(false);
  const [showControls, setShowControls] = useState(false); // New state for controls modal

  // New state for penalties
  const [holePenalty, setHolePenalty] = useState(-10);
  const [closedHolePenalty, setClosedHolePenalty] = useState(-20);
  const [heightDifferencePenalty, setHeightDifferencePenalty] = useState(-5);
  const [heightPenalty, setHeightPenalty] = useState(-100);

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


  useEffect(() => {    // Set up the automatic falling mechanism
    const fallInterval = setInterval(() => {
      setGameState(prevState => moveTetrominoDown(prevState));
    }, 1000); // Adjust speed here (1000ms = 1 second fall interval)

    // Clear interval when the component unmounts (important for memory management)
    return () => clearInterval(fallInterval);
  }, []);

  

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
        } 
        
      } else if (isAIPlaying) {
        restartGame();
      }
    }, isAIPlaying ? 100 : 1000); //Change to 1000 to slow down ai

    return () => clearInterval(gameLoop);
  }, [gameState, isAIPlaying, aiPlayer, restartGame]);

  const toggleAIPlay = () => {
    setIsAIPlaying(!isAIPlaying);

    //restarts game when ai is enabled
    // if (!isAIPlaying) {
    //   restartGame();
    // }
  };

  const toggleAITrainer = () => {
    setShowAITrainer(!showAITrainer);
  };

  const shadowY = calculateShadowPosition(gameState);
  const nextTetrominoes = getNextTetrominoes(gameState);

  // Update AI player when penalties change
  useEffect(() => {
    aiPlayer.updatePenalties({
      holePenalty,
      closedHolePenalty,
      heightDifferencePenalty,
      heightPenalty
    });
  }, [holePenalty, closedHolePenalty, heightDifferencePenalty, heightPenalty]);

  return (
    <div className="flex flex-col items-center">
      <div className="flex">
        <div className="flex flex-col mr-4">
          <div className="w-32 h-32 mb-4"> {/* Fixed size container for HoldDisplay */}
            <HoldDisplay heldTetromino={gameState.heldTetromino} />
          </div>
          <div className="w-48"> {/* Container for controls, adjust width as needed */}
            <ScoreBoard score={gameState.score} />
            <LinesCleared linesCleared={gameState.linesCleared} />
            <button
              onClick={toggleAIPlay}
              className="mt-4 p-2 bg-green-500 text-white rounded w-full"
            >
              {isAIPlaying ? "Disable AI" : "Enable AI"}
            </button>
            <div className="mt-4">
              <label className="text-sm">Hole Penalty: {holePenalty}</label>
              <input 
                type="range" 
                min="-50" 
                max="0" 
                value={holePenalty} 
                onChange={(e) => setHolePenalty(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="mt-2">
              <label className="text-sm">Closed Hole Penalty: {closedHolePenalty}</label>
              <input 
                type="range" 
                min="-50" 
                max="0" 
                value={closedHolePenalty} 
                onChange={(e) => setClosedHolePenalty(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="mt-2">
              <label className="text-sm">Height Difference Penalty: {heightDifferencePenalty}</label>
              <input 
                type="range" 
                min="-20" 
                max="0" 
                value={heightDifferencePenalty} 
                onChange={(e) => setHeightDifferencePenalty(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="mt-2">
              <label className="text-sm">Height Penalty: {heightPenalty}</label>
              <input 
                type="range" 
                min="-200" 
                max="0" 
                value={heightPenalty} 
                onChange={(e) => setHeightPenalty(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>
        <GameBoard gameState={gameState} shadowY={shadowY} />
        <div className="flex flex-col items-center">
          <NextDisplay nextPieces={nextTetrominoes} />
          <button
            onClick={() => setShowControls(true)}
            className="mt-4 p-2 bg-blue-500 text-white rounded ml-4"
          >
            Show Controls
          </button>
        </div>
      </div>

      {showControls && <ControlsModal onClose={() => setShowControls(false)} />}

      <button
        onClick={toggleAITrainer}
        className="mt-4 p-2 bg-purple-500 text-white rounded"
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