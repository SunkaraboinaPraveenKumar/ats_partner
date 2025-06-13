import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "job-seeker" | "recruiter";
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: "job-seeker" | "recruiter";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "job-seeker" | "recruiter";
  }
} 