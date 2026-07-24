/* eslint-disable @next/next/no-img-element -- images marketing décoratives (placeholders Unsplash), remplacées plus tard par de vrais visuels */
"use client";

import { motion } from "motion/react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  Check,
  CreditCard,
  Store,
} from "lucide-react";

export function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <span className="font-bold text-primary-foreground">R</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Rentic
          </span>
        </div>
        <div className="hidden items-center gap-8 text-sm font-medium text-foreground md:flex">
          <a href="#fonctionnalites" className="transition-colors hover:text-primary">
            Fonctionnalités
          </a>
          <a href="#tarifs" className="transition-colors hover:text-primary">
            Tarifs
          </a>
          <a href="#faq" className="transition-colors hover:text-primary">
            FAQ
          </a>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="hidden text-sm font-semibold text-foreground transition-colors hover:text-primary sm:block"
          >
            Connexion
          </Link>
          <Link
            href="/sign-up"
            className="rounded-[16px] bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-organic transition-transform hover:-translate-y-0.5"
          >
            Essai gratuit
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 pb-32 pt-20 lg:grid-cols-2">
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-sm font-medium text-primary shadow-organic-sm"
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            Nouveau : Réservation 24/7 incluse
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl font-bold leading-[1.1] tracking-tight text-foreground lg:text-[64px]"
          >
            Votre magasin de location en ligne{" "}
            <span className="text-primary">en 15 minutes.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-lg text-lg leading-relaxed text-muted-foreground lg:text-xl"
          >
            Site vitrine, réservations 24/7, paiement sécurisé et gestion des
            stocks centralisée. Pensé pour les loueurs indépendants, sans aucune
            compétence technique requise.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col gap-4 sm:flex-row"
          >
            <Link
              href="/sign-up"
              className="flex items-center justify-center gap-2 rounded-[16px] bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground shadow-organic transition-transform hover:-translate-y-1 hover:shadow-organic-hover"
            >
              Essai gratuit 30 jours
              <ArrowRight className="h-5 w-5" />
            </Link>
            <p className="self-center text-center text-xs text-muted-foreground sm:text-left">
              Sans carte bancaire.
              <br />
              Annulable à tout moment.
            </p>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative"
        >
          <div className="absolute inset-0 rounded-[40px] bg-gradient-to-tr from-primary/20 to-accent/20 blur-3xl" />
          <div className="relative rounded-[32px] border border-muted bg-surface p-4 shadow-organic-hover">
            <img
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2000"
              alt="Tableau de bord Rentic"
              className="aspect-[4/3] w-full rounded-[20px] object-cover shadow-inner"
            />

            {/* Floating cards */}
            <div className="absolute -left-8 top-1/4 hidden items-center gap-4 rounded-[20px] bg-surface p-4 shadow-organic md:flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <Check className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Nouvelle résa
                </p>
                <p className="text-sm font-semibold text-foreground">
                  Pack Famille VTT
                </p>
              </div>
            </div>

            <div className="absolute -right-8 bottom-1/4 hidden items-center gap-4 rounded-[20px] bg-surface p-4 shadow-organic md:flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20">
                <CreditCard className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Paiement reçu
                </p>
                <p className="text-sm font-semibold text-foreground">
                  + 180,00 €
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Benefits */}
      <section
        id="fonctionnalites"
        className="border-y border-muted bg-surface py-20"
      >
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 text-center sm:grid-cols-3">
          <div className="space-y-4">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-[24px] bg-primary/10 text-primary">
              <Store className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground">
              Votre vitrine à votre image
            </h3>
            <p className="leading-relaxed text-muted-foreground">
              Personnalisez votre boutique en quelques clics. Vos couleurs,
              votre logo, votre matériel.
            </p>
          </div>
          <div className="space-y-4">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-[24px] bg-accent/10">
              <Calendar className="h-8 w-8 text-accent" />
            </div>
            <h3 className="text-xl font-bold text-foreground">
              Réservations 24/7
            </h3>
            <p className="leading-relaxed text-muted-foreground">
              Ne perdez plus de clients. Vos vacanciers réservent même quand
              vous êtes fermé ou occupé.
            </p>
          </div>
          <div className="space-y-4">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-[24px] bg-green-100 text-success">
              <BarChart3 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground">
              Gestion centralisée
            </h3>
            <p className="leading-relaxed text-muted-foreground">
              Fini le surbooking. Votre stock se met à jour automatiquement
              après chaque réservation en ligne ou en magasin.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="tarifs" className="mx-auto max-w-5xl px-6 py-32">
        <div className="mb-16 space-y-4 text-center">
          <h2 className="text-4xl font-bold text-foreground">
            Des tarifs simples. Zéro commission.
          </h2>
          <p className="text-xl text-muted-foreground">
            Vous encaissez 100% de vos locations, directement sur votre compte
            bancaire.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="rounded-[32px] border border-muted bg-surface p-10 shadow-organic">
            <h3 className="text-2xl font-bold text-foreground">Saison</h3>
            <p className="mt-2 text-muted-foreground">
              Pour les loueurs saisonniers (hiver ou été).
            </p>
            <div className="my-8">
              <span className="text-5xl font-bold text-foreground">450 €</span>
              <span className="text-muted-foreground"> / 6 mois</span>
            </div>
            <ul className="mb-8 space-y-4">
              <li className="flex items-center gap-3 text-foreground">
                <Check className="h-5 w-5 text-success" /> Boutique en ligne
                illimitée
              </li>
              <li className="flex items-center gap-3 text-foreground">
                <Check className="h-5 w-5 text-success" /> Paiements sécurisés
                via Stripe
              </li>
              <li className="flex items-center gap-3 text-foreground">
                <Check className="h-5 w-5 text-success" /> Support prioritaire
              </li>
            </ul>
            <Link
              href="/sign-up"
              className="block w-full rounded-[16px] border-2 border-primary py-4 text-center font-bold text-primary transition-colors hover:bg-primary/5"
            >
              Démarrer l&apos;essai gratuit
            </Link>
          </div>

          <div className="relative rounded-[32px] bg-primary p-10 text-primary-foreground shadow-organic">
            <div className="absolute right-10 top-0 -translate-y-1/2 rounded-full bg-accent px-4 py-1.5 text-sm font-bold text-accent-foreground">
              Le plus populaire
            </div>
            <h3 className="text-2xl font-bold">Annuel</h3>
            <p className="mt-2 text-primary-foreground/80">
              Pour une activité à l&apos;année.
            </p>
            <div className="my-8">
              <span className="text-5xl font-bold">790 €</span>
              <span className="text-primary-foreground/80"> / an</span>
            </div>
            <ul className="mb-8 space-y-4 text-primary-foreground">
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-accent" /> Tout le plan Saison
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-accent" /> Statistiques annuelles
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-accent" /> Formations vidéos
                incluses
              </li>
            </ul>
            <Link
              href="/sign-up"
              className="block w-full rounded-[16px] bg-surface py-4 text-center font-bold text-primary shadow-md transition-transform hover:scale-[1.02]"
            >
              Démarrer l&apos;essai gratuit
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
