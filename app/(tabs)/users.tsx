import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Toast } from "../../components/Toast";
import { useAuthStore } from "../../store/useAuthStore";
import { User } from "../../types";

export default function UsersScreen() {
  const users = useAuthStore((state) => state.users);
  const fetchUsers = useAuthStore((state) => state.fetchUsers);
  const deleteUser = useAuthStore((state) => state.deleteUser);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success" as "success" | "error",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setToast({ visible: true, message, type });
  };

  const handleDelete = (user: User) => {
    Alert.alert(
      "Hapus User",
      `Yakin ingin menghapus user "${user.username}"?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            await deleteUser(user.id);
            showToast("User berhasil dihapus!");
            fetchUsers();
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Customer Management</Text>
        <Text style={styles.subtitle}>{users.length} customers registered</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tableContainer}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, styles.usernameColumn]}>
                Username
              </Text>
              <Text style={[styles.headerCell, styles.emailColumn]}>Email</Text>
              <Text style={[styles.headerCell, styles.dateColumn]}>
                Registered
              </Text>
              <Text style={[styles.headerCell, styles.actionColumn]}>
                Action
              </Text>
            </View>

            {/* Table Body */}
            {users.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No customers registered yet
                </Text>
              </View>
            ) : (
              <FlatList
                data={users}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                  <View
                    style={[
                      styles.tableRow,
                      index % 2 === 0 && styles.tableRowEven,
                    ]}
                  >
                    <Text style={[styles.cell, styles.usernameColumn]}>
                      {item.username}
                    </Text>
                    <Text style={[styles.cell, styles.emailColumn]}>
                      {item.email}
                    </Text>
                    <Text style={[styles.cell, styles.dateColumn]}>
                      {formatDate(item.createdAt)}
                    </Text>
                    <View style={[styles.actionColumn]}>
                      <TouchableOpacity
                        onPress={() => handleDelete(item)}
                        style={styles.deleteButton}
                      >
                        <Text style={styles.deleteButtonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />
            )}
          </View>
        </ScrollView>
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
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
  tableContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    minWidth: 600,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderBottomWidth: 2,
    borderBottomColor: "#E5E7EB",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  headerCell: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  tableRowEven: {
    backgroundColor: "#F9FAFB",
  },
  cell: {
    fontSize: 14,
    color: "#1F2937",
  },
  usernameColumn: {
    width: 150,
  },
  emailColumn: {
    width: 200,
  },
  dateColumn: {
    width: 120,
  },
  actionColumn: {
    width: 100,
  },
  deleteButton: {
    backgroundColor: "#FEE2E2",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
  },
});
