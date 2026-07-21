import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

// Routes that don't require authentication
const PUBLIC_ROUTES = ["/login", "/sign-up", "/auth/confirm", "/s/", "/api/"];

// Routes restricted to owner role only
const OWNER_ONLY_ROUTES = ["/settings", "/website", "/subscription", "/pricing", "/team"];

// Routes réservées aux administrateurs plateforme (Epic 9)
const ADMIN_ROUTES = ["/admin"];

// Routes accessibles même sans abonnement actif : sinon le loueur ne pourrait
// plus se réabonner ni se déconnecter (impasse).
const SUBSCRIPTION_EXEMPT_ROUTES = ["/subscription", "/settings", "/onboarding", "/admin"];

// Statuts pour lesquels l'accès au back-office est coupé. `past_due` reste
// autorisé : c'est une période de grâce, signalée par le bandeau d'alerte.
const BLOCKING_SUBSCRIPTION_STATUSES = ["canceled", "expired"];

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Allow public routes and landing page
  const isPublicRoute =
    pathname === "/" ||
    PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  if (isPublicRoute) {
    return supabaseResponse;
  }

  // Redirect unauthenticated users to login
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Routes d'administration plateforme
  if (ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
    const { data: isAdmin } = await supabase.rpc("is_platform_admin");

    if (isAdmin !== true) {
      // 404 plutôt que redirection : ne pas révéler l'existence de /admin
      return NextResponse.rewrite(new URL("/not-found", request.url));
    }

    return supabaseResponse;
  }

  // Check owner-only routes
  const isOwnerRoute = OWNER_ONLY_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  if (isOwnerRoute) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "owner") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      url.searchParams.set("error", "owner-only");
      return NextResponse.redirect(url);
    }
  }

  // Blocage abonnement inactif (story 7.5)
  const isExempt = SUBSCRIPTION_EXEMPT_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  if (!isExempt) {
    const { data: shopId } = await supabase.rpc("get_user_shop_id");

    if (shopId) {
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("status")
        .eq("shop_id", shopId)
        .single();

      // Pas d'abonnement du tout = onboarding non terminé, on laisse passer.
      if (
        subscription &&
        BLOCKING_SUBSCRIPTION_STATUSES.includes(subscription.status)
      ) {
        const url = request.nextUrl.clone();
        url.pathname = "/subscription";
        url.searchParams.set("blocked", subscription.status);
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
