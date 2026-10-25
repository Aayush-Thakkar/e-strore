export type ProductType = "Saree" | "Suit" | "Lehenga" | "Indo-Western";

export interface Saree {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  type: ProductType;
  imageUrl: string; // Image 1 (Primary)
  secondaryImageUrl?: string; // Image 2 (Secondary)
  description: string;
  fabric: string;
  length?: string; // e.g. "5.5 meters saree + 0.8 meter blouse piece"
  blouseIncluded?: boolean;
  color: string;
  featured?: boolean;
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
  description: string;
  fabric: string;
  length?: string;
  blouseIncluded: boolean;
  color: string;
  featured: boolean;
}
