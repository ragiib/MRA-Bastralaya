import { Product } from '../types';

export interface BedSheetCategory {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  fabric: string;
  image: string;
  imageAlt?: string;
  itemCountLabel: string;
}

export interface BedSheetProduct extends Product {
  categorySlug: string;
  size?: string;
  dimensions?: string;
  pillowCoversIncluded?: number;
}

export const BED_SHEET_CATEGORIES: BedSheetCategory[] = [
  {
    id: 'bsc-1',
    name: 'Phulkari Handwork Bed Sheet',
    slug: 'phulkari-handwork-bed-sheet',
    shortDescription: 'Traditional Punjabi Phulkari silk-thread geometric and floral handwork embroidered on premium pure cotton bed sheets, accompanied by coordinating embroidered pillow covers for exquisite bedroom elegance.',
    fabric: '100% Pure Cotton with Silk Floss Embroidery',
    image: '/images/bed-sheets/phulkari_bedsheet_cat.jpg',
    imageAlt: 'Handcrafted Phulkari Handwork Pure Cotton Bed Sheet set with matching pillow covers',
    itemCountLabel: 'Artisan Handwork'
  }
];

export const BED_SHEET_PRODUCTS: BedSheetProduct[] = [
  {
    id: 'bs-ph-1',
    name: 'Handcrafted Phulkari Geometric Motif King Size Bed Sheet Set',
    category: 'Phulkari Handwork Bed Sheet',
    categorySlug: 'phulkari-handwork-bed-sheet',
    fabric: '100% Pure Cotton & Silk Floss',
    size: 'King Size',
    dimensions: '108 x 108 inches (274 x 274 cm)',
    pillowCoversIncluded: 2,
    price: 2850,
    originalPrice: 3400,
    discount: '16% OFF',
    rating: 4.9,
    reviewCount: 27,
    image: '/images/bed-sheets/phulkari_bedsheet_prod1.jpg',
    description: 'Grand King size pure cotton bed sheet adorned with authentic crimson and emerald green Punjabi Phulkari diamond hand embroidery, including 2 matching embroidered pillow covers.',
    inStock: true,
    available: true,
    isBestseller: true
  },
  {
    id: 'bs-ph-2',
    name: 'Royal Blue & Amber Silk Thread Phulkari Queen Bed Sheet Set',
    category: 'Phulkari Handwork Bed Sheet',
    categorySlug: 'phulkari-handwork-bed-sheet',
    fabric: 'Glazed Cotton Handloom',
    size: 'Queen Size',
    dimensions: '90 x 100 inches (228 x 254 cm)',
    pillowCoversIncluded: 2,
    price: 2450,
    originalPrice: 2950,
    discount: '17% OFF',
    rating: 4.8,
    reviewCount: 18,
    image: '/images/bed-sheets/phulkari_bedsheet_prod2.jpg',
    description: 'Queen size breathable cotton bed sheet accented with vibrant royal blue and amber yellow Phulkari needlework, complete with 2 coordinating pillow covers.',
    inStock: true,
    available: true,
    isNew: true
  },
  {
    id: 'bs-ph-3',
    name: 'Traditional Amritsari Festive Maroon Phulkari Double Bed Sheet',
    category: 'Phulkari Handwork Bed Sheet',
    categorySlug: 'phulkari-handwork-bed-sheet',
    fabric: 'High-Count Combed Cotton',
    size: 'Double Bed Size',
    dimensions: '90 x 95 inches (228 x 241 cm)',
    pillowCoversIncluded: 2,
    price: 2650,
    originalPrice: 3150,
    discount: '15% OFF',
    rating: 4.9,
    reviewCount: 22,
    image: '/images/bed-sheets/phulkari_bedsheet_prod3.jpg',
    description: 'Double bed size pure combed cotton bed sheet featuring rich festive maroon and marigold yellow Phulkari hand embroidery with delicate border accents and 2 pillowcases.',
    inStock: true,
    available: true,
    isBestseller: true
  }
];
