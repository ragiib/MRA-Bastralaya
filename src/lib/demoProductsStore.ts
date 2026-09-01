/**
 * TEMPORARY DEMO PRODUCT STORE (Phase B UX Prototype)
 * 
 * NOTE FOR DEVELOPER & BUSINESS OWNER:
 * This is an in-memory/localStorage prototype store designed for reviewing the
 * "Add Product" and "Product Listing" user experience with the business owner.
 * NO permanent database writes occur here. Real SQL database schema & persistence
 * will be implemented in a subsequent phase once the form fields and product
 * attributes are finalized and approved.
 */

import { DepartmentType, ProductStatusType } from '@/data/adminProductOptions';

export interface DemoProduct {
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

  // Department-specific attributes
  // Sarees:
  fabric?: string;
  blousePieceIncluded?: boolean;
  workTechnique?: string;
  color?: string;
  occasion?: string;

  // Ladies Suits:
  suitType?: 'Full Set' | 'Separate Pieces';
  size?: string;

  // Bed Sheets:
  bedSize?: string;
  pillowCoversIncluded?: boolean;
}

export const INITIAL_DEMO_PRODUCTS: DemoProduct[] = [
  {
    id: 'demo-p1',
    name: 'Royal Crimson Handloom Tant Cotton Saree',
    department: 'Sarees',
    category: 'Tant Cotton',
    categorySlug: 'tant-cotton',
    price: 3499,
    salePrice: 2999,
    stock: 14,
    status: 'Active',
    description: 'Crisp Bengal handloom tant cotton saree with woven temple border and delicate floral jaal motifs.',
    images: ['/images/sarees/02_tant_cotton.jpg'],
    fabric: 'Handloom Tant Cotton',
    blousePieceIncluded: true,
    workTechnique: 'Woven Jacquard Temple Border',
    color: 'Royal Crimson & Gold',
    occasion: 'Puja & Festival',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'demo-p2',
    name: 'Midnight Blue Pure Jamdani Cotton Saree',
    department: 'Sarees',
    category: 'Pure Jamdani Cotton',
    categorySlug: 'pure-jamdani-cotton',
    price: 8999,
    salePrice: null,
    stock: 5,
    status: 'Active',
    description: 'Airy handwoven Jamdani cotton with geometric floral buttis across the body and heavy pallu.',
    images: ['/images/sarees/03_pure_jamdani_cotton.jpg'],
    fabric: 'Pure Jamdani Cotton',
    blousePieceIncluded: false,
    workTechnique: 'Traditional Handloom Jamdani Weave',
    color: 'Midnight Blue & Silver',
    occasion: 'Traditional Weave',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'demo-p3',
    name: 'Artisan Indigo Handcrafted Cotton Batik Suit Set',
    department: 'Ladies Suits',
    category: 'Cotton Batik',
    categorySlug: 'cotton-batik',
    price: 2150,
    salePrice: 1850,
    stock: 22,
    status: 'Active',
    description: 'Authentic wax-resist dyed pure cotton suit set with coordinating cotton dupatta and bottom material.',
    images: ['/images/ladies-suits/cotton_batik.jpg'],
    suitType: 'Full Set',
    size: 'Free Size (Unstitched)',
    fabric: 'Pure Cotton Batik',
    color: 'Indigo Blue & White',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'demo-p4',
    name: 'Vibrant Punjabi Phulkari Embroidered Cotton Suit',
    department: 'Ladies Suits',
    category: 'Phulkari Cotton — All Types',
    categorySlug: 'phulkari-cotton-all-types',
    price: 3899,
    salePrice: null,
    stock: 0,
    status: 'Sold Out',
    description: 'Heavy silk floss geometric needlework on fine cotton fabric with grand Phulkari dupatta.',
    images: ['/images/ladies-suits/phulkari_cotton.jpg'],
    suitType: 'Full Set',
    size: 'Free Size (Unstitched)',
    fabric: 'Pure Cotton & Silk Floss',
    color: 'Mustard Yellow & Red',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'demo-p5',
    name: 'Phulkari Handwork Pure Cotton King Bed Sheet Set',
    department: 'Bed Sheets',
    category: 'Phulkari Handwork Bed Sheet',
    categorySlug: 'phulkari-handwork-bed-sheet',
    price: 2899,
    salePrice: 2499,
    stock: 8,
    status: 'Active',
    description: 'Heritage Punjabi Phulkari floral hand-embroidered king-size pure cotton bed sheet with two pillow covers.',
    images: ['/images/bed-sheets/phulkari_bedsheet_cat.jpg'],
    bedSize: 'King (108 x 108 in)',
    pillowCoversIncluded: true,
    fabric: '100% Pure Cotton with Silk Floss Embroidery',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-p6',
    name: 'Emerald Baluchari Swarnachari Silk Saree (Sample Draft)',
    department: 'Sarees',
    category: 'Baluchari Silk',
    categorySlug: 'baluchari-silk',
    price: 16500,
    salePrice: null,
    stock: 2,
    status: 'Draft',
    description: 'Narrative woven silk saree from Bengal portraying mythological motifs in pure gold and silver zari thread.',
    images: ['/images/sarees/10_baluchari_silk.jpg'],
    fabric: 'Pure Baluchari Swarnachari Silk',
    blousePieceIncluded: true,
    workTechnique: 'Mythological Minakari Weave',
    color: 'Emerald Green & Gold',
    occasion: 'Bridal & Wedding',
    createdAt: new Date().toISOString(),
  },
];

const LOCAL_STORAGE_KEY = 'mra_demo_admin_products_v1';

/**
 * Returns current demo products. Syncs with browser localStorage if available.
 */
export function getDemoProducts(): DemoProduct[] {
  if (typeof window === 'undefined') {
    return INITIAL_DEMO_PRODUCTS;
  }

  try {
    const saved = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    // Initialize with defaults
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_PRODUCTS));
    return INITIAL_DEMO_PRODUCTS;
  } catch {
    return INITIAL_DEMO_PRODUCTS;
  }
}

/**
 * Saves a new demo product to the in-memory/localStorage store.
 */
export function saveDemoProduct(productData: Omit<DemoProduct, 'id' | 'createdAt'>): DemoProduct {
  const newProduct: DemoProduct = {
    ...productData,
    id: `demo-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    try {
      const existing = getDemoProducts();
      const updated = [newProduct, ...existing];
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not persist demo product to localStorage:', e);
    }
  }

  return newProduct;
}

/**
 * Retrieves a single demo product by its ID.
 */
export function getDemoProductById(id: string): DemoProduct | null {
  const products = getDemoProducts();
  return products.find((p) => p.id === id) || null;
}

/**
 * Updates an existing demo product in the in-memory/localStorage store.
 * Returns the updated product, or null if not found.
 */
export function updateDemoProduct(
  id: string,
  updatedData: Partial<Omit<DemoProduct, 'id' | 'createdAt'>>
): DemoProduct | null {
  const existingProducts = getDemoProducts();
  const index = existingProducts.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const updatedProduct: DemoProduct = {
    ...existingProducts[index],
    ...updatedData,
    id,
    createdAt: existingProducts[index].createdAt,
  };

  const updatedList = [...existingProducts];
  updatedList[index] = updatedProduct;

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
    } catch (e) {
      console.warn('Could not persist updated demo product to localStorage:', e);
    }
  }

  return updatedProduct;
}

/**
 * Deletes a demo product by its ID from the in-memory/localStorage store.
 * Returns true if deleted, false if not found.
 */
export function deleteDemoProduct(id: string): boolean {
  const existingProducts = getDemoProducts();
  const index = existingProducts.findIndex((p) => p.id === id);
  if (index === -1) return false;

  const updatedList = existingProducts.filter((p) => p.id !== id);

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
    } catch (e) {
      console.warn('Could not persist product deletion to localStorage:', e);
    }
  }

  return true;
}

/**
 * Resets demo products to the initial set.
 */
export function resetDemoProducts(): void {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(LOCAL_STORAGE_KEY);
  }
}

