import { Product } from '../types';

export interface LadiesSuitCategory {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  fabric: string;
  image: string;
  imageAlt?: string;
  itemCountLabel: string;
}

export interface LadiesSuitProduct extends Product {
  categorySlug: string;
}

export const LADIES_SUIT_CATEGORIES: LadiesSuitCategory[] = [
  {
    id: 'lsc-1',
    name: 'Cotton Batik',
    slug: 'cotton-batik',
    shortDescription: 'Handcrafted wax-resist dyed pure cotton suit sets featuring distinctive crackle patterns, earthy artisan hues, and coordinating cotton dupattas.',
    fabric: 'Pure Cotton Batik',
    image: '/images/ladies-suits/cotton_batik.jpg',
    imageAlt: 'Handcrafted Cotton Batik ladies salwar suit set with matching dupatta',
    itemCountLabel: 'Handcrafted Batik'
  },
  {
    id: 'lsc-2',
    name: 'Phulkari Cotton — All Types',
    slug: 'phulkari-cotton-all-types',
    shortDescription: 'Vibrant Punjabi Phulkari embroidery on premium cotton suits, showcasing dense floral and geometric silk-thread needlework with ornate dupattas.',
    fabric: 'Pure Cotton & Silk Floss',
    image: '/images/ladies-suits/phulkari_cotton.jpg',
    imageAlt: 'Authentic Phulkari Cotton ladies suit set with intricate embroidery',
    itemCountLabel: 'Artisan Embroidery'
  },
  {
    id: 'lsc-3',
    name: 'Printed Cotton',
    slug: 'printed-cotton',
    shortDescription: 'Everyday and festive pure cotton suit sets featuring traditional block prints, graceful floral motifs, and airy breathable comfort.',
    fabric: '100% Breathable Cotton',
    image: '/images/ladies-suits/printed_cotton.jpg',
    imageAlt: 'Floral printed cotton ladies suit salwar kameez set with dupatta',
    itemCountLabel: 'Daily & Festive'
  }
];

export const LADIES_SUIT_PRODUCTS: LadiesSuitProduct[] = [
  // 1. Cotton Batik
  {
    id: 'suit-cb-1',
    name: 'Handcrafted Indigo Blue Cotton Batik Salwar Suit Set',
    category: 'Cotton Batik',
    categorySlug: 'cotton-batik',
    fabric: 'Pure Cotton Batik',
    price: 2150,
    originalPrice: 2600,
    discount: '17% OFF',
    rating: 4.8,
    reviewCount: 19,
    image: '/images/ladies-suits/cotton_batik.jpg',
    description: 'Authentic wax-resist dyed pure cotton batik kurta paired with tailored pants and an artistic all-over batik patterned dupatta.',
    inStock: true,
    available: true,
    isBestseller: true
  },
  {
    id: 'suit-cb-2',
    name: 'Terracotta Floral Motif Cotton Batik Unstitched Suit Material',
    category: 'Cotton Batik',
    categorySlug: 'cotton-batik',
    fabric: '100% Combed Cotton',
    price: 1850,
    originalPrice: 2200,
    discount: '15% OFF',
    rating: 4.7,
    reviewCount: 14,
    image: '/images/ladies-suits/cotton_batik.jpg',
    description: 'Hand-dyed earthy terracotta batik print unstitched fabric set with authentic crackle wax detailing and breathable mulmul dupatta.',
    inStock: true,
    available: true,
    isNew: true
  },

  // 2. Phulkari Cotton — All Types
  {
    id: 'suit-ph-1',
    name: 'Authentic Amritsari Phulkari Hand Embroidered Cotton Suit',
    category: 'Phulkari Cotton — All Types',
    categorySlug: 'phulkari-cotton-all-types',
    fabric: 'Cotton with Silk Floss Needlework',
    price: 3450,
    originalPrice: 4200,
    discount: '18% OFF',
    rating: 4.9,
    reviewCount: 28,
    image: '/images/ladies-suits/phulkari_cotton.jpg',
    description: 'Intricate traditional Punjabi Phulkari geometric embroidery on soft cotton fabric, accompanied by a grand artisanal embroidered Phulkari dupatta.',
    inStock: true,
    available: true,
    isBestseller: true
  },
  {
    id: 'suit-ph-2',
    name: 'Floral Jaal Work Phulkari Cotton Salwar Kameez Set',
    category: 'Phulkari Cotton — All Types',
    categorySlug: 'phulkari-cotton-all-types',
    fabric: 'Pure Cotton Handloom',
    price: 3850,
    originalPrice: 4600,
    discount: '16% OFF',
    rating: 4.9,
    reviewCount: 16,
    image: '/images/ladies-suits/phulkari_cotton.jpg',
    description: 'Dense Phulkari needlecraft with vibrant silk thread motifs across the kurta neckline and hem, paired with a matching embroidered dupatta.',
    inStock: true,
    available: true,
    isNew: true
  },

  // 3. Printed Cotton
  {
    id: 'suit-pc-1',
    name: 'Jaipuri Hand Block Printed Mulmul Cotton Suit Set',
    category: 'Printed Cotton',
    categorySlug: 'printed-cotton',
    fabric: '100% Mulmul Cotton',
    price: 1750,
    originalPrice: 2100,
    discount: '16% OFF',
    rating: 4.8,
    reviewCount: 32,
    image: '/images/ladies-suits/printed_cotton.jpg',
    description: 'Lightweight breathable pure cotton salwar suit accented with delicate floral block prints, straight fit pants, and full-length printed dupatta.',
    inStock: true,
    available: true,
    isBestseller: true
  },
  {
    id: 'suit-pc-2',
    name: 'Pastel Botanical Mint Print Daily Comfort Cotton Suit',
    category: 'Printed Cotton',
    categorySlug: 'printed-cotton',
    fabric: 'Soft Organic Cotton',
    price: 1550,
    originalPrice: 1850,
    discount: '16% OFF',
    rating: 4.7,
    reviewCount: 21,
    image: '/images/ladies-suits/printed_cotton.jpg',
    description: 'Gentle pastel mint and blush floral printed cotton suit material designed for refreshing all-day elegance and airy comfort.',
    inStock: true,
    available: true,
    isNew: true
  }
];
