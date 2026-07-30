import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const role = token?.role;
    const pathname = req.nextUrl.pathname;

    // Loop protection: If token is valid but role is missing or invalid, redirect to login.
    if (!role || (role !== "IT_STAFF" && role !== "EMPLOYEE")) {
      return NextResponse.redirect(new URL("/login?error=MissingRole", req.url));
    }

    // Direct /dashboard to role-specific dashboard
    if (pathname === "/dashboard") {
      if (role === "IT_STAFF") {
        return NextResponse.redirect(new URL("/dashboard/it", req.url));
      }
      return NextResponse.redirect(new URL("/dashboard/employee", req.url));
    }

    // Protect IT Dashboard - only allow IT_STAFF
    if (pathname.startsWith("/dashboard/it") && role !== "IT_STAFF") {
      return NextResponse.redirect(new URL("/dashboard/employee", req.url));
    }

    // Protect Employee Dashboard - only allow EMPLOYEE
    if (pathname.startsWith("/dashboard/employee") && role !== "EMPLOYEE") {
      return NextResponse.redirect(new URL("/dashboard/it", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};
