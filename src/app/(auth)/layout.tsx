import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background p-4">
      <Link
        href="/"
        className="flex items-center gap-2"
        aria-label="Retour à l'accueil Rentic"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary shadow-organic">
          <span className="text-lg font-bold text-primary-foreground">R</span>
        </span>
        <span className="text-2xl font-bold tracking-tight text-foreground">
          Rentic
        </span>
      </Link>
      {children}
    </main>
  );
}
