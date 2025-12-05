"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getWishlist, toggleWishlist, isInWishlist } from "../../utils/wishlist";

function GamesList() {
  const [games, setGames] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState(new Set());

  const loadGames = async (term = "", genre = "") => {
    try {
      setError(null);
      let url = "/api/game";
      const params = [];
      if (term) params.push(`search=${encodeURIComponent(term)}`);
      if (genre) params.push(`genre=${encodeURIComponent(genre)}`);
      if (params.length > 0) url += `?${params.join("&")}`;

      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        const errorMessage = errorData.error || `Failed to fetch games: ${response.statusText}`;
        console.error("Failed to fetch games:", errorMessage);
        setError(errorMessage);
        setGames([]);
        setHasSearched(true);
        return;
      }
      const data = await response.json();
      setGames(data);
      setHasSearched(true);
    } catch (err) {
      console.error("Error loading games:", err);
      setError(err.message || "Failed to fetch games");
      setGames([]);
      setHasSearched(true);
    }
  };

  const loadGenres = async () => {
    try {
      const response = await fetch("/api/genres");
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        const errorMessage = errorData.error || `Failed to fetch genres: ${response.statusText}`;
        console.error("Failed to fetch genres:", errorMessage);
        setError(errorMessage);
        setGenres([]);
        return;
      }
      const data = await response.json();
      setGenres(data);
    } catch (err) {
      console.error("Error loading genres:", err);
      setError(err.message || "Failed to fetch genres");
      setGenres([]);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([loadGames(), loadGenres()]);
        // Load wishlist IDs
        const wishlist = getWishlist();
        setWishlistIds(new Set(wishlist.map(game => game.id)));
      } catch (err) {
        console.error("Error initializing:", err);
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, []);

  const handleWishlistToggle = (game, e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(game);
    const wishlist = getWishlist();
    setWishlistIds(new Set(wishlist.map(g => g.id)));
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-900 text-gray-100 flex flex-col p-10">
      <h2 className="text-4xl font-extrabold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-pink-400 to-purple-500 drop-shadow-lg tracking-wide">
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
        <Link
          href="/pages/wish-list"
          className="px-6 py-3 rounded-xl bg-pink-600 hover:bg-pink-500 text-lg font-semibold text-white shadow-lg hover:shadow-pink-500/50 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-400"
        >
          Wishlist
        </Link>
      </div>
      


      {error && (
        <div className="mb-4 p-4 rounded-xl bg-red-900/50 border border-red-700 text-red-200">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
          {error.includes("API credentials") && (
            <p className="mt-2 text-sm">
              Please create a <code className="bg-gray-800 px-2 py-1 rounded">.env.local</code> file in the project root with your Twitch API credentials.
              <br />
              Get your credentials from: <a href="https://dev.twitch.tv/console/apps" target="_blank" rel="noopener noreferrer" className="text-indigo-300 hover:text-indigo-200 underline">https://dev.twitch.tv/console/apps</a>
            </p>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <p className="text-gray-400 italic">Loading games...</p>
        ) : !hasSearched ? (
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
                  <div className="relative group mb-4">
                    <a href={game.url} target="_blank" rel="noopener noreferrer">
                      <img
                        src={`https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`}
                        alt={`${game.name} cover`}
                        className="w-full h-56 object-cover rounded-lg border border-gray-700 hover:opacity-90 transition"
                      />
                    </a>
                    <button
                      onClick={(e) => handleWishlistToggle(game, e)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 group/btn"
                      aria-label={wishlistIds.has(game.id) ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <div className="relative">
                        <svg
                          className={`w-6 h-6 transition-all duration-200 ${
                            wishlistIds.has(game.id)
                              ? "fill-red-500 stroke-red-500"
                              : "fill-transparent stroke-white group-hover/btn:fill-red-500 group-hover/btn:stroke-red-500"
                          }`}
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                          />
                        </svg>
                        <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          {wishlistIds.has(game.id) ? "Remove from wishlist" : "Add to wishlist"}
                        </span>
                      </div>
                    </button>
                  </div>
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