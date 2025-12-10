import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    let gameId = null;

    try {
        const url = new URL(req.url);
        gameId = url.pathname.split('/').pop(); 

        if (!gameId || typeof gameId !== 'string' || gameId.trim() === '') {
            return NextResponse.json(
                { error: "Missing game ID in request path" }, 
                { status: 400 }
            );
        }

        const clientId = process.env.TWITCH_CLIENT_ID;
        const clientSecret = process.env.TWITCH_CLIENT_SECRET;
        
        const tokenRes = await fetch(
             `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
             { method: "POST" }
         );
         
         const tokenData = await tokenRes.json();
         const accessToken = tokenData.access_token;

         if (!accessToken) {
            return NextResponse.json(
                { error: "Failed to get access token (Twitch)" },
                { status: 500 }
            );
         }


        const detailFields = [
            "name", "summary", "platforms.name", "genres.name", "url", 
            "cover.image_id", "rating", "release_dates.human", 
            "age_ratings.rating_category", "age_ratings.synopsis"
        ];
        
        const igdbQuery = `
            fields ${detailFields.join(',')};
            where id = ${gameId};
            limit 1;
        `.trim();

        const igdbRes = await fetch("https://api.igdb.com/v4/games", {
            method: "POST",
            headers: {
                "Client-ID": clientId,
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/json",
            },
            body: igdbQuery,
        });

        if (!igdbRes.ok) {
            const errorText = await igdbRes.text();
            return NextResponse.json(
                { error: `Failed to fetch game details from IGDB (Status: ${igdbRes.status})` },
                { status: igdbRes.status }
            );
        }

        const gameData = await igdbRes.json();
        return NextResponse.json(gameData);

    } catch (error) {
        return NextResponse.json(
            { error: "Internal server error during API processing." },
            { status: 500 }
        );
    }
}