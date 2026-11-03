export type ProductType = "Saree" | "Suit" | "Lehenga" | "Indo-Western";

export const AVAILABLE_SIZES = [
  "M",
  "L",
  "XL",
  "2XL",
  "3XL",
  "4XL",
  "5XL",
  "Free Size",
] as const;

export type ProductSize = (typeof AVAILABLE_SIZES)[number];

export interface Saree {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  type: ProductType;
  imageUrl: string; // Image 1 (Primary - Mandatory)
  secondaryImageUrl?: string; // Image 2 (Secondary - Backward compatibility)
  secondaryImages?: string[]; // Up to 7 additional images (total 8 photos)
  description: string;
  fabric: string;
  length?: string; // e.g. "5.5 meters saree + 0.8 meter blouse piece"
  blouseIncluded?: boolean;
  color: string;
  featured?: boolean;
  sizes?: string[]; // Clickable size tags: M, L, XL, 2XL, 3XL, 4XL, 5XL, Free Size
  createdAt: string;
  updatedAt?: string;
}

export interface Inquiry {
  id: string;
  sareeId: string;
  sareeName: string;
  sareePrice: number;
  quantity: number;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  customerCity?: string;
  customerState?: string;
  selectedSize?: string;
  preferredBudget?: string;
  notes?: string;
  status: "new" | "contacted" | "completed" | "cancelled";
  createdAt: string;
}

export interface SareeFormData {
  name: string;
  price: number | "";
  originalPrice?: number | "";
  type: ProductType;
  imageUrl: string;
  secondaryImageUrl: string;
  secondaryImages: string[];
  description: string;
  fabric: string;
  length?: string;
  blouseIncluded: boolean;
  color: string;
  featured: boolean;
  sizes: string[];
}
