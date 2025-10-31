/**
 * Freelancer OAuth integration utilities
 */

export interface FreelancerProfile {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  profileDescription?: string;
  location?: {
    country: string;
    city?: string;
  };
  avatar?: {
    large_avatar_url: string;
  };
  skills?: Array<{
    id: number;
    name: string;
    level?: number;
  }>;
  portfolio?: Array<{
    id: number;
    title: string;
    description: string;
    url?: string;
    thumbnail_url?: string;
  }>;
  status?: {
    payment_verified: boolean;
    phone_verified: boolean;
    email_verified: boolean;
    facebook_connected: boolean;
    linkedin_connected: boolean;
  };
}

export interface FreelancerTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

/**
 * Initiate Freelancer OAuth flow
 */
export const initiateFreelancerOAuth = () => {
  const clientId = process.env.NEXT_PUBLIC_FREELANCER_CLIENT_ID;

  if (!clientId) {
    console.error("Freelancer Client ID not configured");
    throw new Error("OAuth not configured");
  }

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: `${window.location.origin}/auth/freelancer/callback`,
    scope: "basic profile projects",
    state: generateRandomState(), // CSRF protection
  });

  // Store state in sessionStorage for verification
  sessionStorage.setItem("freelancer_oauth_state", params.get("state")!);

  const authUrl = `https://accounts.freelancer.com/oauth/authorize?${params}`;
  console.log("🔗 Redirecting to Freelancer OAuth:", authUrl);

  window.location.href = authUrl;
};

/**
 * Exchange authorization code for access token
 */
export const exchangeCodeForToken = async (
  code: string,
  state: string
): Promise<FreelancerTokenResponse> => {
  // Verify state to prevent CSRF attacks
  const storedState = sessionStorage.getItem("freelancer_oauth_state");
  if (storedState !== state) {
    throw new Error("Invalid OAuth state parameter");
  }

  const response = await fetch("/api/auth/freelancer/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code,
      state,
      redirect_uri: `${window.location.origin}/auth/freelancer/callback`,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  const tokenData = await response.json();

  // Clean up state
  sessionStorage.removeItem("freelancer_oauth_state");

  return tokenData;
};

/**
 * Fetch user profile from Freelancer API
 */
export const fetchFreelancerProfile = async (
  accessToken: string
): Promise<FreelancerProfile> => {
  const response = await fetch("/api/auth/freelancer/profile", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Profile fetch failed: ${error}`);
  }

  return response.json();
};

/**
 * Generate random state for CSRF protection
 */
function generateRandomState(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

/**
 * Check if Freelancer OAuth is configured
 */
export const isFreelancerOAuthConfigured = (): boolean => {
  return !!process.env.NEXT_PUBLIC_FREELANCER_CLIENT_ID;
};
