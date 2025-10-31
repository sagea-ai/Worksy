import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    const accessToken = authHeader.substring(7); 

    const profileResponse = await fetch(
      "https://www.freelancer.com/api/users/0.1/self",
      {
        headers: {
          "Freelancer-OAuth-Token": accessToken,
          "Content-Type": "application/json",
        },
      }
    );

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.error("❌ Freelancer profile fetch failed:", errorText);
      return NextResponse.json(
        { error: "Profile fetch failed" },
        { status: 400 }
      );
    }

    const profileData = await profileResponse.json();
    console.log("✅ Freelancer profile fetch successful");

    let skillsData = null;
    try {
      const skillsResponse = await fetch(
        "https://www.freelancer.com/api/users/0.1/self/skills",
        {
          headers: {
            "Freelancer-OAuth-Token": accessToken,
            "Content-Type": "application/json",
          },
        }
      );

      if (skillsResponse.ok) {
        skillsData = await skillsResponse.json();
        console.log("✅ Freelancer skills fetch successful");
      }
    } catch (error) {
      console.warn(
        "⚠️ Could not fetch skills, continuing without them:",
        error
      );
    }

    const combinedProfile = {
      ...profileData.result,
      skills: skillsData?.result || [],
    };

    return NextResponse.json(combinedProfile);
  } catch (error) {
    console.error("❌ Error in Freelancer profile fetch:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
