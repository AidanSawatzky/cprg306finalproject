import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const clientId = process.env.TWITCH_CLIENT_ID;
    const clientSecret = process.env.TWITCH_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("Missing Twitch API credentials. Please set TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET in .env.local");
      return NextResponse.json(
        { error: "Server configuration error: Missing API credentials" },
        { status: 500 }
      );
    }

    const tokenRes = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
      { method: "POST" }
    );
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Failed to get access token" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);
    const searchTerm = searchParams.get("search");
    const genreId = searchParams.get("genre");
    

    let query =
      "fields name, release_dates.human, release_dates.date, url, cover.image_id, rating, age_ratings.rating_category, age_ratings.synopsis, genres, involved_companies.company.name, involved_companies.developer; limit 50;";

    if (searchTerm) {
      query = `search "${searchTerm}"; fields name, url, cover.image_id, release_dates.human, release_dates.date, rating, age_ratings.rating_category, age_ratings.synopsis, genres, involved_companies.company.name, involved_companies.developer; limit 20; where version_parent = null;`;
    }

    if (genreId) {
      const genreNum = parseInt(genreId, 10);
      if (query.includes("where")) {
        query = query.replace(
          "where version_parent = null;",
          `where version_parent = null & genres = ${genreNum};`
        );
      } else {
        query = query.replace(
          "; limit",
          `; where genres = ${genreNum}; limit`
        );
      }
    }

    const igdbRes = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": clientId,
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      body: query,
    });

    if (!igdbRes.ok) {
      const errorText = await igdbRes.text();
      console.error("IGDB request failed:", errorText);
      return NextResponse.json(
        { error: "Failed to fetch games from IGDB" },
        { status: igdbRes.status }
      );
    }

    const games = await igdbRes.json();
    return NextResponse.json(games);
  } catch (error) {
    console.error("Error fetching games:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}