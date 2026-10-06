import { notFound } from "next/navigation";
import { APARTMENT_LISTINGS } from "@/lib/mockData/apartmentListings";
import HotelDetailClient from "./HotelDetailClient";

import { use, useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/layouts/Header";
import { SideBar } from "@/components/layouts/SideBar";
import Gallery from "@/components/hotels/details/Gallery";
import Information from "@/components/hotels/details/Information";
import Details from "@/components/hotels/details/Details";
import { getApartmentById } from "@/lib/mockData/apartmentListings";

/**
 * Leaflet / react-leaflet is only loaded when the map section enters the
 * viewport (IntersectionObserver).  This keeps it out of the initial bundle
 * for /hotels/[id] and avoids the SSR window-is-not-defined error.
 */
const HotelMap = dynamic(() => import("@/components/hotels/payment/Map"), {
  ssr: false,
  loading: () => (
    <div
      className="flex h-full min-h-[250px] w-full items-center justify-center rounded-lg bg-gray-200 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300 animate-pulse"
      role="status"
    >
      Loading map...
    </div>
  ),
});

export default function HotelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const hotel = APARTMENT_LISTINGS.find((apartment) => apartment.id === id);
  if (!hotel) notFound();

  return <HotelDetailClient hotel={hotel} />;
}
