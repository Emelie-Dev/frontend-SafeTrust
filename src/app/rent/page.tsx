"use client";

import type { HotelListing } from "@/@types/hotel";
import ActiveFilterChips from "@/components/listings/ActiveFilterChips";
import ApartmentGrid from "@/components/listings/ApartmentGrid";
import HotelHeader from "@/components/listings/HotelHeader";
import { NearMeButton } from "@/components/listings/NearMeButton";
import RentFiltersPanel from "@/components/listings/RentFiltersPanel";
import { useGeolocation } from "@/hooks/useGeolocation";
import { distanceKm, sortByDistance } from "@/lib/geo";
import { STUB_HOTELS } from "@/lib/mockData/hotels";
import { DEFAULT_MAX_PRICE, DEFAULT_MIN_PRICE } from "@/lib/rent-filters";
import { Drawer } from "vaul";
import { LayoutDashboard, Lightbulb, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

type SortOption = "relevance" | "price-low" | "price-high" | "nearest";

/** Normalize rental text for case- and accent-insensitive search. */
function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase();
}

/** Render the rent listing page inside the search-parameter suspense boundary. */
export default function HotelListingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <RentListingContent />
    </Suspense>
  );
}

/** Own search, geolocation, sorting, and responsive listing state. */
function RentListingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const normalizedQuery = normalizeSearchText(query);
  const geo = useGeolocation();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedBedrooms, setSelectedBedrooms] = useState("all");
  const [sortOption, setSortOption] = useState<SortOption>("relevance");
  const [minPrice, setMinPrice] = useState(DEFAULT_MIN_PRICE);
  const [maxPrice, setMaxPrice] = useState(DEFAULT_MAX_PRICE);

  const isOutsideCostaRica = useMemo(() => {
    if (!geo.position) return false;
    const nearestListingKm = Math.min(
      ...STUB_HOTELS.map((hotel) =>
        distanceKm(geo.position!, hotel.coordinates),
      ),
    );
    return nearestListingKm > 300;
  }, [geo.position]);

  useEffect(() => {
    if (geo.position) {
      setSortOption(isOutsideCostaRica ? "relevance" : "nearest");
    } else if (geo.status === "idle") {
      setSortOption("relevance");
    }
  }, [geo.position, geo.status, isOutsideCostaRica]);

  const distances = useMemo(
    () =>
      geo.position
        ? Object.fromEntries(
            STUB_HOTELS.map((hotel) => [
              hotel.id,
              distanceKm(geo.position!, hotel.coordinates),
            ]),
          )
        : undefined,
    [geo.position],
  );

  const filteredApartments = useMemo(() => {
    const apartments = STUB_HOTELS.filter((apartment) => {
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

  /** Restore the unfiltered rent-listing state. */
  const clearAll = () => {
    setSelectedCategories([]);
    setSelectedLocations([]);
    setSelectedBedrooms("all");
    setMinPrice(DEFAULT_MIN_PRICE);
    setMaxPrice(DEFAULT_MAX_PRICE);
    setSortOption("relevance");
  };

  const filterProps = {
    selectedCategories,
    selectedLocations,
    selectedBedrooms,
    minPrice,
    maxPrice,
    onCategoryToggle: (category: string) =>
      setSelectedCategories((current) => toggleValue(current, category)),
    onLocationToggle: (location: string) =>
      setSelectedLocations((current) => toggleValue(current, location)),
    onBedroomChange: setSelectedBedrooms,
    onMinPriceChange: setMinPrice,
    onMaxPriceChange: setMaxPrice,
  };

  const activeFilterCount =
    selectedCategories.length +
    selectedLocations.length +
    Number(selectedBedrooms !== "all") +
    Number(minPrice !== DEFAULT_MIN_PRICE || maxPrice !== DEFAULT_MAX_PRICE);

  /** Navigate to a selected rental's detail page. */
  const handleApartmentClick = (apartment: HotelListing) => {
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
                    type="button"
                    onClick={clearAll}
                    className="min-h-11 rounded-md px-3 text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    Clear all
                  </button>
                  <Drawer.Close asChild>
                    <button
                      type="button"
                      className="min-h-11 flex-1 rounded-md bg-orange-500 px-4 text-sm font-semibold text-white hover:bg-orange-600"
                    >
                      Show {filteredApartments.length} places
                    </button>
                  </Drawer.Close>
                </div>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>

          <label className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
            <span className="sr-only">Sort results</span>
            <select
              aria-label="Sort results"
              value={sortOption}
              onChange={(event) =>
                setSortOption(event.target.value as SortOption)
              }
              className="min-h-10 max-w-44 bg-transparent text-right text-sm text-foreground outline-none"
            >
              <option value="relevance">Recommended</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
              {hasLocalPosition && <option value="nearest">Nearest</option>}
            </select>
          </label>
        </div>

        <ActiveFilterChips
          {...filterProps}
          onRemoveCategory={(category) =>
            setSelectedCategories((current) =>
              current.filter((value) => value !== category),
            )
          }
          onRemoveLocation={(location) =>
            setSelectedLocations((current) =>
              current.filter((value) => value !== location),
            )
          }
          onRemoveBedrooms={() => setSelectedBedrooms("all")}
          onRemovePrice={() => {
            setMinPrice(DEFAULT_MIN_PRICE);
            setMaxPrice(DEFAULT_MAX_PRICE);
          }}
          onClearAll={clearAll}
        />

        <div className="mt-4 flex gap-8 lg:mt-6">
          <aside className="sticky top-24 hidden h-fit w-64 shrink-0 lg:block">
            <RentFiltersPanel {...filterProps} />
          </aside>

          <main className="min-w-0 flex-1 py-3 sm:py-5">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <h1 className="text-2xl leading-tight text-foreground sm:text-3xl">
                  {hasLocalPosition ? (
                    "Destinations near you"
                  ) : (
                    <>
                      Available for rent in{" "}
                      <span className="font-semibold">
                        Costa Rica, San José
                      </span>
                    </>
                  )}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  {filteredApartments.length} places available
                </p>
                {isOutsideCostaRica && (
                  <p
                    className="mt-2 text-sm text-muted-foreground"
                    role="status"
                  >
                    You seem to be outside Costa Rica, so we&apos;re showing
                    popular destinations.
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <div className="hidden sm:block">
                  <NearMeButton geo={geo} />
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className="hidden items-center gap-1.5 text-sm font-medium text-orange-600 hover:text-orange-700 md:flex"
                >
                  <LayoutDashboard aria-hidden="true" className="h-4 w-4" />
                  Switch to Host view
                </button>
                <Link
                  href="/guest/suggestions"
                  className="hidden items-center gap-1.5 text-sm font-medium text-orange-600 hover:text-orange-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 md:flex"
                >
                  <Lightbulb aria-hidden="true" className="h-4 w-4" />
                  Suggestions view
                </Link>
                <label className="hidden items-center gap-2 text-sm text-muted-foreground lg:flex">
                  <span>Sort</span>
                  <select
                    aria-label="Sort results"
                    value={sortOption}
                    onChange={(event) =>
                      setSortOption(event.target.value as SortOption)
                    }
                    className="min-h-10 rounded-md border border-border bg-background px-3 text-foreground"
                  >
                    <option value="relevance">Recommended</option>
                    <option value="price-low">Price: low to high</option>
                    <option value="price-high">Price: high to low</option>
                    {hasLocalPosition && (
                      <option value="nearest">Nearest</option>
                    )}
                  </select>
                </label>
              </div>
            </div>

            {query && (
              <p className="mb-4 text-sm text-muted-foreground">
                Results for{" "}
                <span className="font-medium text-foreground">{query}</span>
              </p>
            )}
            {filteredApartments.length > 0 ? (
              <ApartmentGrid
                apartments={filteredApartments}
                distances={distances}
                onApartmentClick={handleApartmentClick}
              />
            ) : (
              <p className="rounded-md border border-border px-4 py-8 text-center text-sm text-muted-foreground">
                No rentals match your search. Try a different place or clear
                your filters.
              </p>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
