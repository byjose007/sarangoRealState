/** Domain model for the Vestra template. Everything is fully typed and the
 *  mock data layer is generated against these contracts, so swapping the mock
 *  service for a real API only means re-implementing `services/*`. */

export type ListingStatus = 'for-sale' | 'for-rent' | 'sold' | 'new-development';

export type PropertyType =
  | 'house'
  | 'apartment'
  | 'land'
  | 'estate'
  | 'studio'
  | 'penthouse'
  | 'townhouse'
  | 'commercial'
  | 'office'
  | 'villa'
  | 'loft';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface City {
  id: string;
  slug: string;
  name: string;
  state: string;
  country: string;
  image: string;
  coordinates: Coordinates;
  blurb: string;
  blurbEn: string;
  status?: 'active' | 'upcoming';
}

export interface Amenity {
  id: string;
  label: string;
  /** Lucide icon name resolved by `components/property/amenity-icon.tsx`. */
  icon: string;
  group: 'indoor' | 'outdoor' | 'building' | 'utility';
}

export interface FloorPlan {
  id: string;
  name: string;
  level: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  /** Points of the plan outline, drawn as inline SVG (no external assets). */
  outline: string;
  rooms: { name: string; x: number; y: number }[];
}

export interface PropertyDocument {
  id: string;
  name: string;
  type: 'pdf' | 'dwg' | 'zip';
  size: string;
  href: string;
}

export interface Agent {
  id: string;
  slug: string;
  name: string;
  role: string;
  license?: string;
  avatar: string;
  phone: string;
  email: string;
  address?: string;
  citySlug: string;
  bio: string;
  languages: string[];
  specialties: string[];
  experienceYears: number;
  dealsClosed: number;
  rating: number;
  social: { tiktok?: string; instagram?: string; facebook?: string };
}

export interface Property {
  id: string;
  /** Human readable parcel reference — used as the plan-sheet signature. */
  reference: string;
  slug: string;
  title: string;
  description: string;
  status: ListingStatus;
  type: PropertyType;
  price: number;
  /** Rentals are priced per month; sales are absolute. */
  pricePeriod: 'month' | 'total';
  address: string;
  citySlug: string;
  coordinates: Coordinates;
  bedrooms: number;
  bathrooms: number;
  garages: number;
  area: number;
  landArea: number;
  yearBuilt: number;
  energyRating: 'A' | 'B' | 'C' | 'D';
  featured: boolean;
  images: string[];
  amenityIds: string[];
  floorPlans: FloorPlan[];
  documents: PropertyDocument[];
  videoUrl?: string;
  tourUrl?: string;
  agentId: string;
  createdAt: string;
  views: number;
  hoaFee?: number;
  propertyTax: number;
  nearby: { label: string; distance: number }[];
  deposit?: number;
  leaseTerm?: string;
  utilitiesIncluded?: boolean;
  petsAllowed?: boolean;
  floorLevel?: string;
  commercialUse?: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  /** Markdown-ish body rendered by a tiny in-house renderer (no MDX runtime). */
  content: string;
  cover: string;
  category: ArticleCategory;
  tags: string[];
  authorId: string;
  publishedAt: string;
  readingMinutes: number;
}

export type ArticleCategory = 'market' | 'buying' | 'investment' | 'design' | 'living';

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  avatar: string;
  quote: string;
  rating: number;
  dealType: string;
}

export type SortKey =
  'newest' | 'price-asc' | 'price-desc' | 'area-desc' | 'bedrooms-desc' | 'popular';

export type ViewMode = 'grid' | 'list' | 'map';

export interface PropertyFilters {
  q?: string;
  status?: ListingStatus | 'all';
  types?: PropertyType[];
  citySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  minArea?: number;
  maxArea?: number;
  amenities?: string[];
  garages?: number;
  featuredOnly?: boolean;
  sort?: SortKey;
  page?: number;
  perPage?: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface MortgageInput {
  price: number;
  downPayment: number;
  years: number;
  rate: number;
  propertyTax: number;
  insurance: number;
  hoa: number;
}

export interface MortgageResult {
  monthlyTotal: number;
  principalAndInterest: number;
  monthlyTax: number;
  monthlyInsurance: number;
  monthlyHoa: number;
  totalInterest: number;
  loanAmount: number;
  schedule: { year: number; balance: number; interest: number; principal: number }[];
}
