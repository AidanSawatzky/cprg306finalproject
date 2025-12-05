import { NextResponse } from "next/server";

export async function GET() {
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

    // IGDB query for genres
    const query = "fields id, name; limit 50;";

    const igdbRes = await fetch("https://api.igdb.com/v4/genres", {
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
      console.error("IGDB genres request failed:", errorText);
      return NextResponse.json({ error: "Failed to fetch genres" }, { status: igdbRes.status });
    }

    const genres = await igdbRes.json();
    return NextResponse.json(genres);
  } catch (error) {
    console.error("Error fetching genres:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}