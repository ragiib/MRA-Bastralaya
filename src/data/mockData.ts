import { Category, Product, Testimonial } from '../types';

export const MAIN_DEPARTMENTS: Category[] = [
  {
    id: 'dept-sarees',
    name: 'Sarees',
    slug: 'sarees',
    itemCount: 'Explore Collection',
    image: '/images/category_sarees.jpg',
    description: 'A curated selection of traditional, festive, and contemporary sarees featuring exquisite weaves, rich borders, and timeless elegance.',
    tag: 'Department 01'
  },
  {
    id: 'dept-ladies-suits',
    name: 'Ladies Suits',
    slug: 'ladies-suits',
    itemCount: 'Explore Collection',
    image: '/images/category_ladies_suits.jpg',
    description: 'Graceful salwar suits, unstitched dress materials, and designer ethnic sets paired with beautifully crafted dupattas.',
    tag: 'Department 02'
  },
  {
    id: 'dept-bed-sheets',
    name: 'Bed Sheets',
    slug: 'bed-sheets',
    itemCount: 'Explore Collection',
    image: '/images/category_bed_sheets.jpg',
    description: 'Comfortable pure cotton bed sheets, traditional prints, and premium home textiles crafted for everyday luxury.',
    tag: 'Department 03'
  }
];

export const STORE_SERVICES = [
  {
    title: 'Quality Fabrics',
    description: 'Carefully chosen materials across sarees, suits, and bed linen prioritizing comfort, feel, and durability.'
  },
  {
    title: 'Curated Variety',
    description: 'A balanced selection spanning everyday essentials to grand celebratory ethnic wear under one roof.'
  },
  {
    title: 'Dedicated Assistance',
    description: 'Friendly support to help you find the right designs, sizes, and fabric specifications for your needs.'
  },
  {
    title: 'Safe Packing & Shipping',
    description: 'Secure, clean packaging and dependable delivery services directly to your doorstep.'
  }
];

export const PRODUCTS: Product[] = [
  {
    id: 'p-101',
    name: 'Royal Crimson Kanjeevaram Pure Silk Saree',
    category: 'Kanjeevaram Silk',
    fabric: '100% Pure Mulberry Silk',
    price: 18499,
    originalPrice: 22999,
    discount: '20% OFF',
    rating: 4.9,
    reviewCount: 48,
    image: '/images/hero_saree_banner.jpg',
    description: 'Woven by master artisans in Kanchipuram, featuring pure gold zari brocade, heavy pallu, and matching unstitched blouse piece.',
    isBestseller: true,
    inStock: true,
    colors: ['Crimson Red', 'Royal Maroon', 'Gold'],
    ocassion: 'Bridal & Festive'
  },
  {
    id: 'p-102',
    name: 'Heritage Royal Blue Banarasi Zari Brocade Saree',
    category: 'Banarasi Brocade',
    fabric: 'Pure Katan Silk',
    price: 15999,
    originalPrice: 19999,
    discount: '20% OFF',
    rating: 4.8,
    reviewCount: 36,
    image: '/images/banarasi_saree_cat.jpg',
    description: 'Classic Varanasi handloom silk saree adorned with intricate silver-gold kadwa floral zari motifs across the body.',
    isNew: true,
    inStock: true,
    colors: ['Royal Blue', 'Midnight Navy'],
    ocassion: 'Reception & Grand Events'
  },
  {
    id: 'p-103',
    name: 'Authentic Deep Maroon Silk Mark Certified Saree',
    category: 'Pure Silk Collection',
    fabric: 'Pure Soft Silk',
    price: 12999,
    originalPrice: 15499,
    discount: '16% OFF',
    rating: 4.9,
    reviewCount: 52,
    image: '/images/silk_saree_cat.jpg',
    description: 'Luxurious maroon silk saree with traditional temple border design and glistening gold woven checks.',
    isBestseller: true,
    inStock: true,
    colors: ['Deep Maroon', 'Copper Gold'],
    ocassion: 'Puja & Festival'
  },
  {
    id: 'p-104',
    name: 'Handcrafted Pastel Floral Chanderi Tissue Saree',
    category: 'Chanderi & Cotton',
    fabric: 'Chanderi Silk Cotton',
    price: 6499,
    originalPrice: 7999,
    discount: '18% OFF',
    rating: 4.7,
    reviewCount: 29,
    image: '/images/hero_saree_banner.jpg',
    description: 'Featherlight Chanderi saree with hand-printed lotus flowers, shimmering gold zari tissue border, and cool summer drape.',
    isNew: true,
    inStock: true,
    colors: ['Peach Pink', 'Mint Green', 'Cream'],
    ocassion: 'Casual Luxury & Daytime Events'
  },
  {
    id: 'p-105',
    name: 'Yeola Paithani Pure Silk Peacock Border Saree',
    category: 'Pure Silk Collection',
    fabric: 'Pure Handloom Paithani Silk',
    price: 21999,
    originalPrice: 25999,
    discount: '15% OFF',
    rating: 5.0,
    reviewCount: 19,
    image: '/images/banarasi_saree_cat.jpg',
    description: 'Signature Maharashtrian Paithani silk saree featuring tapestry-woven peacock (Mor) motifs on pallu and golden border.',
    isBestseller: true,
    inStock: true,
    colors: ['Emerald Green', 'Magenta Pink'],
    ocassion: 'Traditional Wedding'
  },
  {
    id: 'p-106',
    name: 'Mustard Gold Tussar Silk Hand Block Printed Saree',
    category: 'Pure Silk Collection',
    fabric: 'Wild Tussar Silk',
    price: 8999,
    originalPrice: 10999,
    discount: '18% OFF',
    rating: 4.6,
    reviewCount: 22,
    image: '/images/silk_saree_cat.jpg',
    description: 'Textured natural Tussar silk saree with authentic Kalamkari hand block print motifs and antique gold zari border.',
    isNew: false,
    inStock: true,
    colors: ['Mustard Gold', 'Rust Orange'],
    ocassion: 'Ethnic Formal'
  },
  {
    id: 'p-107',
    name: 'Bridal Crimson Velvet & Zardosi Designer Saree',
    category: 'Wedding Bridal Suite',
    fabric: 'Organza & Silk Velvet',
    price: 24999,
    originalPrice: 29999,
    discount: '16% OFF',
    rating: 4.9,
    reviewCount: 41,
    image: '/images/hero_saree_banner.jpg',
    description: 'Showstopping bridal creation combining sheer hand-embroidered organza drape with a handcrafted velvet rich zardosi border.',
    isBestseller: true,
    inStock: true,
    colors: ['Crimson Red', 'Wine Purple'],
    ocassion: 'Bridal Wear'
  },
  {
    id: 'p-108',
    name: 'Emerald Green Organza Hand Embroidered Saree',
    category: 'Chanderi & Cotton',
    fabric: 'Pure Silk Organza',
    price: 9499,
    originalPrice: 11999,
    discount: '20% OFF',
    rating: 4.8,
    reviewCount: 17,
    image: '/images/banarasi_saree_cat.jpg',
    description: 'Contemporary translucent silk organza saree accented with delicate cutwork border and shimmer gota patti detail.',
    isNew: true,
    inStock: true,
    colors: ['Emerald Green', 'Pistachio'],
    ocassion: 'Cocktail & Sangeet'
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't-1',
    name: 'Sunita Sharma',
    location: 'Kolkata, West Bengal',
    rating: 5,
    comment: 'The Kanjeevaram silk saree I ordered for my daughter’s wedding was breathtaking! Pure silk mark quality, exact rich crimson color as pictured.',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 't-2',
    name: 'Priya Agarwal',
    location: 'Mumbai, Maharashtra',
    rating: 5,
    comment: 'MRA Bastralaya has become our family store for authentic handloom sarees. The weaving quality and genuine prices are unmatched!',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 't-3',
    name: 'Ananya Rao',
    location: 'Bengaluru, Karnataka',
    rating: 5,
    comment: 'Exquisite Banarasi silk! Shipping was prompt within 2 days, and the saree packaging felt truly luxury. Will definitely purchase again.',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200'
  }
];

export const BRAND_STATS = [
  { label: 'Years of Heritage', value: '45+' },
  { label: 'Happy Customers', value: '50,000+' },
  { label: 'Weaver Artisans', value: '1,200+' },
  { label: 'Authentic Sarees', value: '100%' }
];

