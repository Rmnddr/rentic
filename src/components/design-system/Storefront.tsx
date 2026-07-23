"use client";
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Mountain } from 'lucide-react';

export function Storefront() {
  const [hasPhotos, setHasPhotos] = useState(true);

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Floating Controls for Demo */}
      <div className="fixed bottom-6 right-6 z-50 bg-surface p-4 rounded-[20px] shadow-organic border border-muted flex items-center gap-4">
        <span className="text-sm font-semibold text-foreground">Mode de démo :</span>
        <button 
          onClick={() => setHasPhotos(true)}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${hasPhotos ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
        >
          Avec photos
        </button>
        <button 
          onClick={() => setHasPhotos(false)}
           className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${!hasPhotos ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
        >
          Sans photos
        </button>
      </div>

      {/* Hero */}
      <div className="relative pt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-[32px] overflow-hidden min-h-[400px] flex flex-col items-center justify-center text-center p-8 shadow-organic">
          {hasPhotos ? (
            <>
              <img src="https://images.unsplash.com/photo-1551524164-687a55dd1126?auto=format&fit=crop&q=80&w=2000" alt="Boutique" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-accent/10" />
          )}

          <div className="relative z-10 space-y-6 flex flex-col items-center max-w-2xl">
            {/* Logo */}
            {hasPhotos ? (
               <img src="https://ui-avatars.com/api/?name=Altitude+Sports&background=0D8ABC&color=fff&size=128" alt="Logo" className="w-20 h-20 rounded-full border-4 border-surface shadow-lg" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-surface shadow-organic flex items-center justify-center">
                <Mountain className="w-10 h-10 text-primary" />
              </div>
            )}
           
            <div className="space-y-2">
              <h1 className={`text-4xl sm:text-5xl font-bold tracking-tight ${hasPhotos ? 'text-white' : 'text-foreground'}`}>
                Altitude Sports
              </h1>
              <p className={`text-lg ${hasPhotos ? 'text-white/90' : 'text-muted-foreground'}`}>
                Votre spécialiste montagne à Chamonix. Location de skis, snowboards et VTT électriques.
              </p>
            </div>
            
            <button className="bg-accent text-accent-foreground px-8 py-4 rounded-[16px] text-lg font-bold hover:-translate-y-1 transition-transform shadow-organic hover:shadow-organic-hover flex items-center gap-2 mt-4">
              Réserver en ligne
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Catalog */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 space-y-16">
        
        {/* Packs */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-8">Nos Packs Les Plus Demandés</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <motion.div whileHover={{ y: -4 }} key={i} className="bg-surface rounded-[24px] overflow-hidden shadow-organic">
                <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                  {hasPhotos ? (
                     <img src="https://images.unsplash.com/photo-1565992441121-4367c2967103?auto=format&fit=crop&q=80&w=800" alt="Ski" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Mountain className="w-16 h-16 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="bg-accent text-accent-foreground text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm">Pack</span>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Pack Ski Évolution</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">Parfait pour progresser sur toutes les pistes en toute sécurité. Skis tolérants et chaussures confortables.</p>
                  </div>
                  <div className="flex items-end justify-between pt-4 border-t border-muted">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1">À partir de</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-foreground">25 €</span>
                        <span className="text-sm text-muted-foreground">/jour</span>
                      </div>
                    </div>
                    <button className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-5 py-2.5 rounded-[12px] font-bold text-sm transition-colors">
                      Choisir
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
