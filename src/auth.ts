import bcrypt from "bcrypt";
import NextAuth from "next-auth";
import { ObjectId } from "mongodb";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import Credentials from "next-auth/providers/credentials";
import MongoClient from "@/lib/server/mongodb/client";

import type { LoginCredentials, User } from "@/types";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(MongoClient),

  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7,
  },

  jwt: {
    maxAge: 60 * 60 * 24 * 7,
  },

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { type: "email", label: "Email" },
        password: { type: "password", label: "Password" },
      },

      async authorize(credentials) {
        const { email, password } = credentials as LoginCredentials;
        if (!email || !password) return null;

        const db = MongoClient.db();

        const user = await db
          .collection<User & { _id: ObjectId; password: string }>("users")
          .findOne({ email });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
});
