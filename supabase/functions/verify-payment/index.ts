// Supabase Edge Function: verify-payment
// Deploy this with the Supabase CLI to your project functions.
// Required env vars (set in function env):
// SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAILS (comma-separated)

// Use explicit deno.land std URL to avoid bundler import resolution issues
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";

serve(async (req: Request) => {
  try {
    // Accept several env names so CLI or Dashboard secrets can be used.
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || Deno.env.get("APP_SUPABASE_URL") || Deno.env.get("PROJECT_URL") || "";
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SERVICE_ROLE_KEY") || Deno.env.get("APP_SERVICE_ROLE_KEY") || "";
    // Note: ADMIN_EMAILS is no longer required when using a `role` on profiles.
    if (!SUPABASE_URL || !SERVICE_ROLE) {
      return new Response(JSON.stringify({ error: "Server not configured" }), { status: 500 });
    }

    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing auth token" }), { status: 401 });
    }
    const token = authHeader.replace("Bearer ", "");

    // Get user info from Supabase Auth endpoint
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: SERVICE_ROLE }
    });
    if (!userRes.ok) return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401 });
    const user = await userRes.json();
    // Verify the user's profile.role using the service_role key
    if (!user?.id) return new Response(JSON.stringify({ error: "Invalid user" }), { status: 401 });
    const profRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}`, {
      headers: {
        Authorization: `Bearer ${SERVICE_ROLE}`,
        apikey: SERVICE_ROLE,
        "Content-Type": "application/json"
      }
    });
    if (!profRes.ok) return new Response(JSON.stringify({ error: "Unable to fetch profile" }), { status: 500 });
    const profJson = await profRes.json();
    const profile = Array.isArray(profJson) ? profJson[0] : profJson;
    if (!profile || profile.role !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
    }

    const body = await req.json();
    const payment_id = body?.payment_id;
    if (!payment_id) return new Response(JSON.stringify({ error: "Missing payment_id" }), { status: 400 });

    // Mark payment as verified using service_role key
    const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/payments?id=eq.${payment_id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${SERVICE_ROLE}`,
        apikey: SERVICE_ROLE,
        "Content-Type": "application/json",
        Prefer: "return=representation"
      },
      body: JSON.stringify({ status: "verified", updated_at: new Date().toISOString() })
    });

    if (!updateRes.ok) {
      const txt = await updateRes.text();
      return new Response(txt, { status: updateRes.status });
    }

    const updated = await updateRes.json();
    const payment = Array.isArray(updated) ? updated[0] : updated;

    // If this payment is linked to an order, mark order as paid
    if (payment?.order_id) {
      await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${payment.order_id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${SERVICE_ROLE}`,
          apikey: SERVICE_ROLE,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ payment_status: "paid", updated_at: new Date().toISOString() })
      });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
