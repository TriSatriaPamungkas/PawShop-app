import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem, Item } from '../types';

interface CartState {
  cart: CartItem[];
  addToCart: (item: Item) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      
      addToCart: (item) => {
        const { cart } = get();
        const existing = cart.find((c) => c.id === item.id);
        
        if (existing) {
          set({
            cart: cart.map((c) =>
              c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
            ),
          });
        } else {
          set({ cart: [...cart, { ...item, quantity: 1 }] });
        }
      },
      
      removeFromCart: (id) => {
        set((state) => ({
          cart: state.cart.filter((c) => c.id !== id),
        }));
      },
      
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(id);
          return;
        }
        
        set((state) => ({
          cart: state.cart.map((c) =>
            c.id === id ? { ...c, quantity } : c
          ),
        }));
      },
      
      clearCart: () => {
        set({ cart: [] });
      },
      
      getTotal: () => {
        const { cart } = get();
        return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);