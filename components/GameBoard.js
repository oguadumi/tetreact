import React from 'react';
import { calculateShadowPosition } from '../lib/tetrisLogic';

const COLORS = {
  I: 'cyan',
  O: 'yellow',
  T: 'purple',
  L: 'orange',
  J: 'blue',
  S: 'green',
  Z: 'red',
};

export default function GameBoard({ gameState }) {
  const { board, currentTetromino, currentPosition } = gameState;

  // Calculate the shadow position
  const shadowY = calculateShadowPosition(gameState);

  // Create a copy of the board to overlay the current Tetromino and shadow
  const displayBoard = board.map(row => [...row]);

  // Overlay the shadow onto the board (gray or semi-transparent)
  currentTetromino.shape.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) {
        const boardY = y + shadowY;
        const boardX = x + currentPosition.x;
        if (boardY >= 0 && boardY < board.length && boardX >= 0 && boardX < board[0].length) {
          displayBoard[boardY][boardX] = 'shadow'; // Mark as shadow
        }
      }
    });
  });

  // Overlay the current Tetromino onto the board
  currentTetromino.shape.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) {
        const boardY = y + currentPosition.y;
        const boardX = x + currentPosition.x;
        if (boardY >= 0 && boardY < board.length && boardX >= 0 && boardX < board[0].length) {
          displayBoard[boardY][boardX] = currentTetromino.type;
        }
      }
    });
  });

  return (
    <div className="grid grid-cols-10 gap-px bg-gray-300">
      {displayBoard.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className="w-6 h-6"
            style={{ 
              backgroundColor: cell === 'shadow' ? 'rgba(0, 0, 0, 0.2)' : (cell ? COLORS[cell] : 'white') 
            }}
          />
        ))
      )}
    </div>
  );
}
