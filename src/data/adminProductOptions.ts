/**
 * MRA Bastralaya - Admin Product Form Options
 * Maps departments to their respective categories defined in the application.
 */

export type DepartmentType = 'Sarees' | 'Ladies Suits' | 'Bed Sheets';
export type ProductStatusType = 'Active' | 'Draft' | 'Sold Out';

export interface CategoryOption {
  id: string;
  name: string;
  slug: string;
  defaultFabric?: string;
}

export const DEPARTMENTS: DepartmentType[] = ['Sarees', 'Ladies Suits', 'Bed Sheets'];

export const DEPARTMENT_CATEGORIES: Record<DepartmentType, CategoryOption[]> = {
  Sarees: [
    { id: 'sc-1', name: 'Printed Cotton', slug: 'printed-cotton', defaultFabric: 'Pure Cotton' },
    { id: 'sc-2', name: 'Tant Cotton', slug: 'tant-cotton', defaultFabric: 'Handloom Tant Cotton' },
    { id: 'sc-3', name: 'Pure Jamdani Cotton', slug: 'pure-jamdani-cotton', defaultFabric: 'Pure Jamdani Cotton' },
    { id: 'sc-4', name: 'Handloom (All Types)', slug: 'handloom-all-types', defaultFabric: 'Assorted Handloom Weaves' },
    { id: 'sc-5', name: 'Gadwal Cotton', slug: 'gadwal-cotton', defaultFabric: 'Gadwal Cotton & Silk Border' },
    { id: 'sc-6', name: 'Linen Silk', slug: 'linen-silk', defaultFabric: 'Organic Linen Silk' },
    { id: 'sc-7', name: 'Linen Cotton', slug: 'linen-cotton', defaultFabric: 'Natural Linen Cotton' },
    { id: 'sc-8', name: 'Linen Batik', slug: 'linen-batik', defaultFabric: 'Handcrafted Linen Batik' },
    { id: 'sc-9', name: 'Assam Gicha', slug: 'assam-gicha', defaultFabric: 'Wild Assam Gicha Silk' },
    { id: 'sc-10', name: 'Baluchari Silk', slug: 'baluchari-silk', defaultFabric: 'Pure Baluchari Swarnachari Silk' },
    { id: 'sc-11', name: 'Tassar Silk', slug: 'tassar-silk', defaultFabric: 'Pure Tassar Silk' },
    { id: 'sc-12', name: 'Matka Tassar', slug: 'matka-tassar', defaultFabric: 'Handspun Matka & Tassar Silk' },
    { id: 'sc-13', name: 'Katha Tassar', slug: 'katha-tassar', defaultFabric: 'Tassar Silk with Kantha Stitch' },
    { id: 'sc-14', name: 'Kota Applique', slug: 'kota-applique', defaultFabric: 'Kota Doria with Applique Work' },
  ],
  'Ladies Suits': [
    { id: 'lsc-1', name: 'Cotton Batik', slug: 'cotton-batik', defaultFabric: 'Pure Cotton Batik' },
    { id: 'lsc-2', name: 'Phulkari Cotton — All Types', slug: 'phulkari-cotton-all-types', defaultFabric: 'Pure Cotton & Silk Floss' },
    { id: 'lsc-3', name: 'Printed Cotton', slug: 'printed-cotton', defaultFabric: '100% Breathable Cotton' },
  ],
  'Bed Sheets': [
    { id: 'bsc-1', name: 'Phulkari Handwork Bed Sheet', slug: 'phulkari-handwork-bed-sheet', defaultFabric: '100% Pure Cotton with Silk Floss Embroidery' },
  ],
};

export const SAREE_OCCASIONS = [
  'Bridal & Wedding',
  'Reception & Grand Events',
  'Puja & Festival',
  'Casual Luxury & Daytime',
  'Traditional Weave',
  'Ethnic Formal',
  'Cocktail & Sangeet',
];

export const SUIT_SIZES = ['Free Size (Unstitched)', 'S (36)', 'M (38)', 'L (40)', 'XL (42)', 'Custom / Stitched'];

export const BED_SIZES = ['Single (60 x 90 in)', 'Double (90 x 100 in)', 'Queen (90 x 108 in)', 'King (108 x 108 in)'];
