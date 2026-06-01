import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    return NextResponse.json({
      authenticated: true,
      user: decoded,
    });
  } catch {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }
}