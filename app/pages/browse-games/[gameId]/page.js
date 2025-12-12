"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { db } from "../../../_utils/firebase.js";
import { 
    collection, 
    doc, 
    getDoc,
    setDoc, 
    deleteDoc 
} from "firebase/firestore";
import { useUserAuth } from "../../../_utils/auth-context.js";

const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
};

export default function GameDetailsPage({ params }) {
    const pathname = usePathname();
    const gameId = pathname.split('/').pop(); 

    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isInWishlist, setIsInWishlist] = useState(false);
    const { user } = useUserAuth();

    // this fnc checks if the current game is in the user's wishlist
    const checkWishlistStatus = async () => {
        if (!user || !gameId) return;

        try {
            const gameRef = doc(
                db, 
                "users", 
                user.uid, 
                "wishlists", 
                "default", 
                "games", 
                String(gameId)
            );
            const docSnap = await getDoc(gameRef);
            setIsInWishlist(docSnap.exists());
        } catch (err) {
            console.error("Error checking wishlist status:", err);
        }
    };


    const handleWishlistToggle = async () => {
        if (!user || !game) return; 

        const gameRef = doc(
            db, 
            "users", 
            user.uid, 
            "wishlists", 
            "default", 
            "games", 
            String(game.id)
        );

        if (isInWishlist) {
            setIsInWishlist(false);
            await deleteDoc(gameRef);
        } else {
            setIsInWishlist(true);
            await setDoc(gameRef, {
                name: game.name,
                cover: game.cover?.image_id || null, 
                url: game.url,
                addedAt: new Date(),
            });
        }
    };

    const loadGameDetails = async () => {
        if (!gameId) return; 

        setLoading(true);
        setError(null);
        
        try {
            const url = `/api/game-detail/${gameId}`;
            const response = await fetch(url);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Failed to fetch game details (Status: ${response.status})`);
            }

            const data = await response.json();
            setGame(data[0]); 

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadGameDetails();
    }, [gameId]); 

    useEffect(() => {
        if (game && user) {
            checkWishlistStatus();
        }
    }, [game, user]);


    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
                <p className="text-xl animate-pulse">Loading Game Details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-gray-900 text-white p-6">
                <p className="text-2xl text-red-400 mb-4">Error Loading Details</p>
                <p className="text-gray-400 italic">An error occurred: {error}</p>
                <Link href="/pages/browse-games" className="mt-6 px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-500 transition">
                    Go Back to Library
                </Link>
            </div>
        );
    }

    if (!game) {
         return (
            <div className="flex flex-col justify-center items-center h-screen bg-gray-900 text-white p-6">
                <p className="text-2xl text-red-400 mb-4">Game Not Found</p>
                <Link href="/pages/browse-games" className="mt-6 px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-500 transition">
                    Go Back to Library
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-10 flex flex-col items-center">
            
            <div className="max-w-4xl w-full bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700">
                <div className="flex justify-between items-start mb-6">
                    <Link href="/pages/browse-games" className="text-indigo-400 hover:text-pink-400 transition flex items-center mb-6">
                        &larr; Back to Games Library
                    </Link>
                
                    {user && (
                            <button
                                onClick={handleWishlistToggle}
                                 className="p-3 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition"
                                 title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                             >
                                 <svg
                                     className={`w-8 h-8 transition-all duration-200 ${
                                        isInWishlist 
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
                        )}
                </div>
                
                <h1 className="text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-pink-400 drop-shadow-lg">
                    {game.name}
                </h1>
                
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-1/3 flex-shrink-0">
                        {game.cover?.image_id && (
                            <img
                                src={`https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`}
                                alt={`${game.name} cover`}
                                className="w-full object-cover rounded-xl shadow-xl border-2 border-indigo-600"
                            />
                        )}
                        
                        <a 
                            href={game.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block mt-4 text-center px-4 py-2 bg-pink-600 rounded-lg hover:bg-pink-500 transition text-white font-semibold"
                        >
                            View on IGDB
                        </a>
                    </div>
                    
                    <div className="w-full md:w-2/3">
                        {game.summary && (
                            <div className="mb-6">
                                <h2 className="text-2xl font-semibold mb-2 text-indigo-300">Summary</h2>
                                <p className="text-gray-300 leading-relaxed">{game.summary}</p>
                            </div>
                        )}

                        {game.release_dates?.[0]?.human && (
                            <p className="text-lg mb-2">
                                <span className="font-semibold text-pink-400">Release Date:</span> {game.release_dates[0].human}
                            </p>
                        )}
                        
                        {game.genres?.length > 0 && (
                            <p className="text-lg mb-2">
                                <span className="font-semibold text-pink-400">Genres:</span> {game.genres.map(g => g.name).join(', ')}
                            </p>
                        )}
                        
                        {game.rating && (
                            <p className="text-lg mb-2">
                                <span className="font-semibold text-pink-400">Rating:</span> {Math.round(game.rating) / 10} / 10
                            </p>
                        )}

                        {game.platforms?.length > 0 && (
                            <div className="mt-4">
                                <h3 className="text-xl font-semibold mb-2 text-indigo-300">Platforms</h3>
                                <div className="flex flex-wrap gap-2">
                                    {game.platforms.map(p => (
                                        <span key={p.id} className="px-3 py-1 bg-gray-700 rounded-full text-sm text-gray-300">
                                            {p.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                    </div>
                </div>
            </div>
            
        </div>
    );
}