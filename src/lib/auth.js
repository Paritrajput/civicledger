import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function getUserFromRequest(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      throw new Error("Unauthorized");
    }

    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new Error("Invalid token");
  }
}
