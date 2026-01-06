import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { supabase } from "../lib/supabase";
import { Item } from "../types";

interface ItemState {
  items: Item[];
  addItem: (item: Omit<Item, "id">) => void;
  updateItem: (id: string, item: Partial<Item>) => void;
  deleteItem: (id: string) => void;
  updateStock: (id: string, quantity: number) => void;
  getItemById: (id: string) => Item | undefined;
}

export const useItemStore = create<ItemState>()(
  persist(
    (set, get) => ({
      items: [],

      fetchItems: async () => {
        try {
          const { data, error } = await supabase
            .from("items")
            .select("*")
            .order("created_at", { ascending: false });

          if (error) throw error;

          if (data && data.length > 0) {
            const formattedItems = data.map((item) => ({
              id: item.id,
              name: item.name,
              price: item.price,
              stock: item.stock,
              category: item.category,
              image: item.image,
              isReady: item.is_ready,
            }));
            set({ items: formattedItems });
          }
        } catch (error) {
          console.error("Fetch items error:", error);
        }
      },

      addItem: async (item) => {
        try {
          const { data, error } = await supabase
            .from("items")
            .insert([
              {
                name: item.name,
                price: item.price,
                stock: item.stock,
                category: item.category,
                image: item.image,
                is_ready: item.isReady,
              },
            ])
            .select()
            .single();

          if (error) throw error;

          const newItem = {
            id: data.id,
            name: data.name,
            price: data.price,
            stock: data.stock,
            category: data.category,
            image: data.image,
            isReady: data.is_ready,
          };

          set((state) => ({ items: [...state.items, newItem] }));
        } catch (error) {
          console.error("Add item error:", error);
          // Fallback to local
          const newItem = { ...item, id: Date.now().toString() };
          set((state) => ({ items: [...state.items, newItem] }));
        }
      },

      updateItem: async (id, updatedItem) => {
        try {
          const { error } = await supabase
            .from("items")
            .update({
              name: updatedItem.name,
              price: updatedItem.price,
              stock: updatedItem.stock,
              category: updatedItem.category,
              image: updatedItem.image,
              is_ready: updatedItem.isReady,
            })
            .eq("id", id);

          if (error) throw error;

          set((state) => ({
            items: state.items.map((item) =>
              item.id === id ? { ...item, ...updatedItem } : item
            ),
          }));
        } catch (error) {
          console.error("Update item error:", error);
          // Fallback to local
          set((state) => ({
            items: state.items.map((item) =>
              item.id === id ? { ...item, ...updatedItem } : item
            ),
          }));
        }
      },

      deleteItem: async (id) => {
        try {
          const { error } = await supabase.from("items").delete().eq("id", id);

          if (error) throw error;

          set((state) => ({
            items: state.items.filter((item) => item.id !== id),
          }));
        } catch (error) {
          console.error("Delete item error:", error);
          // Fallback to local
          set((state) => ({
            items: state.items.filter((item) => item.id !== id),
          }));
        }
      },

      updateStock: (id, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? {
                  ...item,
                  stock: item.stock - quantity,
                  isReady: item.stock - quantity > 0,
                }
              : item
          ),
        }));
      },

      getItemById: (id) => {
        return get().items.find((item) => item.id === id);
      },
    }),
    {
      name: "item-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
