"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpAction } from "@/features/auth/actions";
import Link from "next/link";
import { useState } from "react";

export function SignUpForm() {
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string[]> | undefined
  >();
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors(undefined);
    setSuccess(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password.length < 8) {
      setFieldErrors({
        password: ["Le mot de passe doit contenir au moins 8 caractères."],
      });
      return;
    }

    if (password !== confirmPassword) {
      setFieldErrors({
        confirmPassword: ["Les mots de passe ne correspondent pas."],
      });
      return;
    }

    setIsLoading(true);

    const result = await signUpAction(formData);

    if (result.success) {
      setSuccess(result.data.message);
    } else {
      setError(result.error);
      setFieldErrors(result.fieldErrors);
    }

    setIsLoading(false);
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-h2">Créer un compte</CardTitle>
        <CardDescription>
          Inscrivez-vous pour gérer votre magasin de location
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="rounded-lg bg-success/10 p-4 text-center text-sm text-success">
            {success}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="vous@exemple.fr"
                  required
                  autoComplete="email"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                {fieldErrors?.password && (
                  <p className="text-sm text-destructive">
                    {fieldErrors.password[0]}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">
                  Confirmer le mot de passe
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                {fieldErrors?.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {fieldErrors.confirmPassword[0]}
                  </p>
                )}
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Création en cours..." : "Créer mon compte"}
              </Button>
            </div>
            <div className="mt-4 text-center text-body-sm text-muted-foreground">
              Déjà un compte ?{" "}
              <Link
                href="/(auth)/login"
                className="text-primary underline underline-offset-4"
              >
                Se connecter
              </Link>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
