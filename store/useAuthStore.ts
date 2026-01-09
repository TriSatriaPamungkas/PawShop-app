import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { supabase } from "../lib/supabase";
import { User } from "../types";

interface AuthState {
  user: User | null;
  users: User[];
  login: (
    username: string,
    password: string
  ) => Promise<{ success: boolean; message: string }>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  fetchUsers: () => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      users: [],

      login: async (username: string, password: string) => {
        try {
          // 1. Cek langsung ke Supabase (Username & Password)
          // Pastikan di database kolom password menyimpan plain text sesuai logic ini
          const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("username", username)
            .eq("password", password)
            .single();

          if (error || !data) {
            return { success: false, message: "Username atau password salah!" };
          }

          // 2. Jika ketemu, simpan ke state
          const user: User = {
            id: data.id,
            username: data.username,
            email: data.email,
            password: data.password,
            role: data.role, // Pastikan kolom role di DB isinya 'admin' atau 'customer'
            createdAt: data.created_at,
          };

          set({ user });
          return {
            success: true,
            message: `Selamat datang, ${user.username}!`,
          };
        } catch (error) {
          console.error("Login error:", error);
          return {
            success: false,
            message: "Terjadi kesalahan koneksi database",
          };
        }
      },

      register: async (username: string, email: string, password: string) => {
        try {
          // Cek username duplikat
          const { data: existingUser } = await supabase
            .from("users")
            .select("username")
            .eq("username", username)
            .single();

          if (existingUser) {
            return { success: false, message: "Username sudah digunakan!" };
          }

          // Insert user baru (Default role: customer)
          const { data, error } = await supabase
            .from("users")
            .insert([
              {
                username,
                email,
                password,
                role: "customer", // Default user biasa
              },
            ])
            .select()
            .single();

          if (error) throw error;

          const newUser: User = {
            id: data.id,
            username: data.username,
            email: data.email,
            password: data.password,
            role: data.role,
            createdAt: data.created_at,
          };

          set({ user: newUser });
          return { success: true, message: "Registrasi berhasil!" };
        } catch (error) {
          console.error("Register error:", error);
          return {
            success: false,
            message: "Gagal mendaftar. Cek koneksi internet.",
          };
        }
      },

      logout: () => {
        set({ user: null });
      },

      fetchUsers: async () => {
        try {
          // Ambil semua user kecuali user yang sedang login (opsional) atau ambil semua customer
          const { data, error } = await supabase
            .from("users")
            .select("id, username, email, password, role, created_at")
            .order("created_at", { ascending: false });

          if (error) throw error;

          const formattedUsers = data.map((u) => ({
            id: u.id,
            username: u.username,
            email: u.email,
            password: u.password,
            role: u.role,
            createdAt: u.created_at,
          }));

          set({ users: formattedUsers });
        } catch (error) {
          console.error("Fetch users error:", error);
          set({ users: [] });
        }
      },

      deleteUser: async (id: string) => {
        try {
          const { error } = await supabase.from("users").delete().eq("id", id);
          if (error) throw error;

          // Update local state
          const { users } = get();
          set({ users: users.filter((u) => u.id !== id) });
        } catch (error) {
          console.error("Delete user error:", error);
          alert("Gagal menghapus user dari database.");
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
