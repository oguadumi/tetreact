import React from 'react';

const NextDisplay = ({ nextPieces = [] }) => { // Default to an empty array
  console.log('Next Pieces:', nextPieces); // Log next pieces

  const pieceSize = 50; // Size of each piece
  const containerHeight = pieceSize * nextPieces.slice(0, 5).length + 20; // Calculate container height

  return (
    <div className="next-display p-2 border-2 border-gray-300 rounded" style={{ height: containerHeight }}>
      <div className="next-label font-bold mb-2">Next</div>
      {nextPieces.slice(0, 5).map((piece, index) => (
        <div key={index} className="next-piece mb-2">
          <img
            src={`/${piece.type}_.png`} // Ensure the correct property is used
            alt={`Next piece: ${piece.type}`}
            width={40} // Increased width
            height={40} // Increased height
          />
        </div>
      ))}
      <style jsx>{`
        .next-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-left: 20px;
          padding: 10px;
          border: 2px solid #ccc;
          border-radius: 8px;
        }
        .next-label {
          font-size: 18px;
          margin-bottom: 10px;
        }
        .next-piece {
          margin-bottom: 5px;
        }
      `}</style>
    </div>
  );
};

export default NextDisplay;