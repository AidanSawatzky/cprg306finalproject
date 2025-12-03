import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-gray-900 via-indigo-900 to-purple-800 text-gray-100">
    
      <h1 className="text-5xl font-extrabold tracking-wide mb-8 bg-clip-text text-transparent bg-linear-to-r from-indigo-400 via-pink-400 to-purple-500 drop-shadow-lg">
        🎮 GameScout
      </h1>

      <p className="text-lg text-gray-300 mb-10 italic">
        Your ultimate video game finder
      </p>


      <Link
        href="/pages/browse-games"
        className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-lg font-semibold text-white shadow-lg hover:shadow-indigo-500/50 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-400"
      >
        Browse Games
      </Link>
    </main>
  );
}