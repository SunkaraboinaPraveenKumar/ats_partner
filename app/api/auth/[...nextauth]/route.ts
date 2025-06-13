import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        try {
          const user = await convex.mutation(api.auth.login as any, {
            email: credentials.email,
            password: credentials.password,
          });

          if (user) {
            // Any object returned will be saved in `session.user`
            return { id: user.userId, name: user.name, email: user.email, role: user.role };
          } else {
            return null;
          }
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login", // Specify your custom login page
    error: "/login", // Error page will redirect to login
  },
});

export { handler as GET, handler as POST }; 