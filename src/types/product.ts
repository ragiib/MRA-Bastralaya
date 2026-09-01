import { DepartmentType, ProductStatusType } from '@/data/adminProductOptions';

export interface ProductItem {
  id: string;
  name: string;
  department: DepartmentType;
  category: string;
  categorySlug: string;
  price: number;
  salePrice?: number | null;
  stock: number;
  status: ProductStatusType;
  description: string;
  images: string[];
  createdAt: string;
  updatedAt: string;

  // Department-specific attributes
  fabric?: string;
  color?: string;
  blousePieceIncluded?: boolean;
  workTechnique?: string;
  occasion?: string;
  suitType?: 'Full Set' | 'Separate Pieces';
  size?: string;
  bedSize?: string;
  pillowCoversIncluded?: boolean;
}

export type CreateProductInput = Omit<ProductItem, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateProductInput = Partial<CreateProductInput>;

export interface ProductFilters {
  department?: string;
  category?: string;
  categorySlug?: string;
  status?: string;
  search?: string;
}
