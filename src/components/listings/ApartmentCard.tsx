"use client";

import type { HotelListing } from "@/@types/hotel";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AiOutlineHeart } from "react-icons/ai";
import { FaFireAlt } from "react-icons/fa";
import { MessageCircle } from "lucide-react";
import AmenityIcons from "./AmenityIcons";
import { formatListingPrice } from "./formatListingPrice";
import { getConversationIdForApartment } from "@/lib/mockData/messages";

interface ApartmentCardProps {
  apartment: HotelListing;
  distanceKm?: number;
  loading?: "eager" | "lazy";
  onClick?: () => void;
}

/** Render a rental card with booking and host-contact actions. */
export default function ApartmentCard({
  apartment,
  distanceKm,
  loading = "lazy",
  onClick,
}: ApartmentCardProps) {
  const router = useRouter();
  const conversationId = getConversationIdForApartment(apartment.name);

  return (
    <div
      onClick={onClick}
      className="group w-full overflow-hidden rounded-2xl border border-border bg-card text-left transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative">
        <Image
          src={apartment.images[0]}
          alt={apartment.name}
          width={420}
          height={280}
          loading={loading}
          decoding="async"
          className="h-44 w-full object-cover"
        />
        {apartment.promoted ? (
          <span className="absolute bottom-0 left-0 inline-flex items-center gap-1 rounded-tr-lg bg-orange-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white">
            <FaFireAlt className="h-3.5 w-3.5" />
            Promoted
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-end gap-2">
            <span className="text-3xl font-semibold leading-none text-green-600">
              {formatListingPrice(apartment.price)}
            </span>
            <span className="pb-1 text-xs text-muted-foreground">
              Per month
            </span>
          </div>
          <AiOutlineHeart
            className={cn(
              "h-5 w-5",
              apartment.favorite ? "fill-red-500 text-red-500" : "text-red-500",
            )}
          />
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-semibold text-foreground">
            {apartment.name}
          </h3>
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {apartment.address}
          </p>
          {distanceKm !== undefined ? (
            <p className="text-xs font-medium text-gray-500">
              ~{Math.round(distanceKm)} km away
            </p>
          ) : null}
        </div>

        {/* Fixed-height amenities zone keeps Book button aligned across all cards */}
        <div className="mt-3 min-h-14">
          <AmenityIcons
            bedrooms={apartment.bedrooms}
            bathrooms={apartment.bathrooms}
            petFriendly={apartment.petFriendly}
            compact
          />
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="mt-auto w-full rounded-lg bg-orange-500 py-2 px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-orange-600"
        >
          Book
        </button>
        {conversationId && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/dashboard/messages/${conversationId}`);
            }}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg
                       border border-orange-500 py-2 px-4 text-sm font-semibold
                       text-orange-500 transition-colors duration-200
                       hover:bg-orange-50 dark:hover:bg-orange-900/10"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Message host
          </button>
        )}
      </div>
    </div>
  );
}
