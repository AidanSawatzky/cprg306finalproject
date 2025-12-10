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

    // Parse query params
    const { searchParams } = new URL(req.url);
    const term = searchParams.get("search");
    const genre = searchParams.get("genre");
    const platform = searchParams.get("platform");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = (page - 1) * limit;

    // Get Twitch OAuth token
    const tokenRes = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
      { method: "POST" }
    );
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return NextResponse.json({ error: "Failed to get access token" }, { status: 500 });
    }

    // Build IGDB query
    let conditions = [];
    if (genre) conditions.push(`genres = (${genre})`);
    if (platform) conditions.push(`platforms = (${platform})`);

    let query = `fields id, name, cover.image_id, url, genres, platforms; limit ${limit}; offset ${offset};`;

    if (term) query = `search "${term}"; ${query}`;
    if (conditions.length > 0) {
      query = `where ${conditions.join(" & ")}; ${query}`;
    }

    // Call IGDB
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
      console.error("IGDB games request failed:", errorText);
      return NextResponse.json({ error: "Failed to fetch games" }, { status: igdbRes.status });
    }

    const games = await igdbRes.json();
    return NextResponse.json(games);
  } catch (error) {
    console.error("Error fetching games:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}