export type ItemCategory = "cat" | "dog";

export interface Item {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: ItemCategory;
  image: string;
  isReady: boolean;
}

export interface CartItem extends Item {
  quantity: number;
}

export interface Transaction {
  id: string;
  items: CartItem[];
  total: number;
  date: string;
  userId: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: "admin" | "customer";
  createdAt: string;
}
