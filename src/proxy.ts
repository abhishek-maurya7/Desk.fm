import type { Session } from "next-auth";
import type { NextRequest } from "next/server";

import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { getBaseUrl } from "./lib/server/helpers";

async function requireAuth(req: NextRequest & { auth: Session | null }) {
  if (!req.auth?.user?.id) {
    const baseUrl = await getBaseUrl();
    return NextResponse.redirect(`${baseUrl}/login`);
  }

  return NextResponse.next();
}

export default auth(requireAuth);

export const config = {
  matcher: ["/rooms/:path*", "/dashboard"],
};
