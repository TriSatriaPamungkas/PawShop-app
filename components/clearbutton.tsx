import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { useTransactionStore } from "../store/useTransactionStore";

const ClearHistoryButton = () => {
  // Panggil fungsi baru clearAllTransactions
  const clearAllTransactions = useTransactionStore(
    (state) => state.clearTransactions
  );
  const [loading, setLoading] = useState(false);

  const handlePress = () => {
    Alert.alert(
      "⚠️ HAPUS SEMUA DATA?",
      "Tindakan ini akan menghapus SELURUH riwayat transaksi dari database untuk SEMUA USER. Data tidak bisa dikembalikan.",
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "HAPUS SEMUA",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            await clearAllTransactions();
            setLoading(false);
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handlePress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.text}>DELETE ALL DATABASE DATA</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#DC2626", // Merah gelap tanda bahaya
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: "#B91C1C",
  },
  text: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
});

export default ClearHistoryButton;
