import React from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuthStore } from "../store/useAuthStore";
import { useItemStore } from "../store/useItemStore";
import { Item } from "../types";

interface ItemCardProps {
  item: Item;
  onPress?: () => void;
  onAddToCart?: (item: Item) => void;
  showActions?: boolean;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onPress,
  onAddToCart,
  showActions = false,
}) => {
  const user = useAuthStore((state) => state.user);
  const deleteItem = useItemStore((state) => state.deleteItem);

  const handleDelete = () => {
    Alert.alert("Hapus Item", "Yakin ingin menghapus item ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: () => deleteItem(item.id),
      },
    ]);
  };

  const handleAddToCart = () => {
    if (!item.isReady || item.stock === 0) {
      Alert.alert("Stok Habis", "Item ini tidak tersedia");
      return;
    }
    onAddToCart?.(item);
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.container}
      disabled={!onPress}
    >
      <Image source={item.image as any} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>
          Rp {item.price.toLocaleString("id-ID")}
        </Text>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: item.isReady ? "#D1FAE5" : "#FEE2E2",
              },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: item.isReady ? "#059669" : "#DC2626" },
              ]}
            >
              {item.isReady ? "Ready" : "Not Ready"}
            </Text>
          </View>
          <Text style={styles.stock}>Stock: {item.stock}</Text>
        </View>
        {showActions && (
          <View style={styles.actions}>
            {user?.role === "customer" && (
              <TouchableOpacity
                onPress={handleAddToCart}
                disabled={!item.isReady || item.stock === 0}
                style={[
                  styles.actionButton,
                  {
                    backgroundColor:
                      item.isReady && item.stock > 0 ? "#3B82F6" : "#9CA3AF",
                  },
                ]}
              >
                <Text style={styles.actionText}>Add to Cart</Text>
              </TouchableOpacity>
            )}
            {user?.role === "admin" && (
              <TouchableOpacity
                onPress={handleDelete}
                style={[styles.actionButton, { backgroundColor: "#EF4444" }]}
              >
                <Text style={styles.actionText}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  content: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  stock: {
    fontSize: 12,
    color: "#6B7280",
  },
  actions: {
    marginTop: 8,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  actionText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
});
