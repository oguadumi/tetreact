import { calculateShadowPosition, isValidMove, lockTetromino, clearLines, generateRandomTetromino, moveTetromino, hardDrop, rotateTetromino } from './tetrisLogic';

class TetrisAI {
  constructor(gameState) {
    this.gameState = gameState;
    this.qTable = {}; // Initialize Q-table
    this.learningRate = 0.1;
    this.discountFactor = 0.9;
    this.explorationRate = 1.0;
    this.explorationDecay = 0.995;
  }

  // Get the best move based on Q-values
  findBestMove() {
    const state = this.getState();
    const moves = this.generateAllMoves();
    
    if (moves.length === 0) {
      return null; // No valid moves available
    }

    if (Math.random() < this.explorationRate) {
      // Explore: choose a random move
      return moves[Math.floor(Math.random() * moves.length)];
    } else {
      // Exploit: choose the best move based on Q-values
      const bestMove = this.getBestMoveFromQTable(state);
      return bestMove || moves[Math.floor(Math.random() * moves.length)]; // Fallback to random if no Q-value
    }
  }

  // Generate all possible moves
  generateAllMoves() {
    const moves = [];
    const { currentTetromino, board } = this.gameState;

    for (let rotation = 0; rotation < 4; rotation++) {
      const rotatedTetromino = this.rotateTetromino(currentTetromino, rotation);
      for (let x = -5; x <= 5; x++) {
        const position = { x: this.gameState.currentPosition.x + x, y: this.gameState.currentPosition.y };
        if (isValidMove(board, rotatedTetromino.shape, position)) {
          moves.push({ rotation, x });
        }
      }
    }

    return moves;
  }

  // Evaluate a move by simulating it and calculating a score
  evaluateMove(move) {
    const { board, currentTetromino } = this.gameState;
    const rotatedTetromino = this.rotateTetromino(currentTetromino, move.rotation);
    const position = { x: this.gameState.currentPosition.x + move.x, y: this.gameState.currentPosition.y };

    // Simulate the move
    while (isValidMove(board, rotatedTetromino.shape, { ...position, y: position.y + 1 })) {
      position.y++;
    }

    const newBoard = lockTetromino(board, rotatedTetromino, position);
    const { clearedLines } = clearLines(newBoard);

    // Calculate a score based on the resulting board state
    return this.calculateScore(newBoard, clearedLines);
  }

  // Rotate the tetromino
  rotateTetromino(tetromino, times) {
    let shape = tetromino.shape;
    for (let i = 0; i < times; i++) {
      shape = shape[0].map((_, index) => shape.map(row => row[index]).reverse());
    }
    return { ...tetromino, shape };
  }

  // Calculate a score for the board state
  calculateScore(board, clearedLines) {
    const aggregateHeight = this.calculateAggregateHeight(board);
    const completeLines = clearedLines;
    const holes = this.countHoles(board);
    const bumpiness = this.calculateBumpiness(board);
    const wells = this.calculateWells(board);

    // Adjust weights as needed
    return completeLines * 1000 - aggregateHeight * 10 - holes * 50 - bumpiness * 10 - wells * 30;
  }

  // Calculate the aggregate height of the board
  calculateAggregateHeight(board) {
    let aggregateHeight = 0;
    for (let x = 0; x < board[0].length; x++) {
      aggregateHeight += board.length - board.findIndex(row => row[x] !== 0);
    }
    return aggregateHeight;
  }

  // Count the number of holes in the board
  countHoles(board) {
    let holes = 0;
    for (let x = 0; x < board[0].length; x++) {
      let blockFound = false;
      for (let y = 0; y < board.length; y++) {
        if (board[y][x] !== 0) {
          blockFound = true;
        } else if (blockFound) {
          holes++;
        }
      }
    }
    return holes;
  }

  // Calculate the bumpiness of the board
  calculateBumpiness(board) {
    let bumpiness = 0;
    for (let x = 0; x < board[0].length - 1; x++) {
      const height1 = board.length - board.findIndex(row => row[x] !== 0);
      const height2 = board.length - board.findIndex(row => row[x + 1] !== 0);
      bumpiness += Math.abs(height1 - height2);
    }
    return bumpiness;
  }

  // Calculate the wells in the board
  calculateWells(board) {
    let wells = 0;
    for (let x = 0; x < board[0].length; x++) {
      for (let y = 0; y < board.length; y++) {
        if (board[y][x] === 0 && (x === 0 || board[y][x - 1] !== 0) && (x === board[0].length - 1 || board[y][x + 1] !== 0)) {
          wells++;
        }
      }
    }
    return wells;
  }

  // Get the current state representation
  getState() {
    return this.gameState.board.map(row => row.join('')).join('');
  }

  // Get the best move from the Q-table
  getBestMoveFromQTable(state) {
    if (!this.qTable[state]) {
      return null;
    }
    return Object.keys(this.qTable[state]).reduce((bestMove, move) => {
      return this.qTable[state][move] > (this.qTable[state][bestMove] || -Infinity) ? move : bestMove;
    }, null);
  }
  serializeAction(action) {
    return `${action.rotation},${action.x}`;
  }

  deserializeAction(actionString) {
    const [rotation, x] = actionString.split(',');
    return { rotation: parseInt(rotation), x: parseInt(x) };
  }

  // Update the Q-table
  updateQTable(state, action, reward, nextState) {
    if (!this.qTable[state]) {
      this.qTable[state] = {};
    }
    const actionKey = this.serializeAction(action);
    if (!this.qTable[state][actionKey]) {
      this.qTable[state][actionKey] = 0;
    }
    const bestNextAction = this.getBestMoveFromQTable(nextState);
    const bestNextQValue = bestNextAction ? this.qTable[nextState][this.serializeAction(bestNextAction)] : 0;
    this.qTable[state][actionKey] = (1 - this.learningRate) * this.qTable[state][actionKey] + this.learningRate * (reward + this.discountFactor * bestNextQValue);
  }
  


  // Train the AI
  train(episodes) {
    for (let episode = 0; episode < episodes; episode++) {
      let gameState = this.gameState;
      while (!gameState.isGameOver) {
        const state = this.getState();
        const move = this.findBestMove();
        
        if (move === null) {
          // No valid moves available, end the game
          gameState.isGameOver = true;
          continue;
        }

        const newState = this.applyMove(gameState, move);
        const reward = this.calculateReward(newState);
        this.updateQTable(state, move, reward, this.getState(newState));
        gameState = newState;
      }
      this.explorationRate *= this.explorationDecay;
    }
  }
  // Apply a move to the game state
  applyMove(gameState, move) {
    if (!move) {
      return { ...gameState, isGameOver: true };
    }

    let newState = { ...gameState };
    for (let i = 0; i < move.rotation; i++) {
      newState = rotateTetromino(newState);
    }
    newState = moveTetromino(newState, { x: move.x, y: 0 });
    return hardDrop(newState);
  }

  // Calculate the reward for a game state
  calculateReward(gameState) {
    const { clearedLines } = clearLines(gameState.board);
    return clearedLines * 1000;
  }
}

export default TetrisAI;