"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Minus, Plus, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { fr } from 'date-fns/locale';

const STEPS = ["Dates", "Matériel", "Participants", "Paiement"];

export function BookingFunnel() {
  const [currentStep, setCurrentStep] = useState(1); // 0 to 3

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  return (
    <div className="min-h-screen bg-background pb-32">
      
      {/* Mobile Header */}
      <div className="bg-surface sticky top-0 z-40 border-b border-muted shadow-sm">
        <div className="flex items-center justify-between px-4 h-16">
          <button onClick={prevStep} className="p-2 -ml-2 text-foreground hover:bg-muted rounded-full transition-colors" disabled={currentStep === 0}>
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="font-bold text-foreground">Réservation</div>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Stepper */}
        <div className="px-6 py-4">
          <div className="flex items-center gap-2">
            {STEPS.map((step, idx) => (
              <div key={idx} className="flex-1 flex flex-col gap-2">
                <div className={`h-1.5 rounded-full transition-colors ${idx <= currentStep ? 'bg-primary' : 'bg-muted'}`} />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[10px] font-bold uppercase tracking-wider">
            <span className="text-primary">{STEPS[currentStep]}</span>
            <span className="text-muted-foreground">{currentStep < 3 ? STEPS[currentStep + 1] : ''}</span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 sm:p-6 max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {currentStep === 0 && (
             <motion.div
             key="step-dates"
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: -20 }}
             className="space-y-6"
           >
             <h2 className="text-2xl font-bold text-foreground">Quand partez-vous ?</h2>
             
             <div className="bg-surface rounded-[24px] p-4 shadow-organic flex justify-center">
                <style>{`
                  .rdp-root {
                    --rdp-accent-color: var(--color-primary);
                    --rdp-background-color: var(--color-primary);
                    --rdp-accent-background-color: var(--color-primary);
                    --rdp-day_button-border-radius: 12px;
                    --rdp-selected-border: 2px solid var(--color-primary);
                    margin: 0;
                  }
                  .rdp-day_button:hover:not([disabled]):not(.rdp-selected) {
                    background-color: var(--color-muted);
                  }
                `}</style>
                <DayPicker 
                  mode="range"
                  locale={fr}
                  numberOfMonths={1}
                  className="p-0 m-0"
                />
             </div>
           </motion.div>
          )}

          {currentStep === 1 && (
            <motion.div
              key="step-materiel"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-foreground">Choisissez votre matériel</h2>
              
              <div className="space-y-4">
                {/* Pack 1 : Ski Évolution (Added to cart with option) */}
                <div className="bg-surface rounded-[24px] p-4 shadow-organic flex flex-col gap-4 border-2 border-primary/20">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-[16px] bg-muted overflow-hidden flex-shrink-0 relative">
                      <img src="https://images.unsplash.com/photo-1565992441121-4367c2967103?auto=format&fit=crop&q=80&w=200" alt="Ski" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col justify-between py-1">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-accent/20 text-accent-foreground text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md">Pack</span>
                          <span className="text-xs text-success font-semibold flex items-center gap-1"><Check className="w-3 h-3"/> Dispo</span>
                        </div>
                        <h3 className="font-bold text-foreground leading-tight">Pack Ski Évolution</h3>
                        <p className="text-[11px] text-muted-foreground mt-1">Inclus : Skis, Chaussures, Bâtons</p>
                      </div>
                      <div className="font-bold text-primary mt-2">25 € <span className="text-xs font-normal text-muted-foreground">/j</span></div>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="bg-muted/50 rounded-[16px] p-3 space-y-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Options recommandées</div>
                    
                    <label className="flex items-center justify-between cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-[6px] bg-primary flex items-center justify-center transition-colors">
                           <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                        <span className="text-sm font-semibold text-foreground">Casque adulte</span>
                      </div>
                      <span className="text-sm font-bold text-muted-foreground">+5 € <span className="text-[10px] font-normal">/j</span></span>
                    </label>

                    <label className="flex items-center justify-between cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-[6px] border-2 border-muted-foreground/30 flex items-center justify-center group-hover:border-primary transition-colors bg-surface">
                        </div>
                        <span className="text-sm font-semibold text-foreground">Assurance vol/casse</span>
                      </div>
                      <span className="text-sm font-bold text-muted-foreground">+2 € <span className="text-[10px] font-normal">/j</span></span>
                    </label>
                  </div>
                  
                  {/* Cart controls embedded for visibility */}
                  <div className="flex items-center justify-between border-t border-muted pt-4 mt-2">
                    <div className="flex items-center gap-3 bg-muted rounded-[12px] p-1">
                      <button className="w-8 h-8 flex items-center justify-center rounded-[10px] bg-surface shadow-sm text-foreground hover:bg-muted-foreground/10"><Minus className="w-4 h-4" /></button>
                      <span className="font-bold w-4 text-center">1</span>
                      <button className="w-8 h-8 flex items-center justify-center rounded-[10px] bg-surface shadow-sm text-foreground hover:bg-muted-foreground/10"><Plus className="w-4 h-4" /></button>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-muted-foreground font-medium">1 pers. + 1 option</span>
                      <span className="font-bold text-primary text-lg">30 € <span className="text-[10px] font-normal text-muted-foreground">/j</span></span>
                    </div>
                  </div>
                </div>

                {/* Pack 2 : Snowboard (Not added to cart yet) */}
                <div className="bg-surface rounded-[24px] p-4 shadow-organic flex flex-col gap-4">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-[16px] bg-muted overflow-hidden flex-shrink-0 relative">
                      <img src="https://images.unsplash.com/photo-1478144596244-88481ff23b24?auto=format&fit=crop&q=80&w=200" alt="Snowboard" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col justify-between py-1">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-accent/20 text-accent-foreground text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md">Pack</span>
                        </div>
                        <h3 className="font-bold text-foreground leading-tight">Pack Snowboard Sensation</h3>
                        <p className="text-[11px] text-muted-foreground mt-1">Inclus : Snowboard, Boots</p>
                      </div>
                      <div className="font-bold text-primary mt-2">28 € <span className="text-xs font-normal text-muted-foreground">/j</span></div>
                    </div>
                  </div>

                  {/* Options (Greyed out/inactive look since not in cart yet) */}
                  <div className="bg-muted/30 rounded-[16px] p-3 space-y-3 opacity-60">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Options recommandées</div>
                    
                    <label className="flex items-center justify-between cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-[6px] border-2 border-muted-foreground/30 flex items-center justify-center group-hover:border-primary transition-colors bg-surface">
                        </div>
                        <span className="text-sm font-semibold text-foreground">Casque adulte</span>
                      </div>
                      <span className="text-sm font-bold text-muted-foreground">+5 € <span className="text-[10px] font-normal">/j</span></span>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-end border-t border-muted pt-4 mt-2">
                    <button className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-6 py-2.5 rounded-[12px] font-bold text-sm transition-colors w-full text-center">
                      Ajouter au panier
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
             <motion.div
             key="step-participants"
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: -20 }}
             className="space-y-6"
           >
             <h2 className="text-2xl font-bold text-foreground">Détails des participants</h2>
             
             <div className="bg-surface rounded-[24px] p-5 shadow-organic border-l-4 border-primary">
               <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                 <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs">1</span>
                 Pack Ski Évolution
               </h3>
               
               <div className="space-y-4">
                 <div>
                   <label className="block text-sm font-semibold text-foreground mb-2">Taille (cm)</label>
                   <input type="number" placeholder="Ex: 175" className="w-full bg-muted border-none rounded-[12px] px-4 py-3 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary outline-none transition-shadow" />
                 </div>
                 <div>
                   <label className="block text-sm font-semibold text-foreground mb-2">Pointure</label>
                   <input type="number" placeholder="Ex: 42" className="w-full bg-muted border-none rounded-[12px] px-4 py-3 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary outline-none transition-shadow" />
                 </div>
               </div>
             </div>
           </motion.div>
          )}
          {currentStep === 3 && (
             <motion.div
             key="step-paiement"
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: -20 }}
             className="space-y-6"
           >
             <h2 className="text-2xl font-bold text-foreground">Paiement sécurisé</h2>
             
             <div className="bg-surface rounded-[24px] p-5 shadow-organic space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-muted">
                  <span className="text-muted-foreground font-semibold">Total à payer</span>
                  <span className="text-2xl font-bold text-foreground">90,00 €</span>
                </div>
                
                {/* Mockup Stripe Payment Element */}
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Informations de carte</label>
                    <div className="h-12 w-full bg-muted rounded-[12px] border-none flex items-center px-4 gap-2 text-muted-foreground">
                      <ShieldCheck className="w-5 h-5 text-success" />
                      <span className="text-sm">Saisie sécurisée Stripe...</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 mt-6">
                    <input type="checkbox" className="mt-1 rounded text-primary focus:ring-primary bg-muted border-none" defaultChecked />
                    <span className="text-xs text-muted-foreground leading-relaxed">
                      J&apos;accepte les conditions générales de location et de vente de la boutique Altitude Sports.
                    </span>
                  </div>
                </div>
             </div>
           </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Bottom Bar (Sticky) */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-muted p-4 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total (3 jours)</span>
            <span className="text-2xl font-bold text-foreground">90,00 €</span>
          </div>
          <button onClick={nextStep} className="bg-primary text-primary-foreground px-8 py-4 rounded-[16px] text-base font-bold shadow-organic flex-1 flex justify-center items-center gap-2 hover:-translate-y-0.5 transition-transform">
            {currentStep === 3 ? "Payer 90,00 €" : "Continuer"} <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
