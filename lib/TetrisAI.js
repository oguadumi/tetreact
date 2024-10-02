import { calculateShadowPosition, isValidMove, lockTetromino, clearLines, generateRandomTetromino } from './tetrisLogic';

class TetrisAI {
  constructor(gameState) {
    this.gameState = gameState;
  }

  // Evaluate the game state and return the best move
  findBestMove() {
    const moves = this.generateAllMoves();
    let bestMove = null;
    let bestScore = -Infinity;

    moves.forEach(move => {
      const score = this.evaluateMove(move);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    });

    return bestMove;
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
    // Example scoring function
    const height = board.length - board.findIndex(row => row.some(cell => cell !== 0));
    const holes = this.countHoles(board);
    const bumpiness = this.calculateBumpiness(board);

    return clearedLines * 1000 - height * 10 - holes * 50 - bumpiness * 10;
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
}

export default TetrisAI;