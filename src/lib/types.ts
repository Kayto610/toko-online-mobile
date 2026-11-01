// Bentuk data mengikuti response toko-online-backend.

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
  createdAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selected: boolean;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  /** jumlah barang yang dicentang */
  totalItems: number;
  /** total harga barang yang dicentang */
  totalPrice: number;
}

export type PaymentMethod = 'transfer_bank' | 'e_wallet';

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';

export interface OrderItem {
  product: string;
  name: string;
  price: number;
  imageUrl?: string;
  quantity: number;
}

export interface Order {
  _id: string;
  user: string | { _id: string; name: string; email: string };
  items: OrderItem[];
  shippingAddress: string;
  paymentMethod: PaymentMethod;
  totalPrice: number;
  status: OrderStatus;
  isPaid: boolean;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ProductListResponse extends ApiResponse<Product[]> {
  count: number;
  total: number;
  page: number;
  pages: number;
}

export interface AuthPayload {
  user: User;
  token: string;
}
