import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/Button";
import { Toast } from "../../components/Toast";
import { useAuthStore } from "../../store/useAuthStore";
import { useCartStore } from "../../store/useCartStore";

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const logout = useAuthStore((state) => state.logout);
  const clearCart = useCartStore((state) => state.clearCart);

  // State untuk Form Login/Register
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // State Toast
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success" as "success" | "error",
  });

  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setToast({ visible: true, message, type });
  };

  // --- LOGIC AUTH ---

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      showToast("Username dan password harus diisi!", "error");
      return;
    }

    const result = await login(username, password);
    showToast(result.message, result.success ? "success" : "error");

    if (result.success) {
      // Reset form
      setUsername("");
      setPassword("");
    }
  };

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      showToast("Semua field harus diisi!", "error");
      return;
    }

    if (password !== confirmPassword) {
      showToast("Password tidak cocok!", "error");
      return;
    }

    if (password.length < 6) {
      showToast("Password minimal 6 karakter!", "error");
      return;
    }

    const result = await register(username, email, password);
    showToast(result.message, result.success ? "success" : "error");

    if (result.success) {
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Yakin ingin logout?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          logout();
          clearCart();
          showToast("Logout berhasil!");
        },
      },
    ]);
  };

  // --- RENDER: LOGIN / REGISTER SCREEN (Jika belum login) ---
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.loginContainer}>
          <Text style={styles.loginTitle}>
            {isLogin ? "Login" : "Register"}
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Enter username"
              autoCapitalize="none"
              style={styles.input}
            />
          </View>

          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter email"
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              secureTextEntry
              style={styles.input}
            />
          </View>

          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm password"
                secureTextEntry
                style={styles.input}
              />
            </View>
          )}

          <Button
            title={isLogin ? "Login" : "Register"}
            onPress={isLogin ? handleLogin : handleRegister}
            style={styles.submitButton}
          />

          <TouchableOpacity
            onPress={() => {
              setIsLogin(!isLogin);
              setUsername("");
              setEmail("");
              setPassword("");
              setConfirmPassword("");
            }}
            style={styles.switchButton}
          >
            <Text style={styles.switchText}>
              {isLogin
                ? "Don't have an account? Register"
                : "Already have an account? Login"}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <Toast
          message={toast.message}
          visible={toast.visible}
          type={toast.type}
          onHide={() => setToast({ ...toast, visible: false })}
        />
      </SafeAreaView>
    );
  }

  // --- RENDER: PROFILE SCREEN (Jika User Login) ---
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.profileContainer}>
        {/* Header Profile */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {/* Menggunakan UI Avatars untuk gambar dinamis berdasarkan username */}
            <Image
              source={{
                uri: `https://ui-avatars.com/api/?name=${user.username}&background=0D8ABC&color=fff&size=128`,
              }}
              style={styles.avatar}
            />
            {user.role === "admin" && (
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>ADMIN</Text>
              </View>
            )}
          </View>

          <Text style={styles.username}>{user.username}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>

        {/* Menu Section: Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconBg}>
              <Ionicons name="person-outline" size={20} color="#4B5563" />
            </View>
            <Text style={styles.menuText}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconBg}>
              <Ionicons name="settings-outline" size={20} color="#4B5563" />
            </View>
            <Text style={styles.menuText}>Settings</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <View style={styles.footer}>
          <Button
            title="Log Out"
            onPress={handleLogout}
            variant="danger"
            style={styles.logoutButton}
          />
          <Text style={styles.versionText}>App Version 1.0.0</Text>
        </View>
      </ScrollView>

      <Toast
        message={toast.message}
        visible={toast.visible}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },

  // Login Styles
  loginContainer: {
    flex: 1,
    padding: 16,
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 32,
    marginTop: 40,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    fontSize: 14,
  },
  submitButton: {
    marginTop: 8,
  },
  switchButton: {
    marginTop: 16,
    padding: 12,
    alignItems: "center",
  },
  switchText: {
    color: "#3B82F6",
    fontSize: 14,
    fontWeight: "600",
  },

  // Profile Styles
  profileContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
    marginTop: 10,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    backgroundColor: "#E5E7EB",
  },
  adminBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#1F2937",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#fff",
  },
  adminBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
    textTransform: "capitalize",
  },
  userEmail: {
    fontSize: 16,
    color: "#6B7280",
  },

  // Section Styles
  section: {
    marginBottom: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9CA3AF",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  menuIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },

  // Admin Specific Styles
  adminPanelContainer: {
    gap: 12,
  },
  warningText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
  },

  // Footer Styles
  footer: {
    marginTop: 10,
  },
  logoutButton: {
    marginBottom: 24,
  },
  versionText: {
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 12,
  },
});
