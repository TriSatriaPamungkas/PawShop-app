import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { supabase } from "../lib/supabase";
import { Transaction } from "../types";

interface TransactionState {
  transactions: Transaction[];
  addTransaction: (
    transaction: Omit<Transaction, "id" | "date">
  ) => Promise<void>;
  getTransactionsByUser: (userId: string) => Transaction[];
  fetchTransactions: () => Promise<void>;
  clearTransactions: () => Promise<void>;
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      transactions: [],

      fetchTransactions: async () => {
        try {
          const { data, error } = await supabase
            .from("transactions")
            .select("*")
            .order("created_at", { ascending: false });

          if (error) throw error;

          if (data) {
            const formattedTransactions = data.map((t) => ({
              id: t.id,
              items: t.items,
              total: t.total,
              date: t.created_at,
              userId: t.user_id,
            }));
            set({ transactions: formattedTransactions });
          }
        } catch (error) {
          console.error("Fetch transactions error:", error);
        }
      },

      addTransaction: async (transaction) => {
        try {
          const { data, error } = await supabase
            .from("transactions")
            .insert([
              {
                user_id: transaction.userId,
                items: transaction.items,
                total: transaction.total,
              },
            ])
            .select()
            .single();

          if (error) throw error;

          const newTransaction: Transaction = {
            id: data.id,
            items: data.items,
            total: data.total,
            date: data.created_at,
            userId: data.user_id,
          };

          set((state) => ({
            transactions: [newTransaction, ...state.transactions],
          }));
        } catch (error) {
          console.error("Add transaction error:", error);
          // Fallback to local
          const newTransaction: Transaction = {
            ...transaction,
            id: Date.now().toString(),
            date: new Date().toISOString(),
          };

          set((state) => ({
            transactions: [newTransaction, ...state.transactions],
          }));
        }
      },

      getTransactionsByUser: (userId) => {
        return get().transactions.filter((t) => t.userId === userId);
      },
      clearTransactions: async () => {
        try {
          console.log("Mencoba menghapus SEMUA data...");

          const { error, count } = await supabase
            .from("transactions")
            .delete({ count: "exact" })
            .neq("id", "00000000-0000-0000-0000-000000000000"); // Menghapus dimana ID tidak sama dengan string "0"

          if (error) {
            throw error;
          }

          console.log(`Berhasil menghapus ${count} data dari database.`);

          // LOCAL STATE: Kosongkan array transactions
          set({ transactions: [] });

          alert("Semua riwayat transaksi telah dihapus permanen.");
        } catch (error) {
          console.error("Clear all error:", error);
          alert("Gagal menghapus data. Cek Permission/RLS Database.");
        }
      },
    }),
    {
      name: "transaction-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
