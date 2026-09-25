import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartLine {
  productId: string;
  storeId: string;
  storeName: string;
  name: string;
  image: string;
  priceEgp: number;
  qty: number;
  madeToOrder: boolean;
  maxQty: number;
}

interface CartState {
  lines: CartLine[];
  addLine: (line: Omit<CartLine, 'qty'> & { qty?: number }) => void;
  updateQty: (productId: string, qty: number) => void;
  removeLine: (productId: string) => void;
  clearStore: (storeId: string) => void;
  clearAll: () => void;
  totalItems: () => number;
  linesByStore: () => Record<string, CartLine[]>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],

      addLine: (line) => {
        const qty = line.qty ?? 1;
        set((state) => {
          const existing = state.lines.find((l) => l.productId === line.productId);
          if (existing) {
            const nextQty = Math.min(existing.maxQty || 99, existing.qty + qty);
            return {
              lines: state.lines.map((l) =>
                l.productId === line.productId ? { ...l, qty: nextQty } : l
              ),
            };
          }
          const capped = line.madeToOrder ? qty : Math.min(line.maxQty, qty);
          return {
            lines: [...state.lines, { ...line, qty: capped }],
          };
        });
      },

      updateQty: (productId, qty) => {
        if (qty < 1) {
          get().removeLine(productId);
          return;
        }
        set((state) => ({
          lines: state.lines.map((l) => {
            if (l.productId !== productId) return l;
            const max = l.madeToOrder ? 99 : l.maxQty;
            return { ...l, qty: Math.min(max, qty) };
          }),
        }));
      },

      removeLine: (productId) =>
        set((state) => ({ lines: state.lines.filter((l) => l.productId !== productId) })),

      clearStore: (storeId) =>
        set((state) => ({ lines: state.lines.filter((l) => l.storeId !== storeId) })),

      clearAll: () => set({ lines: [] }),

      totalItems: () => get().lines.reduce((sum, l) => sum + l.qty, 0),

      linesByStore: () => {
        const groups: Record<string, CartLine[]> = {};
        for (const line of get().lines) {
          if (!groups[line.storeId]) groups[line.storeId] = [];
          groups[line.storeId].push(line);
        }
        return groups;
      },
    }),
    { name: 'craftsouq-cart' }
  )
);

export function cartSubtotal(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.priceEgp * l.qty, 0);
}
