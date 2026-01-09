import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ClearHistoryButton from "../../components/clearbutton";
import { useAuthStore } from "../../store/useAuthStore";
import { useTransactionStore } from "../../store/useTransactionStore";
import { Transaction } from "../../types";

export default function HistoryScreen() {
  const user = useAuthStore((state) => state.user);
  const users = useAuthStore((state) => state.users);

  const transactions = useTransactionStore((state) => state.transactions);
  const getTransactionsByUser = useTransactionStore(
    (state) => state.getTransactionsByUser
  );

  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  const userTransactions =
    user?.role === "admin"
      ? transactions
      : getTransactionsByUser(user?.username || "");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // --- FUNGSI BARU: HITUNG KEUANGAN ---
  // Menghitung subtotal murni dari harga item * qty
  const calculateFinancials = (transaction: Transaction) => {
    const subtotal = transaction.items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    const tax = subtotal * 0.12; // Pajak 12% dari subtotal murni

    return { subtotal, tax };
  };

  // Hitung nilai untuk transaksi yang sedang dipilih (jika ada)
  const { subtotal, tax } = selectedTransaction
    ? calculateFinancials(selectedTransaction)
    : { subtotal: 0, tax: 0 };

  const renderFooter = () => {
    if (user?.role === "admin") {
      return (
        <View style={styles.footerContainer}>
          <ClearHistoryButton />
        </View>
      );
    }
    return <View style={{ marginBottom: 20 }} />;
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => setSelectedTransaction(item)}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.dateContainer}>
            <Text style={styles.date}>
              {formatDate(item.date)} at {formatTime(item.date)}
            </Text>
            <Text style={styles.transactionId}>TXN-{item.id}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Completed</Text>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.itemCount}>
            {item.items.length} item{item.items.length > 1 ? "s" : ""}
          </Text>
          <Text style={styles.amount}>
            Rp. {item.total.toLocaleString("id-ID")}
          </Text>
        </View>
        <View style={styles.chevron}>
          <Text style={styles.chevronIcon}></Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Transactions</Text>
        {userTransactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        ) : (
          <>
            <Text style={styles.subtitle}>
              {userTransactions.length} transaction
              {userTransactions.length > 1 ? "s" : ""}
            </Text>
            <FlatList
              data={userTransactions}
              renderItem={renderTransaction}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              ListFooterComponent={renderFooter}
            />
          </>
        )}
      </View>

      {/* Detail Modal */}
      <Modal
        visible={selectedTransaction !== null}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setSelectedTransaction(null)}
      >
        {selectedTransaction && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setSelectedTransaction(null)}
                style={styles.backButton}
              >
                <Text style={styles.backIcon}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Order Details</Text>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* --- PANEL CUSTOMER INFO (KHUSUS ADMIN) --- */}
              {user?.role === "admin" && (
                <View style={styles.detailCard}>
                  <View style={styles.detailHeader}>
                    <Ionicons
                      name="person-circle-outline"
                      size={24}
                      color="black"
                    />
                    <Text style={styles.detailHeaderText}>CUSTOMER INFO</Text>
                  </View>
                  <Text style={styles.fullDate}>
                    {selectedTransaction.userId}
                  </Text>
                </View>
              )}

              {/* Date & Time */}
              <View style={styles.detailCard}>
                <View style={styles.detailHeader}>
                  <Ionicons name="time-outline" size={24} color="black" />
                  <Text style={styles.detailHeaderText}>DATE & TIME</Text>
                </View>
                <Text style={styles.fullDate}>
                  {formatFullDate(selectedTransaction.date)}
                </Text>
                <Text style={styles.fullTime}>
                  {formatTime(selectedTransaction.date)}
                </Text>
              </View>

              {/* Items Purchased */}
              <View style={styles.detailCard}>
                <View style={styles.detailHeader}>
                  <Ionicons name="bag-check-outline" size={24} color="black" />
                  <Text style={styles.detailHeaderText}>ITEMS PURCHASED</Text>
                </View>
                {selectedTransaction.items.map((item, index) => (
                  <View key={index} style={styles.purchasedItem}>
                    <Image
                      source={item.image as any}
                      style={styles.itemImage}
                      resizeMode="cover"
                    />
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemPrice}>
                        Rp. {item.price.toLocaleString("id-ID")} x{" "}
                        {item.quantity}
                      </Text>
                    </View>
                    <Text style={styles.itemTotal}>
                      Rp. {(item.price * item.quantity).toLocaleString("id-ID")}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Payment Summary - UPDATED LOGIC */}
              <View style={styles.detailCard}>
                <View style={styles.detailHeader}>
                  <Ionicons name="card-outline" size={24} color="black" />
                  <Text style={styles.detailHeaderText}>PAYMENT SUMMARY</Text>
                </View>

                {/* Subtotal yang dihitung dari items */}
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>
                    Rp. {subtotal.toLocaleString("id-ID")}
                  </Text>
                </View>

                {/* Tax 12% dari Subtotal */}
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>PPn (12%)</Text>
                  <Text style={styles.summaryValue}>
                    Rp.{" "}
                    {tax.toLocaleString("id-ID", { maximumFractionDigits: 0 })}
                  </Text>
                </View>

                <View style={styles.divider} />

                {/* Total Paid diambil langsung dari Data Transaksi (Grand Total) */}
                <View style={styles.summaryRow}>
                  <Text style={styles.totalLabel}>Total Paid</Text>
                  <Text style={styles.totalValue}>
                    Rp.{" "}
                    {selectedTransaction.total.toLocaleString("id-ID", {
                      maximumFractionDigits: 0,
                    })}
                  </Text>
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
  },
  listContent: {
    paddingBottom: 16,
  },
  card: {
    backgroundColor: "#ffffffff",
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    overflow: "hidden",
  },
  cardContent: {
    flex: 1,
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  dateContainer: {
    flex: 1,
  },
  date: {
    fontSize: 14,
    color: "#000000",
    marginBottom: 4,
  },
  transactionId: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  statusBadge: {
    backgroundColor: "#059669",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: "#D1FAE5",
    fontWeight: "600",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemCount: {
    fontSize: 14,
    color: "#FFFFFF",
  },
  amount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  chevron: {
    position: "absolute",
    right: 16,
    top: "50%",
    marginTop: -12,
  },
  chevronIcon: {
    fontSize: 24,
    color: "#6B7280",
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
  },
  backButton: {
    marginRight: 16,
  },
  backIcon: {
    fontSize: 32,
    color: "#000",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  detailCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  detailIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  detailHeaderText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#000",
    letterSpacing: 1,
    marginLeft: 8,
  },
  fullDate: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  fullTime: {
    fontSize: 16,
    color: "#000",
  },
  subText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  purchasedItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#374151",
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: "#374151",
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#000",
  },
  summaryValue: {
    fontSize: 16,
    color: "#374151",
  },
  divider: {
    height: 1,
    backgroundColor: "#374151",
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
  },
  footerContainer: {
    marginTop: 20,
    marginBottom: 40,
    paddingHorizontal: 4,
  },
});
