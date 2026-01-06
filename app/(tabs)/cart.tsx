import { useRouter } from "expo-router";
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
import { CartItem } from "../../components/CartItems";
import { Toast } from "../../components/Toast";
import { useAuthStore } from "../../store/useAuthStore";
import { useCartStore } from "../../store/useCartStore";
import { useItemStore } from "../../store/useItemStore";
import { useTransactionStore } from "../../store/useTransactionStore";

export default function CartScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const cart = useCartStore((state) => state.cart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const clearCart = useCartStore((state) => state.clearCart);
  const getTotal = useCartStore((state) => state.getTotal);
  const updateStock = useItemStore((state) => state.updateStock);
  const items = useItemStore((state) => state.items);
  const addTransaction = useTransactionStore((state) => state.addTransaction);

  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success" as "success" | "error" | "info",
  });

  // State untuk mengontrol visibilitas Modal Checkout
  const [isCheckoutVisible, setIsCheckoutVisible] = useState(false);

  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setToast({ visible: true, message, type });
  };

  // Kalkulasi Keuangan
  const subtotal = getTotal();
  const taxRate = 0.12; // Pajak 12%
  const taxAmount = subtotal * taxRate;
  const grandTotal = subtotal + taxAmount;

  const handleCheckoutClick = () => {
    if (cart.length === 0) {
      showToast("Keranjang kosong!", "error");
      return;
    }

    // Check stock availability sebelum buka modal
    for (const cartItem of cart) {
      const item = items.find((i) => i.id === cartItem.id);
      if (!item || item.stock < cartItem.quantity) {
        showToast(`Stock ${cartItem.name} tidak mencukupi!`, "error");
        return;
      }
    }

    // Jika aman, buka modal konfirmasi
    setIsCheckoutVisible(true);
  };

  const handleConfirmOrder = () => {
    // Update stock
    cart.forEach((cartItem) => {
      updateStock(cartItem.id, cartItem.quantity);
    });

    // Add transaction (Simpan Grand Total)
    addTransaction({
      items: cart,
      total: grandTotal, // Menggunakan total setelah pajak
      userId: user?.username || "guest",
      // Kita bisa menambahkan field tax/subtotal ke object transaksi jika tipe datanya mendukung,
      // tapi untuk sekarang kita ikuti struktur standard.
    });

    // Clear cart
    clearCart();
    setIsCheckoutVisible(false); // Tutup modal

    showToast("Transaksi berhasil!");
    setTimeout(() => {
      router.push("/(tabs)/history");
    }, 1500);
  };

  const handleRemove = (id: string) => {
    removeFromCart(id);
    showToast("Item dihapus dari keranjang!");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Shopping Cart</Text>

        {cart.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Your cart is empty</Text>
          </View>
        ) : (
          <>
            <FlatList
              data={cart}
              renderItem={({ item }) => (
                <CartItem
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={handleRemove}
                />
              )}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
            />

            <View style={styles.checkoutContainer}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal:</Text>
                <Text style={styles.totalAmount}>
                  Rp {subtotal.toLocaleString("id-ID")}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleCheckoutClick}
                style={styles.checkoutButton}
              >
                <Text style={styles.checkoutButtonText}>Checkout</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* --- MODAL CONFIRM ORDER (New Feature) --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isCheckoutVisible}
        onRequestClose={() => setIsCheckoutVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirm Order</Text>
              <Text style={styles.modalSubtitle}>
                Review your order before completing
              </Text>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Section 1: Order Summary */}
              <View style={styles.sectionBox}>
                <Text style={styles.sectionTitle}>Order Summary</Text>
                {cart.map((item) => (
                  <View key={item.id} style={styles.summaryItemRow}>
                    <Image
                      source={item.image as any}
                      style={styles.summaryImage}
                    />
                    <View style={styles.summaryItemInfo}>
                      <Text style={styles.summaryItemName}>{item.name}</Text>
                      <Text style={styles.summaryItemQty}>
                        Qty: {item.quantity}
                      </Text>
                    </View>
                    <Text style={styles.summaryItemPrice}>
                      Rp {item.price.toLocaleString("id-ID")}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Section 2: Payment Details */}
              <View style={styles.sectionBox}>
                <Text style={styles.sectionTitle}>Payment Details</Text>

                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>Items ({cart.length})</Text>
                  <Text style={styles.paymentValue}>
                    Rp {subtotal.toLocaleString("id-ID")}
                  </Text>
                </View>

                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>Tax (12%)</Text>
                  <Text style={styles.paymentValue}>
                    Rp {taxAmount.toLocaleString("id-ID")}
                  </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.paymentRow}>
                  <Text style={styles.grandTotalLabel}>Total</Text>
                  <Text style={styles.grandTotalValue}>
                    Rp {grandTotal.toLocaleString("id-ID")}
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsCheckoutVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirmOrder}
              >
                <Text style={styles.confirmButtonText}>Confirm Order</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
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
    paddingBottom: 120,
  },
  checkoutContainer: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3B82F6",
  },
  checkoutButton: {
    backgroundColor: "#10B981",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  checkoutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  // --- STYLES FOR MODAL ---
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end", // Muncul dari bawah atau tengah
  },
  modalContent: {
    backgroundColor: "#F3F4F6", // Mengikuti background app
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "85%", // Modal menutupi 85% layar
    padding: 20,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1F2937",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  modalBody: {
    flex: 1,
  },
  sectionBox: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  // Style untuk Summary Items
  summaryItemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: "#E5E7EB",
  },
  summaryItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  summaryItemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  summaryItemQty: {
    fontSize: 12,
    color: "#6B7280",
  },
  summaryItemPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937", // Warna orange/gold untuk harga (opsional) atau
  },
  // Style untuk Payment Details
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  grandTotalValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000", // Highlight total
  },
  // Footer Button Modal
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EF4444",
    marginRight: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#EF4444",
    fontWeight: "600",
  },
  confirmButton: {
    flex: 2,
    backgroundColor: "#10B981",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
