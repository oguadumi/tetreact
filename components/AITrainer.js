import React, { useState, useEffect, useCallback } from 'react';
import { AIPlayer } from '../lib/AIPlayer';
import { initializeGame, moveTetrominoDown, moveTetromino, rotateTetromino, hardDrop } from '../lib/tetrisLogic';

const POPULATION_SIZE = 100;
const GENERATIONS = 1000;
const GAMES_PER_AI = 5;
const MUTATION_RATE = 0.1;

export default function AITrainer() {
  const [generation, setGeneration] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [population, setPopulation] = useState([]);
  const [isTraining, setIsTraining] = useState(false);
  const [currentGameScore, setCurrentGameScore] = useState(0);

  useEffect(() => {
    if (isTraining) {
      trainGeneration();
    }
  }, [isTraining, generation]);

  const initializePopulation = useCallback(() => {
    const newPopulation = Array(POPULATION_SIZE).fill().map(() => new AIPlayer(5, 4, 1, 1));
    setPopulation(newPopulation);
    setGeneration(0);
    setBestScore(0);
    setAverageScore(0);
    setCurrentGameScore(0);
  }, []);

  const trainGeneration = useCallback(async () => {
    const results = await Promise.all(population.map(playGames));
    const sortedPopulation = results.sort((a, b) => b.fitness - a.fitness);
    
    const newBestScore = Math.max(bestScore, sortedPopulation[0].fitness);
    const newAverageScore = results.reduce((sum, ai) => sum + ai.fitness, 0) / POPULATION_SIZE;
    
    setBestScore(newBestScore);
    setAverageScore(newAverageScore);

    if (generation < GENERATIONS - 1) {
      const newPopulation = evolvePopulation(sortedPopulation);
      setPopulation(newPopulation);
      setGeneration(gen => gen + 1);
    } else {
      setIsTraining(false);
    }
  }, [population, bestScore, generation]);

  const playGames = useCallback(async (ai) => {
    let totalFitness = 0;
    for (let i = 0; i < GAMES_PER_AI; i++) {
      const fitness = await playGame(ai);
      totalFitness += fitness;
    }
    ai.fitness = totalFitness / GAMES_PER_AI;
    return ai;
  }, []);

  const playGame = useCallback(async (ai) => {
    let gameState = initializeGame();
    while (!gameState.isGameOver) {
      const aiMove = ai.calculateBestMove(gameState);
      if (aiMove) {
        for (let i = 0; i < aiMove.rotation; i++) {
          gameState = rotateTetromino(gameState);
        }
        gameState = moveTetromino(gameState, { x: aiMove.x - gameState.currentPosition.x, y: 0 });
        gameState = hardDrop(gameState);
      } else {
        gameState = moveTetrominoDown(gameState);
      }
      setCurrentGameScore(gameState.score);
      await new Promise(resolve => setTimeout(resolve, 0)); // Allow UI to update
    }
    return gameState.score;
  }, []);

  const evolvePopulation = useCallback((sortedPopulation) => {
    const eliteSize = Math.floor(POPULATION_SIZE * 0.1);
    const newPopulation = sortedPopulation.slice(0, eliteSize);

    while (newPopulation.length < POPULATION_SIZE) {
      const parent1 = selectParent(sortedPopulation);
      const parent2 = selectParent(sortedPopulation);
      const child = parent1.crossover(parent2);
      child.mutate(MUTATION_RATE);
      newPopulation.push(child);
    }

    return newPopulation;
  }, []);

  const selectParent = useCallback((sortedPopulation) => {
    const totalFitness = sortedPopulation.reduce((sum, ai) => sum + ai.fitness, 0);
    let runningSum = 0;
    const threshold = Math.random() * totalFitness;

    for (const ai of sortedPopulation) {
      runningSum += ai.fitness;
      if (runningSum > threshold) {
        return ai;
      }
    }

    return sortedPopulation[sortedPopulation.length - 1];
  }, []);

  const startTraining = useCallback(() => {
    initializePopulation();
    setIsTraining(true);
  }, [initializePopulation]);

  const stopTraining = useCallback(() => {
    setIsTraining(false);
  }, []);

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">AI Trainer</h1>
      <div className="mb-4">
        <button
          onClick={startTraining}
          className="p-2 bg-green-500 text-white rounded mr-2"
          disabled={isTraining}
        >
          Start Training
        </button>
        <button
          onClick={stopTraining}
          className="p-2 bg-red-500 text-white rounded"
          disabled={!isTraining}
        >
          Stop Training
        </button>
      </div>
      <div className="text-lg">
        <p>Generation: {generation}</p>
        <p>Best Score: {bestScore}</p>
        <p>Average Score: {averageScore.toFixed(2)}</p>
      </div>
    </div>
  );
}