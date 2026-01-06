import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface LoginPromptProps {
  visible: boolean;
  onClose: () => void;
  onLogin: () => void;
}

export const LoginPrompt: React.FC<LoginPromptProps> = ({
  visible,
  onClose,
  onLogin,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Login Required</Text>
          <Text style={styles.message}>
            Silakan login terlebih dahulu untuk menambahkan item ke cart
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onLogin} style={styles.loginButton}>
              <Text style={styles.loginText}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 16,
    width: "80%",
    maxWidth: 400,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  message: {
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#E5E7EB",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelText: {
    fontWeight: "600",
    color: "#6B7280",
  },
  loginButton: {
    flex: 1,
    backgroundColor: "#3B82F6",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  loginText: {
    fontWeight: "600",
    color: "white",
  },
});
