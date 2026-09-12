export type OrderStatus =
  | 'Pending - Awaiting WhatsApp Confirmation'
  | 'Confirmed'
  | 'Cancelled'
  | 'Fulfilled';

export interface OrderItem {
  productId: string;
  name: string;
  department?: string;
  category?: string;
  categorySlug?: string;
  quantity: number;
  price: number;
  subtotal: number;
  image?: string;
}

export interface Order {
  id: string;
  userId?: string | null;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus | string;
  source?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderInput {
  userId?: string | null;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  total: number;
  status?: string;
  source?: string;
}

export interface WhatsAppOrderPayload {
  ownerPhone?: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: {
    name: string;
    quantity: number;
    price: number;
    department?: string;
    category?: string;
  }[];
  total: number;
}
