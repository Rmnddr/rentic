import { stripe } from "@/lib/stripe/config";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET_CONNECT) {
    return NextResponse.json({ error: "Missing signature" }, { status: 401 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET_CONNECT,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const supabase = await createClient();

  // Idempotency check
  const { data: existing } = await supabase
    .from("webhook_events")
    .select("id")
    .eq("event_id", event.id)
    .single();

  if (existing) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  // Record event
  await supabase.from("webhook_events").insert({
    event_id: event.id,
    type: event.type,
  });

  switch (event.type) {
    case "account.updated": {
      const account = event.data.object;
      await supabase
        .from("shop_stripe_accounts")
        .update({
          charges_enabled: account.charges_enabled,
          payouts_enabled: account.payouts_enabled,
        })
        .eq("stripe_account_id", account.id);
      break;
    }

    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object;
      await supabase
        .from("payments")
        .update({ status: "succeeded" })
        .eq("stripe_payment_intent_id", paymentIntent.id);
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;
      await supabase
        .from("payments")
        .update({ status: "failed" })
        .eq("stripe_payment_intent_id", paymentIntent.id);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
