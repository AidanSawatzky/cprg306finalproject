"use client";
import React from "react";
import Link from "next/link";
import { useUserAuth } from "./_utils/auth-context.js";

export default function Home() {
  const { user, gitHubSignIn, firebaseSignOut } = useUserAuth();

  const handleSignIn = async () => {
    try {
      await gitHubSignIn();
    } catch (error) {
      console.error("GitHub sign-in failed:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await firebaseSignOut();
    } catch (error) {
      console.error("Sign-out failed:", error);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-gray-900 via-indigo-900 to-purple-800 text-gray-100">
      <h1 className="text-5xl font-extrabold tracking-wide mb-8 bg-clip-text text-transparent bg-linear-to-r from-indigo-400 via-pink-400 to-purple-500 drop-shadow-lg">
        🎮 GameScout
      </h1>
      {user && (
        <p className="mb-4 text-lg font-medium">
          Welcome, <span className="font-bold">{user.displayName}</span> ({user.email})
        </p>
      )}


      <p className="text-lg text-gray-300 mb-10 italic">
        Your ultimate video game finder
      </p>

      <div className="flex flex-col items-center justify-center  text-white px-4">
        {!user ? (
          <button
            onClick={handleSignIn}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-lg font-semibold text-white shadow-lg hover:shadow-indigo-500/50 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-400"
          >
            Sign In with GitHub
          </button>
        ) : (
          <>
            <Link
              href="/pages/browse-games"
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-lg font-semibold text-white shadow-lg hover:shadow-indigo-500/50 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-400"
            >
              Browse Games
            </Link>
            <button
              onClick={handleSignOut}
              className="mt-4 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-500 transition duration-200"
            >
              Sign Out
            </button>
          </>
        )}
      </div>
    </main>
  );
}
