const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

const TETROMINO_TYPES = {
    I: { shape: [[1, 1, 1, 1]], color: 'cyan' },
    O: { shape: [[1, 1], [1, 1]], color: 'yellow' },
    T: { shape: [[0, 1, 0], [1, 1, 1]], color: 'purple' },
    L: { shape: [[0, 0, 1], [1, 1, 1]], color: 'orange' },
    J: { shape: [[1, 0, 0], [1, 1, 1]], color: 'blue' },
    S: { shape: [[0, 1, 1], [1, 1, 0]], color: 'green' },
    Z: { shape: [[1, 1, 0], [0, 1, 1]], color: 'red' }
  };

  export function initializeGame() {
    const currentTetromino = generateRandomTetromino();
    const nextTetromino = generateRandomTetromino();
    return {
      board: Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0)),
      currentTetromino,
      nextTetromino,
      heldTetromino: null,
      canHold: true,
      currentPosition: { x: Math.floor(BOARD_WIDTH / 2) - Math.floor(currentTetromino.shape[0].length / 2), y: 0 },
      score: 0,
      isGameOver: false,  // Add game over state

    };
  }

  export function holdTetromino(gameState) {
    if (!gameState.canHold) return gameState;
  
    const heldTetromino = gameState.heldTetromino;
    const newCurrentTetromino = heldTetromino || gameState.nextTetromino;
    const newNextTetromino = heldTetromino ? gameState.nextTetromino : generateRandomTetromino();
  
    return {
      ...gameState,
      currentTetromino: newCurrentTetromino,
      heldTetromino: gameState.currentTetromino,
      nextTetromino: newNextTetromino,
      canHold: false,
      currentPosition: { x: Math.floor(BOARD_WIDTH / 2) - Math.floor(newCurrentTetromino.shape[0].length / 2), y: 0 },
    };
  }

export function moveTetrominoDown(gameState) {
  return moveTetromino(gameState, { x: 0, y: 1 });
}

export function moveTetromino(gameState, movement) {
  if (gameState.isGameOver) return gameState;

    const newPosition = {
      x: gameState.currentPosition.x + movement.x,
      y: gameState.currentPosition.y + movement.y
    };
    
    if (isValidMove(gameState.board, gameState.currentTetromino.shape, newPosition)) {
      return { ...gameState, currentPosition: newPosition };
    } else if (movement.y > 0) {
      return lockTetrominoAndUpdate(gameState);
    }
    
    return gameState;
  }

  export function rotateTetromino(gameState) {
    const rotatedShape = gameState.currentTetromino.shape[0].map((_, index) =>
      gameState.currentTetromino.shape.map(row => row[index]).reverse()
    );
    
    if (isValidMove(gameState.board, rotatedShape, gameState.currentPosition)) {
      return { ...gameState, currentTetromino: { ...gameState.currentTetromino, shape: rotatedShape } };
    }
    
    return gameState;
  }

  export function hardDrop(gameState) {
    let newPosition = { ...gameState.currentPosition };
    while (isValidMove(gameState.board, gameState.currentTetromino.shape, { ...newPosition, y: newPosition.y + 1 })) {
      newPosition.y++;
    }
    return lockTetrominoAndUpdate({ ...gameState, currentPosition: newPosition });
  }


function lockTetrominoAndUpdate(gameState) {
  const newBoard = lockTetromino(gameState.board, gameState.currentTetromino, gameState.currentPosition);
  
  if (!isValidMove(gameState.board, gameState.currentTetromino.shape, gameState.currentPosition) && gameState.currentPosition.y <= 0) {
    return {
      ...gameState,
      board: newBoard,
      isGameOver: true,  // Mark the game as over
    };
  }
  
  
  const { clearedLines, updatedBoard } = clearLines(newBoard);
  const newScore = gameState.score + calculateScore(clearedLines);
  
  return {
    ...gameState,
    board: updatedBoard,
    currentTetromino: gameState.nextTetromino,
    nextTetromino: generateRandomTetromino(),
    currentPosition: { x: Math.floor(BOARD_WIDTH / 2) - Math.floor(gameState.nextTetromino.shape[0].length / 2), y: 0 },
    score: newScore,
    canHold: true,
  };
}
  
  function clearLines(board) {
    const clearedLines = board.reduce((acc, row, index) => {
      if (row.every(cell => cell !== 0)) {
        acc.push(index);
      }
      return acc;
    }, []);
  
    if (clearedLines.length === 0) {
      return { clearedLines, updatedBoard: board };
    }
    const updatedBoard = board.filter((_, index) => !clearedLines.includes(index));
    const newRows = Array(clearedLines.length).fill().map(() => Array(BOARD_WIDTH).fill(0));
    return { clearedLines, updatedBoard: [...newRows, ...updatedBoard] };
  }
  function calculateScore(clearedLines) {
    const scores = [0, 40, 100, 300, 1200];
    return scores[clearedLines.length];
  }

  function generateRandomTetromino() {
    const types = Object.keys(TETROMINO_TYPES);
    const randomType = types[Math.floor(Math.random() * types.length)];
    return { ...TETROMINO_TYPES[randomType], type: randomType };
  }
  

function isValidMove(board, tetromino, position) {
  for (let y = 0; y < tetromino.length; y++) {
    for (let x = 0; x < tetromino[y].length; x++) {
      if (tetromino[y][x]) {
        const newY = y + position.y;
        const newX = x + position.x;
        if (newY >= BOARD_HEIGHT || newX < 0 || newX >= BOARD_WIDTH || (newY >= 0 && board[newY][newX])) {
          return false;
        }
      }
    }
  }
  return true;
}

function lockTetromino(board, tetromino, position) {
    const newBoard = board.map(row => [...row]);
    tetromino.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          newBoard[y + position.y][x + position.x] = tetromino.type;
        }
      });
    });
    return newBoard;
  }