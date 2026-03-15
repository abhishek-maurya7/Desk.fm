import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { createUser, userExistsByEmail } from "@/lib/server/mongodb/helpers";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing name, email, or password" },
        { status: 400 }
      );
    }

    const exists = await userExistsByEmail(email);

    if (exists) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await createUser({
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    });

    return NextResponse.json({ userId: result.insertedId });

  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}