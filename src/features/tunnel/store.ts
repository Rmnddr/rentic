import { create } from "zustand";

// Panier du tunnel de réservation public (état client uniquement — la
// vérité des prix et de la dispo reste côté serveur).

export type CartItem = {
  productId: string;
  productName: string;
  packId: string | null;
  packName: string | null;
  quantity: number;
  /** Prix web affiché (indicatif — recalculé serveur à la réservation) */
  unitPrice: number;
  isOptional: boolean;
  /** Catégorie du produit, pour retrouver les attributs participants */
  categoryId: string;
};

export type ParticipantValueEntry = {
  itemIndex: number;
  attributeId: string;
  value: string;
  participantIndex: number;
};

type TunnelState = {
  startDate: string;
  endDate: string;
  items: CartItem[];
  participantValues: ParticipantValueEntry[];
  setDates: (startDate: string, endDate: string) => void;
  addItem: (item: CartItem) => void;
  removeItem: (index: number) => void;
  setQuantity: (index: number, quantity: number) => void;
  setParticipantValue: (entry: ParticipantValueEntry) => void;
  reset: () => void;
};

const initialState = {
  startDate: "",
  endDate: "",
  items: [] as CartItem[],
  participantValues: [] as ParticipantValueEntry[],
};

export const useTunnelStore = create<TunnelState>((set) => ({
  ...initialState,

  setDates: (startDate, endDate) =>
    // Changer les dates invalide la dispo déjà vérifiée → on vide le panier
    set((state) =>
      state.startDate === startDate && state.endDate === endDate
        ? { startDate, endDate }
        : { startDate, endDate, items: [], participantValues: [] },
    ),

  addItem: (item) =>
    set((state) => {
      const existing = state.items.findIndex(
        (i) => i.productId === item.productId && i.packId === item.packId,
      );
      if (existing >= 0) {
        const items = state.items.map((i, idx) =>
          idx === existing
            ? { ...i, quantity: Math.min(i.quantity + item.quantity, 100) }
            : i,
        );
        return { items };
      }
      if (state.items.length >= 50) return state;
      return { items: [...state.items, item] };
    }),

  removeItem: (index) =>
    set((state) => ({
      items: state.items.filter((_, idx) => idx !== index),
      participantValues: state.participantValues.filter((pv) => pv.itemIndex !== index)
        .map((pv) =>
          pv.itemIndex > index ? { ...pv, itemIndex: pv.itemIndex - 1 } : pv,
        ),
    })),

  setQuantity: (index, quantity) =>
    set((state) => ({
      items: state.items.map((i, idx) =>
        idx === index ? { ...i, quantity: Math.max(1, Math.min(quantity, 100)) } : i,
      ),
    })),

  setParticipantValue: (entry) =>
    set((state) => {
      const others = state.participantValues.filter(
        (pv) =>
          !(
            pv.itemIndex === entry.itemIndex &&
            pv.attributeId === entry.attributeId &&
            pv.participantIndex === entry.participantIndex
          ),
      );
      return { participantValues: [...others, entry] };
    }),

  reset: () => set(initialState),
}));
