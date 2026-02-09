import bcrypt from "bcrypt";
import NextAuth from "next-auth";
import { ObjectId } from "mongodb";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import Credentials from "next-auth/providers/credentials";

import clientPromise from "@/lib/mongodb";
import type { LoginCredentials, User } from "@/types";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),

  session: {
    strategy: "jwt",
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

        const client = await clientPromise;
        const db = client.db();

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
          createdAt: user.createdAt
        }
      },
    }),
  ],
})
