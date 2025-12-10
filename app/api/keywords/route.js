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

    // Get Twitch access token
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

    // Query IGDB keywords
    const igdbRes = await fetch("https://api.igdb.com/v4/keywords", {
      method: "POST",
      headers: {
        "Client-ID": clientId,
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      body: "fields id, name, slug, url, created_at, updated_at; limit 50;", 
    });

    if (!igdbRes.ok) {
      const errorText = await igdbRes.text();
      console.error("IGDB keywords request failed:", errorText);
      return NextResponse.json(
        { error: "Failed to fetch keywords from IGDB" },
        { status: igdbRes.status }
      );
    }

    const keywords = await igdbRes.json();
    return NextResponse.json(keywords);
  } catch (error) {
    console.error("Error fetching keywords:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}