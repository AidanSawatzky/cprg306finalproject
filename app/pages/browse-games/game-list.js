"use client";
import { useEffect, useState } from "react";

function GamesList() {
  const [games, setGames] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const loadGames = async (term = "", genre = "") => {
    let url = "/api/game";
    const params = [];
    if (term) params.push(`search=${encodeURIComponent(term)}`);
    if (genre) params.push(`genre=${encodeURIComponent(genre)}`);
    if (params.length > 0) url += `?${params.join("&")}`;

    const response = await fetch(url);
    if (!response.ok) {
      console.error("Failed to fetch games:", response.statusText);
      return [];
    }
    const data = await response.json();
    setGames(data);
    setHasSearched(true);
  };

  const loadGenres = async () => {
    const response = await fetch("/api/genres");
    if (!response.ok) {
      console.error("Failed to fetch genres:", response.statusText);
      return [];
    }
    const data = await response.json();
    setGenres(data);
  };

  useEffect(() => {
    loadGames();
    loadGenres();
  }, []);

  return (
    <div className="w-screen h-screen bg-linear-to-br from-gray-900 via-indigo-950 to-purple-900 text-gray-100 flex flex-col p-10">
      <h2 className="text-4xl font-extrabold mb-8 bg-clip-text text-transparent bg-linear-to-r from-indigo-400 via-pink-400 to-purple-500 drop-shadow-lg tracking-wide">
        🎮 GameScout Library
      </h2>

      <div className="flex gap-4 mb-8 w-full">
        <input
          type="text"
          placeholder="Search games..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 p-4 rounded-xl bg-gray-800 text-gray-200 placeholder-gray-500 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-indigo-500 transition shadow-lg"
        />
        <select
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
          className="p-4 rounded-xl bg-gray-800 text-gray-200 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-indigo-500 transition shadow-lg"
        >
          <option value="">All Genres</option>
          {genres.map((genre) => (
            <option key={genre.id} value={genre.id}>
              {genre.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => loadGames(searchTerm, selectedGenre)}
          className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-lg font-semibold text-white shadow-lg hover:shadow-indigo-500/50 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-400"
        >
          Search
        </button>
      </div>
      


      <div className="flex-1 overflow-y-auto">
        {!hasSearched ? (
          <p className="text-gray-400 italic">Loading games...</p>
        ) : games.length === 0 ? (
          <p className="text-red-400 italic">No games found.</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-8">
            {games.map((game) => (
              <li
                key={game.id}
                className="bg-gray-800/70 backdrop-blur-md border border-gray-700 rounded-xl p-5 shadow-lg hover:shadow-pink-500/40 transition transform hover:scale-105 flex flex-col"
              >
                {game.cover?.image_id && (
                  <a href={game.url} target="_blank" rel="noopener noreferrer">
                    <img
                      src={`https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`}
                      alt={`${game.name} cover`}
                      className="w-full h-56 object-cover rounded-lg mb-4 border border-gray-700 hover:opacity-90 transition"
                    />
                  </a>
                )}

                <a
                  href={game.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xl font-semibold text-indigo-300 hover:text-pink-400 transition"
                >
                  {game.name}
                </a>

                {game.release_dates?.[0]?.human && (
                  <p className="text-sm text-gray-400 mt-1">
                    Released: {game.release_dates[0].human}
                  </p>
                )}

                {game.age_ratings?.[0]?.rating_category && (
                  <p className="text-sm text-indigo-300 mt-1">
                    Rating Category: {game.age_ratings[0].rating_category}
                  </p>
                )}

                {game.age_ratings?.[0]?.synopsis && (
                  <p className="text-sm text-gray-400 italic mt-2">
                    {game.age_ratings[0].synopsis}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default GamesList;