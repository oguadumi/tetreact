import React from 'react';
import TetrisGame from '../components/TetrisGame';

export default function Home() {
  return (
    <div className="container mx-auto px-4">
      <h1 className="text-4xl font-bold text-center my-8">Tetris</h1>
      <TetrisGame />
    </div>
  );
}