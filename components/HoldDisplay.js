import React from 'react';


export default function HoldDisplay({ heldTetromino }) {
  if (!heldTetromino) {
    return (
      <div className="mr-4 p-2 h-32 border-2 border-gray-300 rounded">
        <h2 className="text-center font-bold mb-2">Hold</h2>
        <div className="w-16 h-16 bg-gray-200 grid grid-cols-4 gap-px mx-auto" />
      </div>
    );
  }

  const { type } = heldTetromino;

  return (
    <div className="mr-4 p-2 h-32 border-2 border-gray-300 rounded">
      <h2 className="text-center font-bold mb-2">Hold</h2>
      
      {/* Display the tetromino image */}
      <div className="flex justify-center items-center h-full">
        <img 
          src={`/${type}_.png`} 
          alt={`${type} Tetromino`} 
          className="w-16 h-16 object-contain" 
        />
        
      </div>
    </div>
  );
}