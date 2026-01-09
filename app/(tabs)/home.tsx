import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ItemCard } from "../../components/ItemCard";
import { LoginPrompt } from "../../components/LoginPrompt";
import { Toast } from "../../components/Toast";
import { useAuthStore } from "../../store/useAuthStore";
import { useCartStore } from "../../store/useCartStore";
import { useItemStore } from "../../store/useItemStore";
import { Item, ItemCategory } from "../../types";

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const items = useItemStore((state) => state.items);
  const addToCart = useCartStore((state) => state.addToCart);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<"all" | ItemCategory>(
    "all"
  );
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "" });

  const showToast = (message: string) => {
    setToast({ visible: true, message });
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (item: Item) => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    addToCart(item);
    showToast("Item ditambahkan ke keranjang!");
  };

  const handleItemPress = (item: Item) => {
    // Navigate to item detail screen
    router.push(`/items/${item.id}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Petshop Items</Text>

        <TextInput
          placeholder="Search items..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />

        <View style={styles.filterContainer}>
          {(["all", "cat", "dog"] as const).map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setFilterCategory(cat)}
              style={[
                styles.filterButton,
                filterCategory === cat && styles.filterButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  filterCategory === cat && styles.filterTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={filteredItems}
          renderItem={({ item }) => (
            <ItemCard
              item={item}
              onPress={() => handleItemPress(item)}
              onAddToCart={handleAddToCart}
              showActions
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No items found</Text>
          }
        />

        {user?.role === "admin" && (
          <TouchableOpacity
            onPress={() => router.push("/items/add")}
            style={styles.fab}
          >
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        )}
      </View>

      <LoginPrompt
        visible={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        onLogin={() => {
          setShowLoginPrompt(false);
          router.push("/(tabs)/profile");
        }}
      />

      <Toast
        message={toast.message}
        visible={toast.visible}
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
  searchInput: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterContainer: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    backgroundColor: "white",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterButtonActive: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  filterText: {
    color: "#6B7280",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  filterTextActive: {
    color: "white",
  },
  listContent: {
    paddingBottom: 80,
  },
  emptyText: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 40,
    fontSize: 16,
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#3B82F6",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    color: "white",
    fontSize: 32,
    fontWeight: "300",
  },
});
