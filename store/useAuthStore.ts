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
          // Try Supabase first
          const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("username", username)
            .eq("password", password)
            .single();

          if (data && !error) {
            const user: User = {
              id: data.id,
              username: data.username,
              email: data.email,
              password: data.password,
              role: data.role,
              createdAt: data.created_at,
            };
            set({ user });
            return { success: true, message: "Login berhasil!" };
          }

          // Fallback to mock authentication
          if (username === "admin" && password === "admin") {
            const adminUser: User = {
              id: "admin-1",
              username: "admin",
              email: "admin@petshop.com",
              password: "admin",
              role: "admin",
              createdAt: new Date().toISOString(),
            };
            set({ user: adminUser });
            return { success: true, message: "Login berhasil sebagai Admin!" };
          }

          return { success: false, message: "Username atau password salah!" };
        } catch (error) {
          console.error("Login error:", error);

          // Fallback for demo
          if (username === "admin" && password === "admin") {
            const adminUser: User = {
              id: "admin-1",
              username: "admin",
              email: "admin@petshop.com",
              password: "admin",
              role: "admin",
              createdAt: new Date().toISOString(),
            };
            set({ user: adminUser });
            return { success: true, message: "Login berhasil sebagai Admin!" };
          }

          return { success: false, message: "Terjadi kesalahan saat login" };
        }
      },

      register: async (username: string, email: string, password: string) => {
        try {
          // Check if username exists
          const { data: existingUser } = await supabase
            .from("users")
            .select("username")
            .eq("username", username)
            .single();

          if (existingUser) {
            return { success: false, message: "Username sudah digunakan!" };
          }

          // Insert new user
          const { data, error } = await supabase
            .from("users")
            .insert([
              {
                username,
                email,
                password,
                role: "customer",
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

          // Fallback to local storage
          const newUser: User = {
            id: Date.now().toString(),
            username,
            email,
            password,
            role: "customer",
            createdAt: new Date().toISOString(),
          };

          set({ user: newUser });
          return {
            success: true,
            message: "Registrasi berhasil (offline mode)!",
          };
        }
      },

      logout: () => {
        set({ user: null });
      },

      fetchUsers: async () => {
        try {
          const { data, error } = await supabase
            .from("users")
            .select("id, username, email, password, role, created_at")
            .eq("role", "customer")
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

          set({ users: formattedUsers || [] });
        } catch (error) {
          console.error("Fetch users error:", error);
          // Set empty array if failed
          set({ users: [] });
        }
      },

      deleteUser: async (id: string) => {
        try {
          const { error } = await supabase.from("users").delete().eq("id", id);

          if (error) throw error;

          const { users } = get();
          set({ users: users.filter((u) => u.id !== id) });
        } catch (error) {
          console.error("Delete user error:", error);
          // Still remove locally
          const { users } = get();
          set({ users: users.filter((u) => u.id !== id) });
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
