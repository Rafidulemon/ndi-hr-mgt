import type { NextAuthOptions } from "next-auth";

export const nextAuthOptions: NextAuthOptions = {
  providers: [],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        if (token.sub) {
          session.user.id = token.sub;
        }
        if (token.role && typeof token.role === "string") {
          session.user.role = token.role;
        }
      }

      return session;
    },
    async jwt({ token, user }) {
      if (user && "role" in user && typeof user.role === "string") {
        token.role = user.role;
      }

      return token;
    },
  },
};
