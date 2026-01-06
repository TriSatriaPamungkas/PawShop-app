import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
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
import { IMAGES } from "../../constants/images";
import { useItemStore } from "../../store/useItemStore";
import { ItemCategory } from "../../types";
import { validateItem } from "../../utils/validation";

export default function AddItemScreen() {
  const router = useRouter();
  const addItem = useItemStore((state) => state.addItem);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState<ItemCategory>("cat");
  const [isReady, setIsReady] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState({ visible: false, message: "" });

  const showToast = (message: string) => {
    setToast({ visible: true, message });
  };

  const handleSave = () => {
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

    addItem(itemData);
    showToast("Item berhasil ditambahkan!");

    setTimeout(() => {
      router.back();
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add New Item</Text>
      </View>

      <ScrollView style={styles.content}>
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
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
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
          {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
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
          {errors.stock && <Text style={styles.errorText}>{errors.stock}</Text>}
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
                    styles.categoryText,
                    category === cat && styles.categoryTextActive,
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
          title="Add Item"
          onPress={handleSave}
          style={styles.saveButton}
        />
      </ScrollView>

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
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    marginRight: 16,
  },
  backText: {
    fontSize: 24,
    color: "#3B82F6",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  content: {
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
  categoryText: {
    color: "#6B7280",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  categoryTextActive: {
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
  saveButton: {
    marginTop: 8,
    marginBottom: 24,
  },
});
