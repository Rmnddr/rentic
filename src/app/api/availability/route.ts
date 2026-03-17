import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const shopId = searchParams.get("shopId");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  if (!shopId || !startDate || !endDate) {
    return NextResponse.json(
      { error: "shopId, startDate et endDate requis." },
      { status: 400 },
    );
  }

  const supabase = await createClient();

  // Get all products for this shop
  const { data: products } = await supabase
    .from("products")
    .select("id, name, price_web, category_id")
    .eq("shop_id", shopId);

  if (!products) {
    return NextResponse.json({ availability: [] });
  }

  // Check availability for each product
  const availability = await Promise.all(
    products.map(async (product) => {
      const { data: available } = await supabase.rpc("check_availability", {
        p_product_id: product.id,
        p_start_date: startDate,
        p_end_date: endDate,
      });

      return {
        productId: product.id,
        name: product.name,
        priceWeb: product.price_web,
        available: available ?? 0,
      };
    }),
  );

  return NextResponse.json({ availability });
}
