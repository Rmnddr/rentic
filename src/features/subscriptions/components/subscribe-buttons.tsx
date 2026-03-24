"use client";

import { Button } from "@/components/ui/button";
import {
  createCheckoutSessionAction,
  createCustomerPortalAction,
} from "@/features/subscriptions/actions";
import { useState } from "react";

export function SubscribeButton({
  plan,
  label,
}: {
  plan: "season" | "annual";
  label: string;
}) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    setIsLoading(true);
    await createCheckoutSessionAction(plan);
    // Redirect happens server-side
  }

  return (
    <Button onClick={handleClick} disabled={isLoading} className="w-full">
      {isLoading ? "Redirection vers Stripe..." : label}
    </Button>
  );
}

export function ManageBillingButton() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    setIsLoading(true);
    await createCustomerPortalAction();
  }

  return (
    <Button variant="outline" onClick={handleClick} disabled={isLoading}>
      {isLoading ? "Redirection..." : "Gérer la facturation"}
    </Button>
  );
}
