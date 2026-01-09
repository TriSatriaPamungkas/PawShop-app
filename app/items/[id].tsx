import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/Button";
import { Toast } from "../../components/Toast";
import { IMAGES } from "../../constants/images";
import { useAuthStore } from "../../store/useAuthStore";
import { useCartStore } from "../../store/useCartStore";
import { useItemStore } from "../../store/useItemStore";
import { ItemCategory } from "../../types";
import { validateItem } from "../../utils/validation";

export default function ItemDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const getItemById = useItemStore((state) => state.getItemById);
  const updateItem = useItemStore((state) => state.updateItem);
  const deleteItem = useItemStore((state) => state.deleteItem);
  const addToCart = useCartStore((state) => state.addToCart);
  const user = useAuthStore((state) => state.user);

  const item = getItemById(id as string);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success" as "success" | "error",
  });
  const [showEditModal, setShowEditModal] = useState(false);

  // Edit form states
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState<ItemCategory>("cat");
  const [isReady, setIsReady] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!item) {
      Alert.alert("Error", "Item not found", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } else {
      // Initialize form with item data
      setName(item.name);
      setPrice(item.price.toString());
      setStock(item.stock.toString());
      setCategory(item.category);
      setIsReady(item.isReady);
    }
  }, [item]);

  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setToast({ visible: true, message, type });
  };

  const handleAddToCart = () => {
    if (!user) {
      Alert.alert("Login Required", "Please login to add items to cart", [
        { text: "Cancel", style: "cancel" },
        { text: "Login", onPress: () => router.push("/(tabs)/profile") },
      ]);
      return;
    }

    if (!item?.isReady || item.stock === 0) {
      showToast("Item is out of stock", "error");
      return;
    }

    addToCart(item);
    showToast("Added to cart successfully!");
  };

  const handleShare = async () => {
    try {
      // Create Airbridge deep link (akan disetup setelah Airbridge configured)
      const airbridgeLink = `https://pawshop.airbridge.io/item/${id}`;
      const customScheme = `pawshop://item/${id}`;

      await Share.share({
        message: `Check out ${item?.name} on PawShop App!\n\n${airbridgeLink}`,
        url: airbridgeLink,
        title: item?.name,
      });
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    const validationErrors = validateItem(name, price, stock);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const itemData = {
      name,
      price: Number(price),
      stock: Number(stock),
      category,
      image: category === "cat" ? IMAGES.CAT : IMAGES.DOG,
      isReady,
    };

    await updateItem(id as string, itemData);
    showToast("Item berhasil diperbarui!");
    setShowEditModal(false);
  };

  const handleDelete = () => {
    Alert.alert("Hapus Item", "Yakin ingin menghapus item ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          await deleteItem(id as string);
          showToast("Item berhasil dihapus!");
          router.back();
        },
      },
    ]);
  };

  if (!item) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Item Details</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Text style={styles.shareIcon}>🔗</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.imageContainer}>
          <Image source={item.image as any} style={styles.image} />
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: item.isReady ? "#D1FAE5" : "#FEE2E2",
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: item.isReady ? "#059669" : "#DC2626" },
              ]}
            >
              {item.isReady ? "In Stock" : "Out of Stock"}
            </Text>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>

          <Text style={styles.itemName}>{item.name}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>
              Rp {item.price.toLocaleString("id-ID")}
            </Text>
            <View style={styles.stockInfo}>
              <Text style={styles.stockLabel}>Stock:</Text>
              <Text style={styles.stockValue}>{item.stock} pcs</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>
              High-quality {item.category === "cat" ? "cat" : "dog"} food that
              provides complete nutrition for your beloved pet. Made with
              premium ingredients to ensure optimal health and vitality.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Features</Text>
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>•</Text>
              <Text style={styles.featureText}>
                Premium quality ingredients
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>•</Text>
              <Text style={styles.featureText}>Complete nutrition</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>•</Text>
              <Text style={styles.featureText}>Easy to digest</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>•</Text>
              <Text style={styles.featureText}>Suitable for all ages</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      {user?.role === "customer" && (
        <View style={styles.footer}>
          <Button
            title={item.isReady ? "Add to Cart" : "Out of Stock"}
            onPress={handleAddToCart}
            disabled={!item.isReady || item.stock === 0}
            style={styles.addButton}
          />
        </View>
      )}

      {user?.role === "admin" && (
        <View style={styles.footer}>
          <View style={styles.adminButtons}>
            <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit Item</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDelete}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Edit Modal for Admin */}
      <Modal visible={showEditModal} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowEditModal(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Item</Text>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Item Name</Text>
              <TextInput
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  setErrors({ ...errors, name: "" });
                }}
                placeholder="Enter item name"
                style={[styles.input, errors.name && styles.inputError]}
              />
              {errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Price (Rp)</Text>
              <TextInput
                value={price}
                onChangeText={(text) => {
                  setPrice(text);
                  setErrors({ ...errors, price: "" });
                }}
                placeholder="Enter price"
                keyboardType="numeric"
                style={[styles.input, errors.price && styles.inputError]}
              />
              {errors.price && (
                <Text style={styles.errorText}>{errors.price}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Stock</Text>
              <TextInput
                value={stock}
                onChangeText={(text) => {
                  setStock(text);
                  setErrors({ ...errors, stock: "" });
                }}
                placeholder="Enter stock"
                keyboardType="numeric"
                style={[styles.input, errors.stock && styles.inputError]}
              />
              {errors.stock && (
                <Text style={styles.errorText}>{errors.stock}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.categoryContainer}>
                {(["cat", "dog"] as ItemCategory[]).map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={[
                      styles.categoryButton,
                      category === cat && styles.categoryButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryButtonText,
                        category === cat && styles.categoryButtonTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Status</Text>
              <TouchableOpacity
                onPress={() => setIsReady(!isReady)}
                style={styles.toggleContainer}
              >
                <View
                  style={[
                    styles.toggle,
                    { backgroundColor: isReady ? "#10B981" : "#9CA3AF" },
                  ]}
                >
                  <View
                    style={[
                      styles.toggleThumb,
                      { alignSelf: isReady ? "flex-end" : "flex-start" },
                    ]}
                  />
                </View>
                <Text style={styles.toggleLabel}>
                  {isReady ? "Ready" : "Not Ready"}
                </Text>
              </TouchableOpacity>
            </View>

            <Button
              title="Update Item"
              onPress={handleUpdate}
              style={styles.updateButton}
            />
          </ScrollView>
        </SafeAreaView>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    width: 40,
  },
  backText: {
    fontSize: 24,
    color: "#3B82F6",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
    textAlign: "center",
  },
  shareButton: {
    width: 40,
    alignItems: "flex-end",
  },
  shareIcon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    backgroundColor: "white",
    padding: 24,
    alignItems: "center",
    position: "relative",
  },
  image: {
    width: 250,
    height: 250,
    borderRadius: 16,
  },
  statusBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  infoContainer: {
    padding: 16,
  },
  categoryBadge: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1E40AF",
    textTransform: "capitalize",
  },
  itemName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  price: {
    fontSize: 28,
    fontWeight: "700",
    color: "#3B82F6",
  },
  stockInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  stockLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginRight: 8,
  },
  stockValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 22,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  featureBullet: {
    fontSize: 16,
    color: "#3B82F6",
    marginRight: 8,
  },
  featureText: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
  },
  deepLinkInfo: {
    backgroundColor: "#FEF3C7",
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  deepLinkTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#92400E",
    marginBottom: 8,
  },
  deepLinkText: {
    fontSize: 12,
    color: "#78350F",
    fontFamily: "monospace",
    marginBottom: 4,
  },
  footer: {
    padding: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  addButton: {
    marginBottom: 0,
  },
  adminButtons: {
    flexDirection: "row",
    gap: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: "#F59E0B",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  editButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
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
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  closeButton: {
    marginRight: 16,
  },
  closeText: {
    fontSize: 28,
    color: "#6B7280",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  modalContent: {
    flex: 1,
    padding: 16,
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
  inputError: {
    borderColor: "#EF4444",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
  },
  categoryContainer: {
    flexDirection: "row",
    gap: 12,
  },
  categoryButton: {
    flex: 1,
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  categoryButtonActive: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  categoryButtonText: {
    color: "#6B7280",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  categoryButtonTextActive: {
    color: "white",
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "white",
  },
  toggleLabel: {
    marginLeft: 12,
    color: "#374151",
    fontWeight: "500",
  },
  updateButton: {
    marginTop: 8,
    marginBottom: 24,
  },
});
