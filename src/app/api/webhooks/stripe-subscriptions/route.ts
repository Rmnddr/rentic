import { stripe } from "@/lib/stripe/config";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET_SUBSCRIPTIONS) {
    return NextResponse.json({ error: "Missing signature" }, { status: 401 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET_SUBSCRIPTIONS,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const supabase = await createClient();

  // Idempotency
  const { data: existing } = await supabase
    .from("webhook_events")
    .select("id")
    .eq("event_id", event.id)
    .single();

  if (existing) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  await supabase.from("webhook_events").insert({
    event_id: event.id,
    type: event.type,
  });

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const shopId = session.metadata?.shop_id;
      const plan = session.metadata?.plan;

      if (shopId && session.subscription) {
        await supabase
          .from("subscriptions")
          .update({
            stripe_subscription_id: session.subscription as string,
            stripe_customer_id: session.customer as string,
            plan: plan || "season",
            status: "active",
          })
          .eq("shop_id", shopId);
      }
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as unknown as Record<string, unknown>;
      if (invoice.subscription) {
        await supabase
          .from("subscriptions")
          .update({
            status: "active",
            current_period_start: new Date((invoice.period_start as number) * 1000).toISOString(),
            current_period_end: new Date((invoice.period_end as number) * 1000).toISOString(),
          })
          .eq("stripe_subscription_id", invoice.subscription as string);
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as unknown as Record<string, unknown>;
      if (invoice.subscription) {
        await supabase
          .from("subscriptions")
          .update({ status: "past_due" })
          .eq("stripe_subscription_id", invoice.subscription as string);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      await supabase
        .from("subscriptions")
        .update({ status: "canceled" })
        .eq("stripe_subscription_id", subscription.id);
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as unknown as Record<string, unknown>;
      await supabase
        .from("subscriptions")
        .update({
          cancel_at_period_end: subscription.cancel_at_period_end as boolean,
          current_period_start: new Date((subscription.current_period_start as number) * 1000).toISOString(),
          current_period_end: new Date((subscription.current_period_end as number) * 1000).toISOString(),
        })
        .eq("stripe_subscription_id", subscription.id as string);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
