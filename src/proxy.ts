import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Match all routes except Next.js internals, static files and API routes
    "/((?!_next|_vercel|api|.*\\..*).*)",
  ],
};
