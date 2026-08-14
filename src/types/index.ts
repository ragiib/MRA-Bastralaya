export interface Product {
  id: string;
  name: string;
  category: string;
  fabric: string;
  price: number;
  originalPrice?: number;
  discount?: string;
  rating: number;
  reviewCount: number;
  image: string;
  description: string;
  isNew?: boolean;
  isBestseller?: boolean;
  inStock: boolean;
  colors?: string[];
  ocassion?: string;
}

export interface Category {
  id: string;
  name: string;
  itemCount: string;
  image: string;
  description: string;
  slug: string;
  tag?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  comment: string;
  verified: boolean;
  avatar: string;
}
