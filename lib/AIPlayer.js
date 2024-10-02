import { NeuralNetwork } from './NeuralNetwork';
import { calculateFeatures, moveTetromino, rotateTetromino, hardDrop } from './tetrisLogic';

export class AIPlayer {
  constructor(inputNodes, hiddenNodes, outputNodes, hiddenLayers) {
    this.brain = new NeuralNetwork(inputNodes, hiddenNodes, outputNodes, hiddenLayers);
    this.fitness = 0;
    this.score = 0;
    this.linesCleared = 0;
  }

  calculateBestMove(gameState) {
    let bestScore = -Infinity;
    let bestMove = null;

    for (let rotation = 0; rotation < 4; rotation++) {
      for (let x = 0; x < 10; x++) {
        const testState = this.simulateMove(gameState, x, rotation);
        if (testState) {
          const features = calculateFeatures(testState);
          const score = this.brain.predict(features)[0];
          if (score > bestScore) {
            bestScore = score;
            bestMove = { x, rotation };
          }
        }
      }
    }

    return bestMove;
  }

  simulateMove(gameState, x, rotation) {
    let testState = { ...gameState };
    
    for (let i = 0; i < rotation; i++) {
      testState = rotateTetromino(testState);
      if (!testState) return null;
    }

    const horizontalMove = x - testState.currentPosition.x;
    testState = moveTetromino(testState, { x: horizontalMove, y: 0 });
    if (!testState) return null;

    testState = hardDrop(testState);

    return testState;
  }

  mutate(mutationRate) {
    this.brain.mutate(mutationRate);
  }

  crossover(partner) {
    const child = new AIPlayer(this.brain.inputNodes, this.brain.hiddenNodes, this.brain.outputNodes, this.brain.hiddenLayers);
    child.brain = this.brain.crossover(partner.brain);
    return child;
  }

  updateFitness(score, linesCleared) {
    this.score = score;
    this.linesCleared = linesCleared;
    this.fitness = score + (linesCleared * 100); // Adjust this formula as needed
  }

  reset() {
    this.score = 0;
    this.linesCleared = 0;
    this.fitness = 0;
  }
}