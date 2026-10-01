"use client";

import type { HotelListing } from "@/@types/hotel";
import ApartmentCard from "./ApartmentCard";

interface ApartmentGridProps {
  apartments: HotelListing[];
  onApartmentClick: (apartment: HotelListing) => void;
}

/** Render rental cards in a responsive listing grid. */
export default function ApartmentGrid({
  apartments,
  onApartmentClick,
}: ApartmentGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
      {apartments.map((apartment, index) => (
        <ApartmentCard
          key={apartment.id}
          apartment={apartment}
          loading={index === 0 ? "eager" : "lazy"}
          onClick={() => onApartmentClick(apartment)}
        />
      ))}
    </div>
  );
}
