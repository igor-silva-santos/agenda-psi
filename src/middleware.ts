import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Apenas autenticação e role
    const token = req.nextauth.token;
    if (!token) {
      return NextResponse.redirect(new URL("/conta/login", req.url));
    }

    if (
      req.nextUrl.pathname.startsWith("/portal") &&
      token?.role !== "PACIENTE"
    ) {
      return NextResponse.redirect(new URL("/conta/login", req.url));
    }

    if (
      req.nextUrl.pathname.startsWith("/admin") &&
      token?.role !== "ADMIN"
    ) {
      return NextResponse.redirect(new URL("/conta/login", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/conta/login",
    },
  }
);

export const config = {
  matcher: ["/portal/:path*", "/admin/:path*"],
};
