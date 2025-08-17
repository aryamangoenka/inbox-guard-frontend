// apps/web/middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublic = createRouteMatcher([
  "/", "/login(.*)",
  "/robots.ts", "/sitemap.ts", "/favicon.ico",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublic(req)) {
    await auth.protect();            // <-- no parentheses on auth; await it
  }
});

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)",   // exclude static files & /_next
    "/", "/(api)(.*)",
  ],
};
