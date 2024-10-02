import React from 'react';

export default function AIStats({ generation, mutationRate }) {
  return (
    <div className="mt-4 p-2 border-2 border-gray-300 rounded">
      <h2 className="text-center font-bold mb-2">AI Stats</h2>
      <div className="text-center">
        <p>Generation: {generation}</p>
        <p>Mutation Rate: {mutationRate}</p>
      </div>
    </div>
  );
}