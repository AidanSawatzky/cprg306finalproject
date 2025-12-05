"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getWishlist, removeFromWishlist } from "../../utils/wishlist";

function Wishlist() {
  const [wishlistGames, setWishlistGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");

  // Get developer name from game object
  const getDeveloperName = (game) => {
    if (!game.involved_companies || game.involved_companies.length === 0) {
      return "";
    }
    // Find the developer company (developer flag is true)
    const developer = game.involved_companies.find(
      (ic) => ic.developer === true
    );
    if (!developer) {
      return "";
    }
    // Handle nested company object with name
    if (developer.company && typeof developer.company === 'object' && developer.company.name) {
      return developer.company.name;
    }
    // Handle case where company might be just an ID (would need separate API call)
    // For now, return empty string
    return "";
  };

  // Get release date for sorting (use date if available, otherwise try to parse human date)
  const getReleaseDate = (game) => {
    if (game.release_dates && game.release_dates.length > 0) {
      // Prefer date field (timestamp) for accurate sorting
      if (game.release_dates[0].date) {
        return game.release_dates[0].date;
      }
      // Fallback to human date parsing (less reliable)
      if (game.release_dates[0].human) {
        const dateStr = game.release_dates[0].human;
        const parsed = new Date(dateStr);
        return isNaN(parsed.getTime()) ? 0 : parsed.getTime();
      }
    }
    return 0;
  };

  // Sort games based on selected option
  const sortGames = (games, sortOption) => {
    const sorted = [...games];
    
    switch (sortOption) {
      case "alphabetical-az":
        return sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      
      case "alphabetical-za":
        return sorted.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
      
      case "release-new-old":
        return sorted.sort((a, b) => {
          const dateA = getReleaseDate(a);
          const dateB = getReleaseDate(b);
          return dateB - dateA; // Newest first
        });
      
      case "release-old-new":
        return sorted.sort((a, b) => {
          const dateA = getReleaseDate(a);
          const dateB = getReleaseDate(b);
          return dateA - dateB; // Oldest first
        });
      
      case "rating":
        return sorted.sort((a, b) => {
          const ratingA = a.rating || 0;
          const ratingB = b.rating || 0;
          return ratingB - ratingA; // Highest first
        });
      
      case "developer":
        return sorted.sort((a, b) => {
          const devA = getDeveloperName(a);
          const devB = getDeveloperName(b);
          return devA.localeCompare(devB);
        });
      
      default:
        return sorted;
    }
  };

  // Filter and sort games
  useEffect(() => {
    let filtered = wishlistGames;

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter((game) =>
        (game.name || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    if (sortBy) {
      filtered = sortGames(filtered, sortBy);
    }

    setFilteredGames(filtered);
  }, [wishlistGames, searchTerm, sortBy]);

  useEffect(() => {
    const loadWishlist = () => {
      try {
        const games = getWishlist();
        setWishlistGames(games);
        setFilteredGames(games);
      } catch (error) {
        console.error("Error loading wishlist:", error);
      } finally {
        setLoading(false);
      }
    };
    loadWishlist();
  }, []);

  const handleRemoveFromWishlist = (gameId, e) => {
    e.preventDefault();
    e.stopPropagation();
    removeFromWishlist(gameId);
    const updatedWishlist = getWishlist();
    setWishlistGames(updatedWishlist);
    // Filtered games will update automatically via useEffect
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-900 text-gray-100 flex flex-col p-10">
      <h2 className="text-4xl font-extrabold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-pink-400 to-purple-500 drop-shadow-lg tracking-wide">
        ❤️ My Wishlist
      </h2>

      <div className="flex gap-4 mb-8 w-full flex-wrap">
        <input
          type="text"
          placeholder="Search wishlist..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-[200px] p-4 rounded-xl bg-gray-800 text-gray-200 placeholder-gray-500 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-indigo-500 transition shadow-lg"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="p-4 rounded-xl bg-gray-800 text-gray-200 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-indigo-500 transition shadow-lg"
        >
          <option value="">Sort by</option>
          <option value="alphabetical-az">Alphabetical (A-Z)</option>
          <option value="alphabetical-za">Alphabetical (Z-A)</option>
          <option value="release-new-old">Release Date (New-Old)</option>
          <option value="release-old-new">Release Date (Old-New)</option>
          <option value="rating">Rating</option>
          <option value="developer">Developer</option>
        </select>
        <Link
          href="/pages/browse-games"
          className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-lg font-semibold text-white shadow-lg hover:shadow-indigo-500/50 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-400"
        >
          Full List
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <p className="text-gray-400 italic">Loading wishlist...</p>
        ) : wishlistGames.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 italic text-xl mb-4">Your wishlist is empty</p>
            <Link
              href="/pages/browse-games"
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-lg font-semibold text-white shadow-lg hover:shadow-indigo-500/50 transition-transform transform hover:scale-105 inline-block"
            >
              Browse Games
            </Link>
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 italic text-xl">No games found matching your search.</p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-8">
            {filteredGames.map((game) => (
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
                      onClick={(e) => handleRemoveFromWishlist(game.id, e)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 group/btn"
                      aria-label="Remove from wishlist"
                    >
                      <div className="relative">
                        <svg
                          className="w-6 h-6 fill-red-500 text-red-500 group-hover/btn:fill-red-600 group-hover/btn:text-red-600 transition-all duration-200"
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
                          Remove from wishlist
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

export default Wishlist;

