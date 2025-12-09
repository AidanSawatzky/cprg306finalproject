"use client";
import { useState } from 'react';
import GameList from "./game-list";

export default function Page() {
  
  const [games, setGames] = useState([]);
    return <GameList games={games} setGames={setGames} />;
}
