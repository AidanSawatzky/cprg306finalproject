"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "../../_utils/firebase.js";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { useUserAuth } from "../../_utils/auth-context.js";

function GamesList() {
  const [games, setGames] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [platforms, setPlatforms] = useState([]);
  const [platformFilter, setPlatformFilter] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const { user } = useUserAuth();
  const [page, setPage] = useState(1);
  const [limit] = useState(18);

  const loadWishlist = async () => {
    if (!user) return;
    const gamesRef = collection(
      db,
      "users",
      user.uid,
      "wishlists",
      "default",
      "games"
    );
    const snapshot = await getDocs(gamesRef);
    const ids = new Set(snapshot.docs.map((doc) => doc.id));
    setWishlistIds(ids);
  };

  const loadGames = async (
    term = "",
    genre = "",
    platform = "",
    page = 1,
    limit = 18
  ) => {
    try {
      setError(null);
      let url = "/api/game";
      const params = [];
      if (term) params.push(`search=${encodeURIComponent(term)}`);
      if (genre) params.push(`genre=${encodeURIComponent(genre)}`);
      if (platform) params.push(`platform=${encodeURIComponent(platform)}`);
      params.push(`page=${page}`);
      params.push(`limit=${limit}`);

      if (params.length > 0) url += `?${params.join("&")}`;

      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: response.statusText }));
        const errorMessage =
          errorData.error || `Failed to fetch games: ${response.statusText}`;
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
        const errorData = await response
          .json()
          .catch(() => ({ error: response.statusText }));
        const errorMessage =
          errorData.error || `Failed to fetch genres: ${response.statusText}`;
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

  const loadPlatforms = async () => {
    try {
      const response = await fetch("/api/platforms");
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: response.statusText }));
        const errorMessage =
          errorData.error ||
          `Failed to fetch platforms: ${response.statusText}`;
        console.error("Failed to fetch platforms:", errorMessage);
        setError(errorMessage);
        setPlatforms([]);
        return;
      }
      const data = await response.json();
      setPlatforms(data);
    } catch (err) {
      console.error("Error loading platforms:", err);
      setError(err.message || "Failed to fetch platforms");
      setPlatforms([]);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([loadGames(), loadGenres(), loadPlatforms()]);
        await loadWishlist();
      } catch (err) {
        console.error("Error initializing:", err);
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, [user]);

  useEffect(() => {
    if (hasSearched) {
      loadGames(searchTerm, selectedGenre, platformFilter, page, limit);
    }
  }, [searchTerm, selectedGenre, platformFilter, page, limit]);

  const handleWishlistToggle = async (game, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;

    const gameRef = doc(
      db,
      "users",
      user.uid,
      "wishlists",
      "default",
      "games",
      String(game.id)
    );

    if (wishlistIds.has(game.id)) {
      setWishlistIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(game.id);
        return newSet;
      });

      await deleteDoc(gameRef);
    } else {
      setWishlistIds((prev) => {
        const newSet = new Set(prev);
        newSet.add(game.id);
        return newSet;
      });

      await setDoc(gameRef, {
        name: game.name,
        cover: game.cover?.image_id || null,
        url: game.url,
        addedAt: new Date(),
      });
    }
  };

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
        <select
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value)}
          className="p-4 rounded-xl bg-gray-800 text-gray-200 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-indigo-500 transition shadow-lg"
        >
          <option value="">All Platforms</option>
          {platforms.map((platform) => (
            <option key={platform.id} value={platform.id}>
              {platform.name}
            </option>
          ))}
        </select>
        

        <Link
          href="/pages/wish-list"
          className="px-6 py-3 rounded-xl bg-pink-600 hover:bg-pink-500 text-lg font-semibold text-white shadow-lg hover:shadow-pink-500/50 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-400"
        >
          Wishlist
        </Link>
      </div>

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
                    <Link
                      href={`/pages/browse-games/${game.id}`} // Routes to the internal Game Detail page
                      className="relative group mb-4"
                    >
                      <img
                        src={`https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`}
                        alt={`${game.name} cover`}
                        className="w-full h-56 object-cover rounded-lg border border-gray-700 hover:opacity-90 transition"
                      />
                    </Link>
                    {
                      <button
                        onClick={(e) => handleWishlistToggle(game, e)}
                        className="absolute top-2 right-2 z-10 p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70"
                        aria-label={
                          wishlistIds.has(game.id)
                            ? "Remove from wishlist"
                            : "Add to wishlist"
                        }
                      >
                        <svg
                          className={`w-6 h-6 transition-all duration-200 ${
                            wishlistIds.has(game.id)
                              ? "fill-red-500 stroke-red-500"
                              : "fill-transparent stroke-white hover:fill-red-500 hover:stroke-red-500"
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
                      </button>
                    }
                  </div>
                )}

                <Link
                  href={`/pages/browse-games/${game.id}`} // Routes to the internal Game Detail page
                  className="text-xl font-semibold text-indigo-300 hover:text-pink-400 transition"
                >
                  {game.name}
                </Link>

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
      <div className="flex gap-2 mt-6">
        <button
          disabled={page === 1}
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2">Page {page}</span>
        <button
          onClick={() => setPage((prev) => prev + 1)}
          className="px-4 py-2 bg-gray-700 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default GamesList;
