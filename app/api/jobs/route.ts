import { NextRequest, NextResponse } from "next/server";

interface FreelancerJob {
  id: number;
  title: string;
  description: string;
  budget: {
    minimum: number;
    maximum: number;
    currency: {
      code: string;
    };
  };
  type: {
    name: string;
  };
  time_submitted: number;
  location: {
    country: {
      name: string;
    };
  };
  jobs: Array<{
    name: string;
  }>;
  owner: {
    display_name: string;
    reputation: {
      entire_site: number;
    };
    status: {
      payment_verified: boolean;
    };
  };
  bid_stats: {
    bid_count: number;
  };
  urgent: boolean;
}

interface FreelancerApiResponse {
  status: string;
  result: {
    projects: FreelancerJob[];
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get("limit") || "20";
  const offset = searchParams.get("offset") || "0";
  const query = searchParams.get("query") || "";

  try {
    const accessToken = process.env.GIGSTAR_ACCESS_TOKEN;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Gigstar access token not configured" },
        { status: 500 }
      );
    }

    const baseUrl =
      "https://www.freelancer.com/api/projects/0.1/projects/active/";
    const params = new URLSearchParams({
      limit: limit,
      offset: offset,
      full_description: "true",
      job_details: "true",
      user_details: "true",
      location_details: "true",
      upgrade_details: "true",
    });

    if (query) {
      params.append("query", query);
    }

    const apiUrl = `${baseUrl}?${params.toString()}`;

    console.log("🔍 Fetching active projects from Freelancer API:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "freelancer-oauth-v1": accessToken,
        "Content-Type": "application/json",
        "User-Agent": "GigstarAI/1.0",
      },
    });

    if (!response.ok) {
      console.error(
        "❌ Freelancer API error:",
        response.status,
        response.statusText
      );
      const errorText = await response.text();
      console.error("Error details:", errorText);

      try {
        const errorData = JSON.parse(errorText);
        console.error("Parsed error data:", errorData);
      } catch (e) {
        console.error("Could not parse error as JSON");
      }

      console.log("🔄 Returning fallback mock data due to API error");
      return NextResponse.json({
        jobs: getMockJobs(),
        total: getMockJobs().length,
        offset: parseInt(offset),
        limit: parseInt(limit),
        fallback: true,
        error: `API error: ${response.status} - ${errorText}`,
      });
    }

    const data: FreelancerApiResponse = await response.json();

    console.log(
      "✅ Successfully fetched",
      data.result?.projects?.length || 0,
      "active projects from Freelancer"
    );

    const transformedJobs =
      data.result?.projects?.map((job) => ({
        id: job.id,
        title: job.title,
        description: job.description,
        price: job.budget?.maximum || job.budget?.minimum || 0,
        currency: job.budget?.currency?.code || "USD",
        platform: "Freelancer",
        location: job.location?.country?.name || "Worldwide",
        postedTime: formatTimeAgo(job.time_submitted),
        skills: job.jobs?.map((j) => j.name) || [],
        proposalCount: job.bid_stats?.bid_count || 0,
        rating: (job.owner?.reputation?.entire_site || 0) / 10,
        isUrgent: job.urgent || false,
        verified: job.owner?.status?.payment_verified || false,
        type: job.type?.name || "Fixed",
        ownerName: job.owner?.display_name || "Anonymous",
      })) || [];

    return NextResponse.json({
      jobs: transformedJobs,
      total: transformedJobs.length,
      offset: parseInt(offset),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error("💥 Error fetching jobs from Freelancer:", error);

    console.log("🔄 Returning fallback mock data due to network/parsing error");
    return NextResponse.json({
      jobs: getMockJobs(),
      total: getMockJobs().length,
      offset: parseInt(offset || "0"),
      limit: parseInt(limit || "20"),
      fallback: true,
      error: "Network error - using fallback data",
    });
  }
}

function formatTimeAgo(timestamp: number): string {
  const now = Date.now() / 1000; // Convert to seconds
  const diffInSeconds = now - timestamp;

  if (diffInSeconds < 60) {
    return "Just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }
}

function getMockJobs() {
  return [
    {
      id: 1001,
      title: "Build a Modern E-commerce Website with Next.js",
      description:
        "We are looking for an experienced web developer to build a professional, modern, and mobile-friendly e-commerce website using Next.js and TypeScript. The site should include payment integration, user authentication, and admin dashboard...",
      price: 1500,
      currency: "USD",
      platform: "Freelancer",
      location: "Worldwide",
      postedTime: "2 hours ago",
      skills: ["Next.js", "TypeScript", "E-commerce", "Stripe", "Tailwind CSS"],
      proposalCount: 12,
      rating: 4.8,
      isUrgent: true,
      verified: true,
      type: "Fixed",
      ownerName: "TechStartup",
    },
    {
      id: 1002,
      title: "AI Chatbot Development for Customer Support",
      description:
        "Looking for an AI specialist to develop a sophisticated chatbot for our customer support system. The bot should integrate with our existing CRM and handle complex queries using natural language processing...",
      price: 2500,
      currency: "USD",
      platform: "Freelancer",
      location: "Remote",
      postedTime: "4 hours ago",
      skills: [
        "Python",
        "AI/ML",
        "Natural Language Processing",
        "OpenAI",
        "FastAPI",
      ],
      proposalCount: 8,
      rating: 4.9,
      isUrgent: false,
      verified: true,
      type: "Fixed",
      ownerName: "InnovateAI",
    },
    {
      id: 1003,
      title: "Mobile App Development with React Native",
      description:
        "Need an experienced React Native developer to build a cross-platform mobile application for food delivery. App should include real-time tracking, payment gateway, push notifications, and user authentication...",
      price: 3000,
      currency: "USD",
      platform: "Freelancer",
      location: "Global",
      postedTime: "1 day ago",
      skills: [
        "React Native",
        "Firebase",
        "Payment Gateway",
        "Google Maps",
        "Push Notifications",
      ],
      proposalCount: 25,
      rating: 4.7,
      isUrgent: true,
      verified: true,
      type: "Fixed",
      ownerName: "FoodieApp",
    },
    {
      id: 1004,
      title: "SEO Optimization and Digital Marketing",
      description:
        "Seeking an SEO expert to optimize our SaaS website for better search rankings. Need comprehensive keyword research, on-page optimization, link building strategy, and Google Ads management...",
      price: 800,
      currency: "USD",
      platform: "Freelancer",
      location: "US/EU",
      postedTime: "3 hours ago",
      skills: [
        "SEO",
        "Google Ads",
        "Content Marketing",
        "Analytics",
        "Link Building",
      ],
      proposalCount: 18,
      rating: 4.6,
      isUrgent: false,
      verified: true,
      type: "Fixed",
      ownerName: "GrowthHacker",
    },
    {
      id: 1005,
      title: "Blockchain Smart Contract Development",
      description:
        "Looking for a blockchain developer to create smart contracts for our DeFi platform. Experience with Solidity, Web3, and testing frameworks required. Must have proven track record with audited contracts...",
      price: 4000,
      currency: "USD",
      platform: "Freelancer",
      location: "Worldwide",
      postedTime: "6 hours ago",
      skills: ["Solidity", "Web3", "Ethereum", "Smart Contracts", "DeFi"],
      proposalCount: 6,
      rating: 4.9,
      isUrgent: true,
      verified: true,
      type: "Fixed",
      ownerName: "CryptoVenture",
    },
  ];
}
