"use client";

import type { ApartmentListing } from "@/types/hotel";
import {
  ApartmentGrid,
  BedroomTabs,
  FilterSidebar,
  HotelHeader,
} from "@/components/listings";
import { APARTMENT_LISTINGS } from "@/lib/mockData/apartmentListings";
import { NearMeButton } from "@/components/listings/NearMeButton";
import RentFiltersPanel from "@/components/listings/RentFiltersPanel";
import { useGeolocation } from "@/hooks/useGeolocation";
import { distanceKm, sortByDistance } from "@/lib/geo";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LayoutDashboard, Lightbulb, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

type SortOption = "relevance" | "price-low" | "price-high" | "nearest";

export default function ApartmentListingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const normalizedQuery = normalizeSearchText(query);
  const geo = useGeolocation();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedBedrooms, setSelectedBedrooms] = useState("all");
  const [sortOption, setSortOption] = useState<SortOption>("relevance");
  const [minPrice, setMinPrice] = useState<number>(3200);
  const [maxPrice, setMaxPrice] = useState<number>(206000);
  const [favorites, setFavorites] = useState<string[]>(
    APARTMENT_LISTINGS.filter((h) => h.favorite).map((h) => h.id),
  );

  const toggleFavorite = (id: string) => {
    setFavorites((curr) =>
      curr.includes(id) ? curr.filter((f) => f !== id) : [...curr, id],
    );
  };

  const isOutsideCostaRica = useMemo(() => {
    if (!geo.position) return false;
    const nearestListingKm = Math.min(
      ...APARTMENT_LISTINGS.map((apartment) =>
        distanceKm(origin, apartment.coordinates),
      ),
    );
    return nearestListingKm > 300;
  }, [geo.position]);

  useEffect(() => {
    if (geo.position) {
      setSortOption(isOutsideCostaRica ? "relevance" : "nearest");
    } else {
      setSortOption((current) =>
        current === "nearest" ? "relevance" : current,
      );
    }
  }, [geo.position, geo.status, isOutsideCostaRica]);

  const distances = useMemo(
    () =>
      geo.position
        ? Object.fromEntries(
            APARTMENT_LISTINGS.map((apartment) => [
              apartment.id,
              distanceKm(geo.position!, apartment.coordinates),
            ]),
          )
        : undefined,
    [geo.position],
  );

  const filteredApartments = useMemo(() => {
    const apartments = APARTMENT_LISTINGS.filter((apartment) => {
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(apartment.category);
      const matchesLocation =
        selectedLocations.length === 0 ||
        selectedLocations.includes(apartment.location);
      const matchesBedroom =
        selectedBedrooms === "all" ||
        (selectedBedrooms === "3"
          ? apartment.bedrooms >= 3
          : apartment.bedrooms === Number(selectedBedrooms));
      const matchesPrice =
        apartment.price >= minPrice && apartment.price <= maxPrice;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        normalizeSearchText(`${apartment.name} ${apartment.address}`).includes(
          normalizedQuery,
        );

      return (
        matchesCategory &&
        matchesLocation &&
        matchesBedroom &&
        matchesPrice &&
        matchesQuery
      );
    });

    if (sortOption === "nearest" && geo.position && !isOutsideCostaRica) {
      return sortByDistance(
        apartments,
        geo.position,
        (apartment) => apartment.coordinates,
      );
    }
    if (sortOption === "price-low") {
      return [...apartments].sort((left, right) => left.price - right.price);
    }
    if (sortOption === "price-high") {
      return [...apartments].sort((left, right) => right.price - left.price);
    }
    return [...apartments].sort(
      (left, right) => Number(right.promoted) - Number(left.promoted),
    );
  }, [
    geo.position,
    isOutsideCostaRica,
    maxPrice,
    minPrice,
    normalizedQuery,
    selectedBedrooms,
    selectedCategories,
    selectedLocations,
    sortOption,
  ]);

  /** Toggle one string-valued filter selection. */
  const toggleValue = (values: string[], value: string) =>
    values.includes(value)
      ? values.filter((item) => item !== value)
      : [...values, value];

  const handleApartmentClick = (apartment: ApartmentListing) => {
    router.push(`/rent/${apartment.id}`);
  };

  const hasLocalPosition = geo.position !== null && !isOutsideCostaRica;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <HotelHeader />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="sticky top-32 z-20 -mx-4 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-2 backdrop-blur sm:top-20 sm:-mx-6 sm:px-6 lg:hidden">
          <Drawer.Root shouldScaleBackground={false}>
            <Drawer.Trigger asChild>
              <button
                type="button"
                className="inline-flex min-h-10 shrink-0 items-center rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-muted"
              >
                <SlidersHorizontal
                  aria-hidden="true"
                  className="mr-2 h-4 w-4"
                />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-orange-500 px-1.5 text-xs text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </Drawer.Trigger>
            <Drawer.Portal>
              <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40" />
              <Drawer.Content
                onOpenAutoFocus={(event) => {
                  event.preventDefault();
                  const content = event.currentTarget as HTMLDivElement | null;
                  content?.querySelector<HTMLElement>("button, input")?.focus();
                }}
                style={{ maxHeight: "85dvh" }}
                className="fixed inset-x-0 bottom-0 z-50 mt-24 flex max-h-screen flex-col rounded-t-2xl border border-border bg-background px-4 pt-3 outline-none sm:px-6"
              >
                <div className="mx-auto mb-3 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/30" />
                <Drawer.Title className="pb-2 text-lg font-semibold text-foreground">
                  Filters
                </Drawer.Title>
                <Drawer.Description className="sr-only">
                  Choose rental filters and review the matching places.
                </Drawer.Description>
                <div className="min-h-0 flex-1 overflow-y-auto pb-4">
                  <RentFiltersPanel {...filterProps} />
                </div>
                <div className="sticky bottom-0 flex shrink-0 gap-2 border-t border-border bg-background py-3">
                  <button
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-md px-2 py-1"
                    aria-label="Sort options"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Sort by:{" "}
                    <span className="font-semibold capitalize">{sortOption}</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => setSortOption("relevance")}
                      className={cn(
                        "text-left px-3 py-2 text-sm rounded-md transition-colors",
                        sortOption === "relevance"
                          ? "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400 font-semibold"
                          : "hover:bg-gray-100 dark:hover:bg-slate-800",
                      )}
                    >
                      Relevance
                    </button>
                    <button
                      onClick={() => setSortOption("nearest")}
                      className={cn(
                        "text-left px-3 py-2 text-sm rounded-md transition-colors",
                        sortOption === "nearest"
                          ? "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400 font-semibold"
                          : "hover:bg-gray-100 dark:hover:bg-slate-800",
                      )}
                    >
                      Nearest
                    </button>
                    <button
                      onClick={() => setSortOption("price-low")}
                      className={cn(
                        "text-left px-3 py-2 text-sm rounded-md transition-colors",
                        sortOption === "price-low"
                          ? "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400 font-semibold"
                          : "hover:bg-gray-100 dark:hover:bg-slate-800",
                      )}
                    >
                      Price: Low to High
                    </button>
                    <button
                      onClick={() => setSortOption("price-high")}
                      className={cn(
                        "text-left px-3 py-2 text-sm rounded-md transition-colors",
                        sortOption === "price-high"
                          ? "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400 font-semibold"
                          : "hover:bg-gray-100 dark:hover:bg-slate-800",
                      )}
                    >
                      Price: High to Low
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="mt-8">
            <BedroomTabs selected={selectedBedrooms} onSelect={setSelectedBedrooms} />
          </div>

          <div className="mt-8">
            <ApartmentGrid
              apartments={filteredApartments}
              distances={distances}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              onApartmentClick={handleApartmentClick}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
