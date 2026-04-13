import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getServerSession } from "next-auth";

const ACCESS_CODE = process.env.ACCESS_CODE || "goodfriend";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "access-code",
      credentials: {
        code: { label: "Access Code", type: "text" },
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.code || !credentials?.name) {
          return null;
        }

        if (credentials.code.toLowerCase() !== ACCESS_CODE.toLowerCase()) {
          return null;
        }

        return {
          id: credentials.name.toLowerCase().replace(/\s+/g, "-"),
          name: credentials.name,
          role: "helper",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};

export async function getSession() {
  return getServerSession(authOptions);
}
