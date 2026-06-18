import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/types';

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem(item) {
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        });
      },

      removeItem(productId) {
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) }));
      },

      updateQuantity(productId, quantity) {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
        }));
      },

      clearCart() {
        set({ items: [] });
      },

      totalItems() {
        return get().items.reduce((acc, i) => acc + i.quantity, 0);
      },

      subtotal() {
        return get().items.reduce((acc, i) => acc + i.selling_price * i.quantity, 0);
      },
    }),
    { name: 'monago-cart' }
  )
);
