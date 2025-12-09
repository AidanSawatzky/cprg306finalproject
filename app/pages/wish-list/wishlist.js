"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "../../_utils/firebase.js";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useUserAuth } from "../../_utils/auth-context.js";

function Wishlist() {
  const [wishlistGames, setWishlistGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");
  const { user } = useUserAuth();


  const getDeveloperName = (game) => {
    if (!game.involved_companies || game.involved_companies.length === 0) return "";
    const developer = game.involved_companies.find((ic) => ic.developer === true);
    return developer?.company?.name || "";
  };


  const getReleaseDate = (game) => {
    if (game.release_dates?.length > 0) {
      if (game.release_dates[0].date) return game.release_dates[0].date;
      if (game.release_dates[0].human) {
        const parsed = new Date(game.release_dates[0].human);
        return isNaN(parsed.getTime()) ? 0 : parsed.getTime();
      }
    }
    return 0;
  };


  const sortGames = (games, sortOption) => {
    const sorted = [...games];
    switch (sortOption) {
      case "alphabetical-az":
        return sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      case "alphabetical-za":
        return sorted.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
      case "release-new-old":
        return sorted.sort((a, b) => getReleaseDate(b) - getReleaseDate(a));
      case "release-old-new":
        return sorted.sort((a, b) => getReleaseDate(a) - getReleaseDate(b));
      case "rating":
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case "developer":
        return sorted.sort((a, b) =>
          getDeveloperName(a).localeCompare(getDeveloperName(b))
        );
      default:
        return sorted;
    }
  };


  useEffect(() => {
    let filtered = wishlistGames;
    if (searchTerm.trim()) {
      filtered = filtered.filter((game) =>
        (game.name || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (sortBy) {
      filtered = sortGames(filtered, sortBy);
    }
    setFilteredGames(filtered);
  }, [wishlistGames, searchTerm, sortBy]);


  useEffect(() => {
    const loadWishlist = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const gamesRef = collection(
          db,
          "users",
          user.uid,
          "wishlists",
          "default",
          "games"
        );
        const snapshot = await getDocs(gamesRef);
        const games = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setWishlistGames(games);
        setFilteredGames(games);
      } catch (error) {
        console.error("Error loading wishlist:", error);
      } finally {
        setLoading(false);
      }
    };
    loadWishlist();
  }, [user]);

  const handleRemoveFromWishlist = async (gameId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;

    try {
      const gameRef = doc(
        db,
        "users",
        user.uid,
        "wishlists",
        "default",
        "games",
        gameId
      );
      await deleteDoc(gameRef);

      setWishlistGames((prev) => prev.filter((g) => g.id !== gameId));
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-900 text-gray-100 flex flex-col p-10">
      <h2 className="text-4xl font-extrabold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-pink-400 to-purple-500 drop-shadow-lg tracking-wide">
        🎮 My Wishlist
      </h2>

      <div className="flex gap-4 mb-8 w-full">
        <input
          type="text"
          placeholder="Search wishlist..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 p-4 rounded-xl bg-gray-800 text-gray-200 placeholder-gray-500 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-indigo-500 transition shadow-lg"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="p-4 rounded-xl bg-gray-800 text-gray-200 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-indigo-500 transition shadow-lg"
        >
          <option value="">Sort By</option>
          <option value="alphabetical-az">Alphabetical A-Z</option>
          <option value="alphabetical-za">Alphabetical Z-A</option>
          <option value="release-new-old">Release Date (New → Old)</option>
          <option value="release-old-new">Release Date (Old → New)</option>
          <option value="rating">Rating</option>
          <option value="developer">Developer</option>
        </select>
              <Link
        href="/pages/browse-games"
        className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-lg font-semibold text-white shadow-lg hover:shadow-indigo-500/50 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-400"
      >
        Browse Games
      </Link>

      </div>

      {loading ? (
        <p className="text-gray-400 italic">Loading wishlist...</p>
      ) : filteredGames.length === 0 ? (
        <p className="text-red-400 italic">No games in wishlist.</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-8">
          {filteredGames.map((game) => (
            <li
              key={game.id}
              className="bg-gray-800/70 backdrop-blur-md border border-gray-700 rounded-xl p-5 shadow-lg hover:shadow-pink-500/40 transition transform hover:scale-105 flex flex-col"
            >
              {game.cover && (
                <img
                  src={`https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover}.jpg`}
                  alt={`${game.name} cover`}
                  className="w-full h-56 object-cover rounded-lg border border-gray-700 hover:opacity-90 transition mb-4"
                />
              )}

              <h3 className="text-xl font-semibold text-indigo-300 hover:text-pink-400 transition">
                {game.name}
              </h3>

              <button
                onClick={(e) => handleRemoveFromWishlist(game.id, e)}
                className="mt-4 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-500 transition duration-200"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Wishlist;