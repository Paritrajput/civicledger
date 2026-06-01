import { NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

export function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const pathname = request.nextUrl.pathname;

if (!token) {
  if (
    pathname.startsWith("/public-sec") ||
    pathname.startsWith("/contractor-sec") ||
    pathname.startsWith("/gov-sec")
  ) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  return NextResponse.next();
}

  try {
    const decoded = jwtDecode(token);
    const authPages = [
  "/login",
  "/authenticate/public-auth/login",
  "/authenticate/contractor-auth/login",
  "/authenticate/gov-auth/login",
];

if (authPages.includes(pathname)) {
  switch (decoded.role) {
    case "public":
      return NextResponse.redirect(
        new URL("/public-sec", request.url)
      );

    case "contractor":
      return NextResponse.redirect(
        new URL("/contractor-sec", request.url)
      );

    case "gov":
      return NextResponse.redirect(
        new URL("/gov-sec", request.url)
      );

    default:
      return NextResponse.next();
  }
}

    // Redirect logged-in users from landing page
    if (pathname === "/") {
      if (decoded.role === "public") {
        return NextResponse.redirect(
          new URL("/public-sec", request.url)
        );
      }

      if (decoded.role === "contractor") {
        return NextResponse.redirect(
          new URL("/contractor-sec", request.url)
        );
      }

      if (decoded.role === "gov") {
        return NextResponse.redirect(
          new URL("/gov-sec", request.url)
        );
      }
    }

    // Protect public routes
    if (
      pathname.startsWith("/public-sec") &&
      decoded.role !== "public"
    ) {
      return NextResponse.redirect(
        new URL("/", request.url)
      );
    }

    // Protect contractor routes
    if (
      pathname.startsWith("/contractor-sec") &&
      decoded.role !== "contractor"
    ) {
      return NextResponse.redirect(
        new URL("/", request.url)
      );
    }

    // Protect gov routes
    if (
      pathname.startsWith("/gov-sec") &&
      decoded.role !== "gov"
    ) {
      return NextResponse.redirect(
        new URL("/", request.url)
      );
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware Error:", error);

    const response = NextResponse.redirect(
      new URL("/", request.url)
    );

    response.cookies.delete("token");

    return response;
  }
}

export const config = {
  matcher: [
    "/",

    "/login",

    "/authenticate/public-auth/login",
    "/authenticate/contractor-auth/login",
    "/authenticate/gov-auth/login",

    "/public-sec/:path*",
    "/contractor-sec/:path*",
    "/gov-sec/:path*",
  ],
};