import React from 'react';

export default function ScoreBoard({ score }) {
  return (
    <div className="mt-4 text-xl font-bold">
      Score: {score}
    </div>
  );
}