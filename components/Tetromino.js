import React from 'react';

export default function Tetromino({ shape, position }) {
  if (!shape || !position) return null;

  return (
    <>
      {shape.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          if (cell) {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                style={{
                  position: 'absolute',
                  top: `${(position.y + rowIndex) * 24}px`,
                  left: `${(position.x + colIndex) * 24}px`,
                  width: '24px',
                  height: '24px',
                  backgroundColor: 'blue',
                }}
              />
            );
          }
          return null;
        })
      )}
    </>
  );
}