"use client";

import type { HotelListing } from "@/@types/hotel";
import Image from "next/image";
import { FaMapMarkerAlt } from "react-icons/fa";
import AmenityIcons from "./AmenityIcons";
import { formatListingPrice } from "./formatListingPrice";
import ImageGallery from "./ImageGallery";

interface ApartmentDetailProps {
  apartment: HotelListing;
  onBook: () => void;
}

/** Render rental details, amenities, owner information, and booking action. */
export default function ApartmentDetail({
  apartment,
  onBook,
}: ApartmentDetailProps) {
  return (
    <section className="flex-1 px-6 py-8 lg:px-10">
      <ImageGallery
        images={apartment.images}
        promoted={apartment.promoted}
        altText={apartment.name}
      />

      <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
            {apartment.name}
          </h1>

          <div className="mt-5 flex items-center gap-3 text-sm text-muted-foreground">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-orange-100 text-orange-600">
              <FaMapMarkerAlt className="h-4 w-4" />
            </span>
            <span>{apartment.address}</span>
          </div>

          <div className="mt-8">
            <AmenityIcons
              bedrooms={apartment.bedrooms}
              bathrooms={apartment.bathrooms}
              petFriendly={apartment.petFriendly}
            />
          </div>
        </div>

        <div className="w-full rounded-xl lg:max-w-52">
          <button
            type="button"
            onClick={onBook}
            className="w-full rounded-md bg-orange-500 px-6 py-4 text-xl font-semibold text-white transition hover:bg-orange-600"
          >
            BOOK
          </button>
          <div className="mt-4 flex items-end gap-2">
            <span className="text-3xl font-semibold leading-none text-green-600 sm:text-4xl">
              {formatListingPrice(apartment.price)}
            </span>
            <span className="pb-1 text-sm text-muted-foreground">
              Per month
            </span>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3">
            <span className="text-sm font-medium text-foreground">
              {apartment.owner.name}
            </span>
            <Image
              src={apartment.owner.avatar}
              alt={apartment.owner.name}
              width={34}
              height={34}
              className="h-9 w-9 rounded-full object-cover"
            />
          </div>
        </div>
      </div>

      <div className="mt-10 max-w-3xl">
        <h2 className="text-xl font-semibold text-foreground">
          Apartment details
        </h2>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          {apartment.description}
        </p>
      </div>
    </section>
  );
}
