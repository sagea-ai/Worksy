import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { code, state, redirect_uri } = await request.json();

    if (!code || !state || !redirect_uri) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const clientId = process.env.FREELANCER_CLIENT_ID;
    const clientSecret = process.env.FREELANCER_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("❌ Freelancer OAuth credentials not configured");
      return NextResponse.json(
        { error: "OAuth not configured" },
        { status: 500 }
      );
    }

    const tokenResponse = await fetch(
      "https://accounts.freelancer.com/oauth/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: clientId,
          client_secret: clientSecret,
          code: code,
          redirect_uri: redirect_uri,
        }),
      }
    );

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("❌ Freelancer token exchange failed:", errorText);
      return NextResponse.json(
        { error: "Token exchange failed" },
        { status: 400 }
      );
    }

    const tokenData = await tokenResponse.json();
    console.log("✅ Freelancer token exchange successful");

    return NextResponse.json(tokenData);
  } catch (error) {
    console.error("❌ Error in Freelancer token exchange:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
