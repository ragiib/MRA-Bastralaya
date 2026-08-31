export interface SareeCategory {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  fabric: string;
  image: string;
  imageAlt?: string;
  itemCountLabel: string;
}

export interface SareeProduct {
  id: string;
  name: string;
  category: string;
  categorySlug: string;
  fabric: string;
  price: number;
  originalPrice?: number;
  discount?: string;
  rating: number;
  reviewCount: number;
  image: string;
  description: string;
  inStock: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
}

export const SAREE_CATEGORIES: SareeCategory[] = [
  {
    id: 'sc-1',
    name: 'Printed Cotton',
    slug: 'printed-cotton',
    shortDescription: 'Lightweight breathable cotton sarees featuring traditional block prints, floral motifs, and daily comfort.',
    fabric: 'Pure Cotton',
    image: '/images/sarees/01_printed_cotton.jpg',
    imageAlt: 'Purple printed cotton sari with gold floral border',
    itemCountLabel: 'Curated Designs'
  },
  {
    id: 'sc-2',
    name: 'Tant Cotton',
    slug: 'tant-cotton',
    shortDescription: 'Iconic Bengal handloom cotton sarees known for their crisp texture, light drape, and artistic woven borders.',
    fabric: 'Handloom Tant Cotton',
    image: '/images/sarees/02_tant_cotton.jpg',
    imageAlt: 'Traditional Bengal tant cotton sari with woven border',
    itemCountLabel: 'Bengal Handloom'
  },
  {
    id: 'sc-3',
    name: 'Pure Jamdani Cotton',
    slug: 'pure-jamdani-cotton',
    shortDescription: 'Exquisite handwoven floral and geometric jamdani motifs woven into airy sheer cotton fabric.',
    fabric: 'Pure Jamdani Cotton',
    image: '/images/sarees/03_pure_jamdani_cotton.jpg',
    imageAlt: 'Pure Jamdani handloom cotton sari with floral motifs',
    itemCountLabel: 'Fine Handwoven'
  },
  {
    id: 'sc-4',
    name: 'Handloom (All Types)',
    slug: 'handloom-all-types',
    shortDescription: 'Authentic artisan-woven handloom sarees representing diverse regional weaving traditions across India.',
    fabric: 'Assorted Handloom Weaves',
    image: '/images/sarees/04_handloom_all_types.jpg',
    imageAlt: 'Handloom silk cotton sari with gold zari and traditional border',
    itemCountLabel: 'Artisan Weaves'
  },
  {
    id: 'sc-5',
    name: 'Gadwal Cotton',
    slug: 'gadwal-cotton',
    shortDescription: 'Traditional handwoven cotton sarees featuring contrasting rich zari and silk borders with intricate pallu designs.',
    fabric: 'Gadwal Cotton & Silk Border',
    image: '/images/sarees/05_gadwal_cotton.jpg',
    imageAlt: 'Emerald green Gadwal handloom sari with gold peacock border',
    itemCountLabel: 'Zari Borders'
  },
  {
    id: 'sc-6',
    name: 'Linen Silk',
    slug: 'linen-silk',
    shortDescription: 'A luxurious blend of breezy natural linen and lustrous silk offering contemporary elegance and fluid drape.',
    fabric: 'Organic Linen Silk',
    image: '/images/sarees/06_linen_silk.jpg',
    imageAlt: 'Deep maroon linen silk sari with woven temple border',
    itemCountLabel: 'Modern Drape'
  },
  {
    id: 'sc-7',
    name: 'Linen Cotton',
    slug: 'linen-cotton',
    shortDescription: 'Everyday elegance combining the cool breathability of pure cotton with the crisp, modern texture of natural linen.',
    fabric: 'Natural Linen Cotton',
    image: '/images/sarees/07_linen_cotton.jpg',
    imageAlt: 'Natural woven linen cotton sari displayed on boutique rack',
    itemCountLabel: 'All-Day Wear'
  },
  {
    id: 'sc-8',
    name: 'Linen Batik',
    slug: 'linen-batik',
    shortDescription: 'Handcrafted wax-resist batik print patterns on rich, comfortable linen fabrics in vibrant earthy tones.',
    fabric: 'Handcrafted Linen Batik',
    image: '/images/sarees/08_linen_batik.jpg',
    imageAlt: 'Artisanal handcrafted linen batik sari fold',
    itemCountLabel: 'Batik Craft'
  },
  {
    id: 'sc-9',
    name: 'Assam Gicha',
    slug: 'assam-gicha',
    shortDescription: 'Authentic textured northeastern Gicha silk sarees with distinctive raw natural luster and tribal geometric motifs.',
    fabric: 'Wild Assam Gicha Silk',
    image: '/images/sarees/09_assam_gicha.jpg',
    imageAlt: 'Assam wild silk sari drape with gold zari pallu',
    itemCountLabel: 'Wild Raw Silk'
  },
  {
    id: 'sc-10',
    name: 'Baluchari Silk',
    slug: 'baluchari-silk',
    shortDescription: 'Renowned heritage silk sarees from West Bengal depicting mythological scenes and narrative motifs on rich pallus.',
    fabric: 'Pure Baluchari Swarnachari Silk',
    image: '/images/sarees/10_baluchari_silk.jpg',
    imageAlt: 'Midnight blue Baluchari silk sari with ornate zari brocade',
    itemCountLabel: 'Mythological Weave'
  },
  {
    id: 'sc-11',
    name: 'Tassar Silk',
    slug: 'tassar-silk',
    shortDescription: 'Rich wild silk sarees celebrated for their natural golden sheen, textured handfeel, and regal presence.',
    fabric: 'Pure Tassar Silk',
    image: '/images/sarees/11_tassar_silk.jpg',
    imageAlt: 'Natural Tassar silk sari with woven gold zari pallu detail',
    itemCountLabel: 'Golden Lustre'
  },
  {
    id: 'sc-12',
    name: 'Matka Tassar',
    slug: 'matka-tassar',
    shortDescription: 'Thick hand-spun Matka mulberry silk paired with raw Tassar silk for a distinctive rustic luxury appeal.',
    fabric: 'Handspun Matka & Tassar Silk',
    image: '/images/sarees/12_matka_tassar.jpg',
    imageAlt: 'Crimson red Matka Tassar textured silk sari with zari border',
    itemCountLabel: 'Handspun Luxury'
  },
  {
    id: 'sc-13',
    name: 'Katha Tassar',
    slug: 'katha-tassar',
    shortDescription: 'Pure Tassar silk sarees decorated with intricate hand-embroidered Kantha stitch work by skilled artisans.',
    fabric: 'Tassar Silk with Kantha Stitch',
    image: '/images/sarees/13_katha_tassar.jpg',
    imageAlt: 'Royal crimson silk sari with intricate embroidered border',
    itemCountLabel: 'Kantha Embroidery'
  },
  {
    id: 'sc-14',
    name: 'Kota Applique',
    slug: 'kota-applique',
    shortDescription: 'Lightweight Kota Doria sarees embellished with delicate cutwork applique craftsmanship.',
    fabric: 'Kota Doria with Applique Work',
    image: '/images/sarees/14_kota_applique.jpg',
    imageAlt: 'Fine Kota lightweight sari with handcrafted motifs',
    itemCountLabel: 'Cutwork Applique'
  }
];

export const SAREE_PRODUCTS: SareeProduct[] = [
  // 1. Printed Cotton
  {
    id: 'sar-pc-1',
    name: 'Jaipuri Hand Block Printed Floral Cotton Saree',
    category: 'Printed Cotton',
    categorySlug: 'printed-cotton',
    fabric: '100% Pure Mulmul Cotton',
    price: 1850,
    originalPrice: 2200,
    discount: '15% OFF',
    rating: 4.8,
    reviewCount: 24,
    image: '/images/sarees/01_printed_cotton.jpg',
    description: 'Featherlight pure cotton saree with authentic hand block floral prints and matching running blouse piece for all-day comfort.',
    inStock: true,
    isBestseller: true
  },
  {
    id: 'sar-pc-2',
    name: 'Indigo Dabu Print Daily Wear Cotton Saree',
    category: 'Printed Cotton',
    categorySlug: 'printed-cotton',
    fabric: 'Soft Cotton',
    price: 1650,
    originalPrice: 1950,
    discount: '15% OFF',
    rating: 4.7,
    reviewCount: 18,
    image: '/images/sarees/01_printed_cotton.jpg',
    description: 'Natural indigo mud-resist Dabu print saree with delicate geometric borders crafted for effortless everyday style.',
    inStock: true,
    isNew: true
  },

  // 2. Tant Cotton
  {
    id: 'sar-tc-1',
    name: 'Traditional Bengal Dhaniakhali Tant Cotton Saree',
    category: 'Tant Cotton',
    categorySlug: 'tant-cotton',
    fabric: 'Bengal Handloom Tant',
    price: 2450,
    originalPrice: 2900,
    discount: '15% OFF',
    rating: 4.9,
    reviewCount: 31,
    image: '/images/sarees/02_tant_cotton.jpg',
    description: 'Classic Bengal handloom Tant saree featuring crisp cotton weave, traditional temple border (par), and lightweight festive feel.',
    inStock: true,
    isBestseller: true
  },
  {
    id: 'sar-tc-2',
    name: 'Phulia Soft Weave Tant Cotton Saree with Zari Par',
    category: 'Tant Cotton',
    categorySlug: 'tant-cotton',
    fabric: 'Fine Combed Tant Cotton',
    price: 2850,
    originalPrice: 3400,
    discount: '16% OFF',
    rating: 4.8,
    reviewCount: 19,
    image: '/images/sarees/02_tant_cotton.jpg',
    description: 'Phulia handloom Tant saree woven with fine combed cotton and delicate subtle zari border for puja and auspicious occasions.',
    inStock: true
  },

  // 3. Pure Jamdani Cotton
  {
    id: 'sar-jc-1',
    name: 'Handwoven Dhakai Jamdani Cotton Floral Saree',
    category: 'Pure Jamdani Cotton',
    categorySlug: 'pure-jamdani-cotton',
    fabric: 'Pure Muslin Cotton Jamdani',
    price: 4950,
    originalPrice: 5900,
    discount: '16% OFF',
    rating: 5.0,
    reviewCount: 28,
    image: '/images/sarees/03_pure_jamdani_cotton.jpg',
    description: 'Artisan handwoven Dhakai Jamdani featuring allover floral butidar work on featherlight sheer pure cotton ground.',
    inStock: true,
    isBestseller: true
  },

  // 4. Handloom (All Types)
  {
    id: 'sar-hl-1',
    name: 'Authentic Mangalagiri Handloom Cotton Saree with Nizam Zari',
    category: 'Handloom (All Types)',
    categorySlug: 'handloom-all-types',
    fabric: 'Pure Handloom Cotton',
    price: 3250,
    originalPrice: 3800,
    discount: '14% OFF',
    rating: 4.8,
    reviewCount: 22,
    image: '/images/sarees/04_handloom_all_types.jpg',
    description: 'Handwoven Mangalagiri cotton saree featuring characteristic Nizam zari border and rich solid body.',
    inStock: true,
    isBestseller: true
  },

  // 5. Gadwal Cotton
  {
    id: 'sar-gc-1',
    name: 'Handwoven Gadwal Cotton Saree with Contrast Silk Zari Border',
    category: 'Gadwal Cotton',
    categorySlug: 'gadwal-cotton',
    fabric: 'Gadwal Cotton & Silk Border',
    price: 6850,
    originalPrice: 8200,
    discount: '16% OFF',
    rating: 4.9,
    reviewCount: 15,
    image: '/images/sarees/05_gadwal_cotton.jpg',
    description: 'Distinctive Gadwal saree handwoven with unbleached fine cotton body and attached rich contrast silk zari border and pallu.',
    inStock: true,
    isNew: true
  },

  // 6. Linen Silk
  {
    id: 'sar-ls-1',
    name: 'Pastel Dual-Tone Linen Silk Saree with Zari Border',
    category: 'Linen Silk',
    categorySlug: 'linen-silk',
    fabric: '60 count Linen Silk',
    price: 4650,
    originalPrice: 5500,
    discount: '15% OFF',
    rating: 4.8,
    reviewCount: 20,
    image: '/images/sarees/06_linen_silk.jpg',
    description: 'Modern luxury linen silk saree featuring a dual-tone shimmer, silver zari stripes on pallu, and ultra-fluid drape.',
    inStock: true,
    isBestseller: true
  },

  // 7. Linen Cotton
  {
    id: 'sar-lc-1',
    name: 'Organic Slub Linen Cotton Saree with Tassels',
    category: 'Linen Cotton',
    categorySlug: 'linen-cotton',
    fabric: 'Natural Linen Cotton Slub',
    price: 3450,
    originalPrice: 4100,
    discount: '15% OFF',
    rating: 4.7,
    reviewCount: 14,
    image: '/images/sarees/07_linen_cotton.jpg',
    description: 'Breathable linen cotton saree with artisanal slub texture, minimal woven borders, and handcrafted tassels at the pallu edge.',
    inStock: true
  },

  // 8. Linen Batik
  {
    id: 'sar-lb-1',
    name: 'Handcrafted Wax Batik Printed Pure Linen Saree',
    category: 'Linen Batik',
    categorySlug: 'linen-batik',
    fabric: 'Pure Linen with Batik Art',
    price: 4950,
    originalPrice: 5800,
    discount: '14% OFF',
    rating: 4.9,
    reviewCount: 17,
    image: '/images/sarees/08_linen_batik.jpg',
    description: 'Artisanal wax-resist batik cracked pattern hand-dyed onto pure natural linen fabric for a unique contemporary statement.',
    inStock: true,
    isNew: true
  },

  // 9. Assam Gicha
  {
    id: 'sar-ag-1',
    name: 'Handwoven Assam Gicha Tussar Silk Saree with Tribal Border',
    category: 'Assam Gicha',
    categorySlug: 'assam-gicha',
    fabric: 'Assam Gicha Wild Silk',
    price: 7950,
    originalPrice: 9500,
    discount: '16% OFF',
    rating: 5.0,
    reviewCount: 12,
    image: '/images/sarees/09_assam_gicha.jpg',
    description: 'Rare Assam Gicha silk saree distinguished by its organic rough-spun texture, natural sheen, and red-black traditional temple border.',
    inStock: true,
    isBestseller: true
  },

  // 10. Baluchari Silk
  {
    id: 'sar-bs-1',
    name: 'Royal Heritage Baluchari Silk Saree with Meenakari Pallu',
    category: 'Baluchari Silk',
    categorySlug: 'baluchari-silk',
    fabric: 'Pure Bishnupur Baluchari Silk',
    price: 13950,
    originalPrice: 16500,
    discount: '15% OFF',
    rating: 5.0,
    reviewCount: 38,
    image: '/images/sarees/10_baluchari_silk.jpg',
    description: 'Masterpiece Baluchari silk saree from Bishnupur, featuring mythological chariot and court narrative motifs woven in resham threads.',
    inStock: true,
    isBestseller: true
  },

  // 11. Tassar Silk
  {
    id: 'sar-ts-1',
    name: 'Natural Golden Desi Tassar Silk Saree with Antique Zari',
    category: 'Tassar Silk',
    categorySlug: 'tassar-silk',
    fabric: '100% Pure Wild Tassar Silk',
    price: 8450,
    originalPrice: 9900,
    discount: '14% OFF',
    rating: 4.9,
    reviewCount: 26,
    image: '/images/sarees/11_tassar_silk.jpg',
    description: 'Unprocessed natural gold Tassar silk saree featuring subtle texture, contrast temple border, and festive handloom finish.',
    inStock: true
  },

  // 12. Matka Tassar
  {
    id: 'sar-mt-1',
    name: 'Handspun Matka Tassar Silk Saree with Geometric Weaves',
    category: 'Matka Tassar',
    categorySlug: 'matka-tassar',
    fabric: 'Handspun Matka & Tassar Silk',
    price: 9250,
    originalPrice: 10900,
    discount: '15% OFF',
    rating: 4.8,
    reviewCount: 16,
    image: '/images/sarees/12_matka_tassar.jpg',
    description: 'Luxurious heavy-drape saree combining the soft slub of mulberry Matka silk with the golden sheen of natural Tassar silk.',
    inStock: true,
    isNew: true
  },

  // 13. Katha Tassar
  {
    id: 'sar-kt-1',
    name: 'Hand Embroidered Kantha Stitch Tassar Silk Saree',
    category: 'Katha Tassar',
    categorySlug: 'katha-tassar',
    fabric: 'Pure Tassar Silk & Kantha Embroidery',
    price: 11500,
    originalPrice: 13500,
    discount: '14% OFF',
    rating: 5.0,
    reviewCount: 21,
    image: '/images/sarees/13_katha_tassar.jpg',
    description: 'Exquisite hand-stitched Kantha embroidery across pure natural Tassar silk, crafted over weeks by rural master artisans.',
    inStock: true,
    isBestseller: true
  },

  // 14. Kota Applique
  {
    id: 'sar-ka-1',
    name: 'Handcrafted Kota Doria Saree with Cutwork Applique Border',
    category: 'Kota Applique',
    categorySlug: 'kota-applique',
    fabric: 'Kota Doria with Fabric Applique Work',
    price: 4250,
    originalPrice: 4950,
    discount: '14% OFF',
    rating: 4.7,
    reviewCount: 15,
    image: '/images/sarees/14_kota_applique.jpg',
    description: 'Airy check-weave Kota Doria saree accented with delicate floral cutwork applique handcrafted on the borders and pallu.',
    inStock: true,
    isNew: true
  }
];
