import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Site is temporarily offline. Set to `false` (or revert this change) and
 * redeploy to bring the website back online.
 */
const SITE_OFFLINE = true;

const offlineHtml = `<!doctype html>
<html lang="da">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Midlertidigt lukket</title>
<style>
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
  font-family:system-ui,-apple-system,sans-serif;background:#f5f5f4;color:#1c1917;text-align:center;padding:1.5rem}
  h1{font-size:1.75rem;margin:0 0 .5rem}
  p{margin:0;color:#57534e}
</style>
</head>
<body>
  <main>
    <h1>Siden er midlertidigt lukket</h1>
    <p>Vi er snart tilbage.</p>
  </main>
</body>
</html>`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const authProxy = auth as unknown as (req: NextRequest, ctx: any) => Promise<Response> | Response;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function proxy(req: NextRequest, ctx: any) {
  const { pathname } = req.nextUrl;

  // Keep payment webhooks working so Stripe events aren't lost while offline.
  const isWebhook = pathname.startsWith("/api/webhooks/");

  if (SITE_OFFLINE && !isWebhook) {
    return new Response(offlineHtml, {
      status: 503,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Retry-After": "86400",
        "Cache-Control": "no-store",
      },
    });
  }

  if (pathname.startsWith("/admin")) {
    return authProxy(req, ctx);
  }
}

export const config = {
  // Run on every request except Next.js internals.
  matcher: ["/((?!_next/static|_next/image).*)"],
};
