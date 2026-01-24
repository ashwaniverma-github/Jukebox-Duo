import type { NextAuthOptions, Session, User } from "next-auth";
import type { Account, Profile } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import prisma from "../../../../lib/prisma";
import { JWT } from "next-auth/jwt";

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    email?: string;
    image?: string;
    synced?: boolean; // Flag to track if session has been migrated
  }
}

declare module "next-auth" {
  interface User {
    id?: string;
    name?: string;
    email?: string;
    image?: string;
  }
  interface Session {
    user?: {
      id: string;
      name?: string;
      email?: string;
      image?: string;
    };
  }
}

// Helper function to detect legacy Google IDs
function isLegacyGoogleId(id: string): boolean {
  // Google IDs are typically long numeric strings (15+ digits)
  return /^\d{15,}$/.test(id);
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account }: {
      token: JWT;
      user?: User;
      account?: Account | null;
      profile?: Profile;
    }) {
      // Initial sign-in: get user from DB and add ID to token
      if (user && account) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (dbUser) {
          token.sub = dbUser.id; // Set JWT sub to database ID
          token.email = dbUser.email ?? undefined;
          token.image = dbUser.image ?? user.image ?? undefined;
          token.synced = true; // Mark as already synced
        }
        // Fallback for first sign-in if dbUser is not found
        if (user.image && !token.image) {
          token.image = user.image;
        }

        return token;
      }

      // Session refresh: Check if we need to migrate old Google ID to database ID
      const needsSync = token.sub &&
        isLegacyGoogleId(token.sub) &&
        !token.synced;

      if (needsSync && token.email) {
        try {
          console.log(`[Session Sync] Detected legacy session for ${token.email}, migrating...`);

          // Fetch the correct user ID from database using email
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string },
            select: { id: true, image: true }
          });

          if (dbUser) {
            console.log(`[Session Sync] ✓ Migrated session: ${token.sub} → ${dbUser.id}`);
            token.sub = dbUser.id; // Update to database CUID
            token.synced = true; // Prevent future lookups

            // Update image if missing
            if (dbUser.image && !token.image) {
              token.image = dbUser.image;
            }
          } else {
            console.warn(`[Session Sync] ✗ No user found for email: ${token.email}`);
            // Invalidate session - force re-login
            return {};
          }
        } catch (error) {
          console.error("[Session Sync] Error during migration:", error);
          // Don't break the session - allow it to continue with old token
          // User will need to sign in again eventually
        }
      }

      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        // Add database ID to session
        session.user.id = token.sub!;
        session.user.email = token.email!;
        session.user.image = token.image as string;
      }
      return session;
    },

    async signIn({ user, account, profile }: {
      user: User;
      account: Account | null;
      profile?: Profile;
    }) {
      try {
        if (account?.provider === "google") {
          if (!user.email) throw new Error("No email provided");

          // Upsert user in database
          const dbUser = await prisma.user.upsert({
            where: { email: user.email },
            update: {
              image: user.image || profile?.image,
            },
            create: {
              name: user.name,
              email: user.email,
              image: user.image || profile?.image,
            },
          });

          // Attach database ID to user object
          user.id = dbUser.id;
        }
        return true;
      } catch (error) {
        console.error("SignIn error:", error);
        return false;
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};