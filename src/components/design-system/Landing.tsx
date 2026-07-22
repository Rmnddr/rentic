"use client";
import React from 'react';
import { motion } from 'motion/react';
import { Check, ArrowRight, Store, Calendar, CreditCard, Laptop, Smartphone, BarChart3, Star, ShieldCheck } from 'lucide-react';

export function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-white font-bold">R</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">Rentic</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-foreground">
          <a href="#fonctionnalites" className="hover:text-primary transition-colors">Fonctionnalités</a>
          <a href="#tarifs" className="hover:text-primary transition-colors">Tarifs</a>
          <a href="#faq" className="hover:text-primary transition-colors">FAQ</a>
        </div>
        <div className="flex items-center gap-4">
          <button className="hidden sm:block text-sm font-semibold text-foreground hover:text-primary transition-colors">Connexion</button>
          <button className="bg-primary text-primary-foreground px-5 py-2.5 rounded-[16px] text-sm font-semibold hover:-translate-y-0.5 transition-transform shadow-organic">
            Essai gratuit
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-32 grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface shadow-organic-sm text-sm font-medium text-primary">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Nouveau : Réservation 24/7 incluse
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl lg:text-[64px] font-bold tracking-tight leading-[1.1] text-foreground">
            Votre magasin de location en ligne <span className="text-primary">en 15 minutes.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-lg">
            Site vitrine, réservations 24/7, paiement sécurisé et gestion des stocks centralisée. Pensé pour les loueurs indépendants, sans aucune compétence technique requise.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row gap-4">
            <button className="bg-primary text-primary-foreground px-8 py-4 rounded-[16px] text-lg font-semibold hover:-translate-y-1 transition-transform shadow-organic hover:shadow-organic-hover flex items-center justify-center gap-2">
              Essai gratuit 30 jours
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-xs text-muted-foreground text-center sm:text-left self-center">
              Sans carte bancaire.<br/>Annulable à tout moment.
            </p>
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.5 }} className="relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-[40px] blur-3xl" />
          <div className="relative bg-surface p-4 rounded-[32px] shadow-organic-hover border border-muted">
            <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2000" alt="Dashboard Rentic" className="rounded-[20px] w-full object-cover aspect-[4/3] shadow-inner" />
            
            {/* Floating Elements to show features */}
            <div className="absolute -left-8 top-1/4 bg-surface p-4 rounded-[20px] shadow-organic flex items-center gap-4 hidden md:flex">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="text-success w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nouvelle résa</p>
                <p className="text-sm font-semibold text-foreground">Pack Famille VTT</p>
              </div>
            </div>
            
            <div className="absolute -right-8 bottom-1/4 bg-surface p-4 rounded-[20px] shadow-organic flex items-center gap-4 hidden md:flex">
               <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <CreditCard className="text-accent w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Paiement reçu</p>
                <p className="text-sm font-semibold text-foreground">+ 180,00 €</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Benefits Band */}
      <section className="bg-surface py-20 border-y border-muted">
        <div className="max-w-7xl mx-auto px-6 grid sm:grid-cols-3 gap-12 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-[24px] bg-primary/10 text-primary mx-auto flex items-center justify-center mb-6">
              <Store className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Votre vitrine à votre image</h3>
            <p className="text-muted-foreground leading-relaxed">Personnalisez votre boutique en quelques clics. Vos couleurs, votre logo, votre matériel.</p>
          </div>
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-[24px] bg-accent/10 text-accent-foreground mx-auto flex items-center justify-center mb-6">
              <Calendar className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Réservations 24/7</h3>
            <p className="text-muted-foreground leading-relaxed">Ne perdez plus de clients. Vos vacanciers réservent même quand vous êtes fermé ou occupé.</p>
          </div>
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-[24px] bg-green-100 text-success mx-auto flex items-center justify-center mb-6">
              <BarChart3 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Gestion centralisée</h3>
            <p className="text-muted-foreground leading-relaxed">Fini le surbooking. Votre stock se met à jour automatiquement après chaque réservation en ligne ou en magasin.</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="tarifs" className="py-32 max-w-5xl mx-auto px-6">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-bold text-foreground">Des tarifs simples. Zéro commission.</h2>
          <p className="text-xl text-muted-foreground">Vous encaissez 100% de vos locations, directement sur votre compte bancaire.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-surface rounded-[32px] p-10 shadow-organic border border-muted">
            <h3 className="text-2xl font-bold text-foreground">Saison</h3>
            <p className="text-muted-foreground mt-2">Pour les loueurs saisonniers (hiver ou été).</p>
            <div className="my-8">
              <span className="text-5xl font-bold text-foreground">450 €</span>
              <span className="text-muted-foreground"> / 6 mois</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-foreground"><Check className="text-success w-5 h-5" /> Boutique en ligne illimitée</li>
              <li className="flex items-center gap-3 text-foreground"><Check className="text-success w-5 h-5" /> Paiements sécurisés via Stripe</li>
              <li className="flex items-center gap-3 text-foreground"><Check className="text-success w-5 h-5" /> Support prioritaire</li>
            </ul>
            <button className="w-full border-2 border-primary text-primary font-bold py-4 rounded-[16px] hover:bg-primary/5 transition-colors">Démarrer l'essai gratuit</button>
          </div>

          <div className="bg-primary text-primary-foreground rounded-[32px] p-10 shadow-organic relative">
            <div className="absolute top-0 right-10 -translate-y-1/2 bg-accent text-accent-foreground font-bold px-4 py-1.5 rounded-full text-sm">
              Le plus populaire
            </div>
            <h3 className="text-2xl font-bold">Annuel</h3>
            <p className="text-primary-foreground/80 mt-2">Pour une activité à l'année.</p>
            <div className="my-8">
              <span className="text-5xl font-bold">790 €</span>
              <span className="text-primary-foreground/80"> / an</span>
            </div>
            <ul className="space-y-4 mb-8 text-primary-foreground">
              <li className="flex items-center gap-3"><Check className="text-accent w-5 h-5" /> Tout le plan Saison</li>
              <li className="flex items-center gap-3"><Check className="text-accent w-5 h-5" /> Statistiques annuelles</li>
              <li className="flex items-center gap-3"><Check className="text-accent w-5 h-5" /> Formations vidéos incluses</li>
            </ul>
            <button className="w-full bg-surface text-primary font-bold py-4 rounded-[16px] hover:scale-[1.02] transition-transform shadow-md">Démarrer l'essai gratuit</button>
          </div>
        </div>
      </section>

    </div>
  );
}
