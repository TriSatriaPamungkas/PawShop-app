import React, { useState } from "react";
import {
  Alert,
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

  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      showToast("Username dan password harus diisi!", "error");
      return;
    }

    const result = await login(username, password);
    showToast(result.message, result.success ? "success" : "error");

    if (result.success) {
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

          {isLogin && (
            <View style={styles.demoBox}>
              <Text style={styles.demoTitle}>Demo Account:</Text>
              <Text style={styles.demoText}>Admin: admin / admin</Text>
            </View>
          )}
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profileContainer}>
        <Text style={styles.title}>Profile</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.username.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.username}>{user.username}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View
            style={[
              styles.roleBadge,
              {
                backgroundColor: user.role === "admin" ? "#DBEAFE" : "#D1FAE5",
              },
            ]}
          >
            <Text
              style={[
                styles.roleText,
                {
                  color: user.role === "admin" ? "#1E40AF" : "#059669",
                },
              ]}
            >
              {user.role}
            </Text>
          </View>
        </View>

        <Button title="Logout" onPress={handleLogout} variant="danger" />
      </View>

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
  demoBox: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
  },
  demoTitle: {
    fontSize: 12,
    color: "#92400E",
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "600",
  },
  demoText: {
    fontSize: 12,
    color: "#92400E",
    textAlign: "center",
  },
  profileContainer: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 32,
  },
  profileCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    color: "white",
    fontWeight: "600",
  },
  username: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },
  roleBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
});
