import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

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
    // Add user authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user profile for filtering
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const accessToken = process.env.WORKSY_ACCESS_TOKEN;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Worksy access token not configured" },
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

    // Add skill-based filtering if user has skills
    if (user.profile?.selectedSkills && user.profile.selectedSkills.length > 0) {
      // Map user skills to Freelancer job categories/skills
      const skillQuery = user.profile.selectedSkills.join(" OR ");
      params.append("query", query || skillQuery);
    } else if (query) {
      params.append("query", query);
    }

    // Add budget filtering based on user's hourly rate
    if (user.profile?.hourlyRateMin && user.profile?.hourlyRateMax) {
      // Convert hourly rate to project budget (assuming 40-80 hours for fixed projects)
      const minBudget = user.profile.hourlyRateMin * 40;
      const maxBudget = user.profile.hourlyRateMax * 80;
      params.append("min_budget", minBudget.toString());
      params.append("max_budget", maxBudget.toString());
    }

    const apiUrl = `${baseUrl}?${params.toString()}`;

    console.log("🔍 Fetching filtered projects for user:", user.email);
    console.log("🎯 User skills:", user.profile?.selectedSkills);
    console.log("💰 User rate range:", user.profile?.hourlyRateMin, "-", user.profile?.hourlyRateMax);
    console.log("📡 API URL:", apiUrl);

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

      console.log("🔄 Returning filtered fallback mock data due to API error");
      const filteredMockJobs = getFilteredMockJobs(user.profile);
      
      return NextResponse.json({
        jobs: filteredMockJobs,
        total: filteredMockJobs.length,
        offset: parseInt(offset),
        limit: parseInt(limit),
        fallback: true,
        filtered: true,
        userSkills: user.profile?.selectedSkills || [],
        error: `API error: ${response.status} - ${errorText}`,
      });
    }

    const data: FreelancerApiResponse = await response.json();

    console.log(
      "✅ Successfully fetched",
      data.result?.projects?.length || 0,
      "active projects from Freelancer"
    );

    let transformedJobs =
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

    // Apply additional client-side filtering based on user profile
    const originalCount = transformedJobs.length;
    console.log("🔍 BEFORE FILTERING: User profile exists?", !!user.profile);
    console.log("🔍 BEFORE FILTERING: Jobs to filter:", originalCount);
    console.log("🔍 BEFORE FILTERING: Sample job titles:", transformedJobs.slice(0, 3).map(j => j.title));
    
    transformedJobs = filterJobsByUserProfile(transformedJobs, user.profile);
    
    console.log(`🎯 After filtering: ${transformedJobs.length}/${originalCount} jobs remain`);
    
    if (transformedJobs.length === 0) {
      console.log("⚠️ No jobs passed filtering! Returning some jobs with relaxed criteria...");
      
      // If no jobs pass strict filtering, return jobs with very relaxed criteria
      transformedJobs = data.result?.projects?.slice(0, 5).map((job) => ({
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
      
      console.log("🔄 Fallback: Returning", transformedJobs.length, "unfiltered jobs");
    }

    return NextResponse.json({
      jobs: transformedJobs,
      total: transformedJobs.length,
      offset: parseInt(offset),
      limit: parseInt(limit),
      filtered: true,
      userSkills: user.profile?.selectedSkills || [],
      debug: {
        originalJobCount: originalCount,
        filteredJobCount: transformedJobs.length,
        userProfileExists: !!user.profile,
        hasSkills: !!(user.profile?.selectedSkills?.length),
        hasRates: !!(user.profile?.hourlyRateMin && user.profile?.hourlyRateMax),
      }
    });
  } catch (error) {
    console.error("💥 Error fetching jobs from Freelancer:", error);

    // Fetch user profile for fallback filtering
    let userProfile = null;
    try {
      const { userId } = await auth();
      if (userId) {
        const user = await prisma.user.findUnique({
          where: { clerkId: userId },
          include: { profile: true },
        });
        userProfile = user?.profile;
      }
    } catch (e) {
      console.error("Could not fetch user profile for fallback");
    }

    const filteredMockJobs = getFilteredMockJobs(userProfile);
    
    console.log("🔄 Returning fallback mock data due to network/parsing error");
    return NextResponse.json({
      jobs: filteredMockJobs,
      total: filteredMockJobs.length,
      offset: parseInt(offset || "0"),
      limit: parseInt(limit || "20"),
      fallback: true,
      error: "Network error - using filtered fallback data",
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

// Helper function to filter jobs by user profile
function filterJobsByUserProfile(jobs: any[], userProfile: any) {
  if (!userProfile) return jobs;

  console.log("🔍 Filtering", jobs.length, "jobs for user profile");
  console.log("👤 User skills:", userProfile.selectedSkills);
  console.log("💰 User rates:", userProfile.hourlyRateMin, "-", userProfile.hourlyRateMax);
  console.log("🎓 Experience level:", userProfile.experienceLevel);

  const filteredJobs = jobs.filter(job => {
    let matchScore = 0;
    
    // Skill matching - make this more flexible
    if (userProfile.selectedSkills && userProfile.selectedSkills.length > 0) {
      const jobSkills = job.skills.map((s: string) => s.toLowerCase());
      const userSkills = userProfile.selectedSkills.map((s: string) => s.toLowerCase());
      
      const skillMatches = userSkills.some((userSkill: string) => 
        jobSkills.some((jobSkill: string) => 
          jobSkill.includes(userSkill) || userSkill.includes(jobSkill) ||
          // Add partial matching for common tech terms
          (userSkill.includes('react') && jobSkill.includes('react')) ||
          (userSkill.includes('node') && jobSkill.includes('node')) ||
          (userSkill.includes('javascript') && (jobSkill.includes('js') || jobSkill.includes('javascript'))) ||
          (userSkill.includes('python') && jobSkill.includes('python')) ||
          (userSkill.includes('web') && jobSkill.includes('web'))
        )
      );
      
      if (skillMatches) {
        matchScore += 3;
        console.log("✅ Skill match found for job:", job.title);
      }
    } else {
      // If no skills selected, give some base score
      matchScore += 1;
    }

    // Budget filtering - make this more lenient
    if (userProfile.hourlyRateMin && userProfile.hourlyRateMax && job.price > 0) {
      const estimatedHours = 50;
      const estimatedHourlyRate = job.price / estimatedHours;
      
      // More lenient budget matching
      if (estimatedHourlyRate >= (userProfile.hourlyRateMin * 0.5) && 
          estimatedHourlyRate <= (userProfile.hourlyRateMax * 2)) {
        matchScore += 2;
        console.log("💰 Budget match for job:", job.title, "Rate:", estimatedHourlyRate);
      }
    } else {
      // If no rate set, give some base score
      matchScore += 1;
    }

    // Experience level matching
    if (userProfile.experienceLevel === 'EXPERT' || userProfile.experienceLevel === 'ADVANCED') {
      if (job.verified) matchScore += 1;
      if (job.rating >= 4.5) matchScore += 1;
    }

    // Prefer jobs with reasonable proposal counts
    if (job.proposalCount < 30) matchScore += 1; // Increased from 20 to 30
    
    // Prefer urgent jobs for experienced users
    if (job.isUrgent && (userProfile.experienceLevel === 'INTERMEDIATE' || userProfile.experienceLevel === 'ADVANCED' || userProfile.experienceLevel === 'EXPERT')) {
      matchScore += 1;
    }

    // Lower the minimum match score requirement
    const passed = matchScore >= 1; // Reduced from 2 to 1
    
    console.log(`📊 Job "${job.title}" - Score: ${matchScore}, Passed: ${passed}`);
    
    return passed;
  });

  console.log(`🎯 Filtered ${filteredJobs.length} jobs from ${jobs.length} total jobs`);
  
  return filteredJobs;
}

// Helper function to get filtered mock jobs based on user profile
function getFilteredMockJobs(userProfile: any) {
  const allMockJobs = getMockJobs();
  
  if (!userProfile) return allMockJobs;
  
  return filterJobsByUserProfile(allMockJobs, userProfile);
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
