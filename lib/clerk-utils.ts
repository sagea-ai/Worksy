import { clerkClient } from "@clerk/nextjs/server";
import { User } from "@clerk/nextjs/server";

export class ClerkService {
  private static client: Awaited<ReturnType<typeof clerkClient>> | null = null;

  private static async getClient() {
    if (!this.client) {
      this.client = await clerkClient();
    }
    return this.client;
  }

  static async getUserById(userId: string): Promise<User> {
    try {
      const client = await this.getClient();
      return await client.users.getUser(userId);
    } catch (error) {
      console.error("Error fetching user from Clerk:", error);
      throw new Error("Failed to fetch user data");
    }
  }

  static async getUserEmail(userId: string): Promise<string> {
    try {
      const user = await this.getUserById(userId);
      const email = user.emailAddresses[0]?.emailAddress;

      if (!email) {
        throw new Error("User email not found");
      }

      return email;
    } catch (error) {
      console.error("Error getting user email:", error);
      throw error;
    }
  }

  static async getUserProfile(userId: string) {
    try {
      const user = await this.getUserById(userId);
      return {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
        firstName: user.firstName || null,
        lastName: user.lastName || null,
        imageUrl: user.imageUrl || null,
        fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      };
    } catch (error) {
      console.error("Error getting user profile:", error);
      throw error;
    }
  }

  static async updateUser(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      primaryEmailAddressId?: string;
    }
  ) {
    try {
      const client = await this.getClient();
      return await client.users.updateUser(userId, data);
    } catch (error) {
      console.error("Error updating user in Clerk:", error);
      throw new Error("Failed to update user data");
    }
  }

  static async deleteUser(userId: string) {
    try {
      const client = await this.getClient();
      return await client.users.deleteUser(userId);
    } catch (error) {
      console.error("Error deleting user from Clerk:", error);
      throw new Error("Failed to delete user");
    }
  }
}
