import { createClient } from "@/lib/supabase/server";

export async function getDashboardMetrics() {
  const supabase = await createClient();
  const shopId = (await supabase.rpc("get_user_shop_id")).data;
  if (!shopId) return null;

  const today = new Date().toISOString().split("T")[0];
  const monthStart = `${today.slice(0, 7)}-01`;

  const [todayRes, upcomingRes, monthRevenue, totalUnits, reservedUnits] =
    await Promise.all([
      // Reservations today
      supabase
        .from("reservations")
        .select("id", { count: "exact", head: true })
        .eq("shop_id", shopId)
        .lte("start_date", today)
        .gte("end_date", today)
        .in("status", ["confirmed", "in_progress"]),

      // Upcoming reservations
      supabase
        .from("reservations")
        .select("id", { count: "exact", head: true })
        .eq("shop_id", shopId)
        .gt("start_date", today)
        .eq("status", "confirmed"),

      // Monthly revenue
      supabase
        .from("payments")
        .select("amount")
        .eq("status", "succeeded")
        .gte("created_at", monthStart),

      // Total stock units
      supabase
        .from("product_units")
        .select("id", { count: "exact", head: true })
        .in("status", ["available", "maintenance"]),

      // Currently reserved units (rough approximation)
      supabase
        .from("reservation_unit_assignments")
        .select("id", { count: "exact", head: true }),
    ]);

  const revenue = (monthRevenue.data ?? []).reduce(
    (sum, p) => sum + (p.amount ?? 0),
    0,
  );
  const total = totalUnits.count ?? 0;
  const reserved = reservedUnits.count ?? 0;
  const occupancy = total > 0 ? Math.round((reserved / total) * 100) : 0;

  return {
    reservationsToday: todayRes.count ?? 0,
    upcomingReservations: upcomingRes.count ?? 0,
    monthlyRevenue: revenue,
    occupancyRate: occupancy,
  };
}

export async function getTodayReservations() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data } = await supabase
    .from("reservations")
    .select("id, customer_name, customer_phone, start_date, end_date, status, total_price")
    .lte("start_date", today)
    .gte("end_date", today)
    .in("status", ["confirmed", "in_progress"])
    .order("created_at", { ascending: true });

  return data ?? [];
}

export async function getNext7DaysReservations() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];
  const nextWeek = new Date(Date.now() + 7 * 86400000)
    .toISOString()
    .split("T")[0];

  const { data } = await supabase
    .from("reservations")
    .select(
      "id, customer_name, start_date, end_date, status, reservation_items(id, product_id, quantity)",
    )
    .gte("start_date", today)
    .lte("start_date", nextWeek)
    .eq("status", "confirmed")
    .order("start_date", { ascending: true });

  return data ?? [];
}
