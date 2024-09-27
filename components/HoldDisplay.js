import React from 'react';

const COLORS = {
  I: 'cyan',
  O: 'yellow',
  T: 'purple',
  L: 'orange',
  J: 'blue',
  S: 'green',
  Z: 'red',
};

export default function HoldDisplay({ heldTetromino }) {
  if (!heldTetromino) {
    return (
      <div className="mr-4 p-2 h-32 border-2 border-gray-300 rounded">
        <h2 className="text-center font-bold mb-2">Hold</h2>
        <div className="w-16 h-16 bg-gray-200 grid grid-cols-4 gap-px" />
      </div>
    );
  }

  const { shape, type } = heldTetromino;

  return (
    <div className="mr-4 p-2 h-32 border-2 border-gray-300 rounded">
      <h2 className="text-center font-bold mb-2">Hold</h2>

      {/*  display image shape depending on which is held instead of creating a grid
            switch to destop and checc the ai training vid
            https://www.youtube.com/watch?v=pXTfgw9A08w
            https://github.com/knagaitsev/tetris-ai
      */}
      {/* <div className="grid gap-px" style={{ gridTemplateColumns: `repeat(${shape[0].length}, 1fr)` }}>
        {shape.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${y}-${x}`}
              className="w-4 h-4"
              style={{ backgroundColor: cell ? COLORS[type] : 'white' }}
            />
          ))
        )}
      </div> */}
    </div>
  );
}



// add shadow below where block is about to be placed
// add the next block side panel