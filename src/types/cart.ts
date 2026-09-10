import { DepartmentType, ProductStatusType } from '@/data/adminProductOptions';

export interface CartItemProduct {
  id: string;
  name: string;
  department: DepartmentType;
  category: string;
  categorySlug: string;
  price: number;
  salePrice?: number | null;
  stock: number;
  status: ProductStatusType;
  images: string[];
  fabric?: string;
  color?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  priceAtAdd: number;
  product: CartItemProduct;
  createdAt?: string;
  updatedAt?: string;
}

export interface GuestCartItemInput {
  productId: string;
  quantity: number;
  priceAtAdd: number;
}
