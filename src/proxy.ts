import type { Session } from "next-auth";
import type { NextRequest } from "next/server";

import { auth } from "@/auth";
import { NextResponse } from "next/server";

function requireAuth(req: NextRequest & { auth: Session | null }) {
  if (!req.auth?.user?.id) {
    return NextResponse.redirect("/login");
  }

  return NextResponse.next();
}

export default auth(requireAuth);

export const config = {
  matcher: ["/rooms/:path*", "/dashboard"],
};
