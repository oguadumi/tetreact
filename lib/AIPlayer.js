import { NeuralNetwork } from './NeuralNetwork';
import { calculateFeatures, moveTetromino, rotateTetromino, hardDrop, holdTetromino, hasCollision } from './tetrisLogic';

export class AIPlayer {
  constructor(inputNodes, hiddenNodes, outputNodes, hiddenLayers) {
    this.brain = new NeuralNetwork(inputNodes, hiddenNodes, outputNodes, hiddenLayers);
    this.score = 0;
    this.fitness = 0;
    this.penalties = {
      holePenalty: -10,
      closedHolePenalty: -20,
      heightDifferencePenalty: -5,
      heightPenalty: -100
    };
  }

  calculateBestMove(gameState) {
    let bestScore = -Infinity;
    let bestMove = null;

    // Consider holding the current piece if allowed
    if (gameState.canHold) {
      const holdState = holdTetromino(gameState);
      const holdFeatures = calculateFeatures(holdState);
      const holdScore = this.evaluateFeatures(holdFeatures);
      if (holdScore > bestScore) {
        bestScore = holdScore;
        bestMove = { hold: true };
      }
    }

    // Consider all possible moves without holding
    for (let rotation = 0; rotation < 4; rotation++) {
      for (let x = 0; x < 10; x++) {
        const testState = this.simulateMove(gameState, x, rotation);
        if (testState) {
          const features = calculateFeatures(testState);
          const score = this.evaluateFeatures(features);
          if (score > bestScore) {
            bestScore = score;
            bestMove = { x, rotation, hold: false };
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

  evaluateFeatures(features) {
    const [heightDifferences, holes, closedHoles, maxHeight, minHeight, clearedLines] = features;
    const heightPenalty = maxHeight > 15 ? this.penalties.heightPenalty : 0;
    const holePenalty = holes * this.penalties.holePenalty;
    const closedHolePenalty = closedHoles * this.penalties.closedHolePenalty;
    const heightDifferencePenalty = heightDifferences * this.penalties.heightDifferencePenalty;

    return clearedLines * 100 + heightPenalty + holePenalty + closedHolePenalty + heightDifferencePenalty;
  }

  updateFitness(score, linesCleared) {
    this.score = score;
    this.linesCleared = linesCleared;
    this.fitness = score + (linesCleared * 100); // Adjust this formula as needed
  }

  mutate(mutationRate) {
    this.brain.mutate(mutationRate);
  }

  crossover(partner) {
    const child = new AIPlayer(this.brain.inputNodes, this.brain.hiddenNodes, this.brain.outputNodes, this.brain.hiddenLayers);
    child.brain = this.brain.crossover(partner.brain);
    return child;
  }

  reset() {
    this.score = 0;
    this.linesCleared = 0;
    this.fitness = 0;
  }

  updatePenalties(newPenalties) {
    this.penalties = { ...this.penalties, ...newPenalties };
  }
}