import type { GeoPoint } from "@/@types/destination";

export interface HotelAmenitySummary {
  bedrooms: number;
  bathrooms: number;
  petFriendly: boolean;
}

export interface HotelOwner {
  name: string;
  avatar: string;
  /** Host payout wallet (Stellar public key). Escrow bookings need it. */
  walletAddress?: string;
}

export interface HotelListing extends HotelAmenitySummary {
  id: string;
  name: string;
  address: string;
  coordinates: GeoPoint;
  price: number;
  promoted: boolean;
  images: string[];
  category: "Family" | "Students" | "Travelers";
  location:
    | "San José"
    | "Heredia"
    | "Alajuela"
    | "Cartago"
    | "Puntarenas"
    | "Guanacaste"
    | "Limón";
  owner: HotelOwner;
  description: string;
  favorite?: boolean;
}
