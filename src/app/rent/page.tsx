"use client";

import type { HotelListing } from "@/@types/hotel";
import {
  ApartmentGrid,
  BedroomTabs,
  FilterSidebar,
  HotelHeader,
} from "@/components/listings";
import { NearMeButton } from "@/components/listings/NearMeButton";
import { useGeolocation } from "@/hooks/useGeolocation";
import { distanceKm, sortByDistance } from "@/lib/geo";
import { STUB_HOTELS } from "@/lib/mockData/hotels";
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
import { Suspense, useMemo, useState } from "react";

type SortOption = "relevance" | "price-low" | "price-high" | "nearest";

const DEFAULT_MIN_PRICE = 3200;
const DEFAULT_MAX_PRICE = 206000;

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase();
}

export default function HotelListingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <RentListingContent />
    </Suspense>
  );
}

function RentListingContent() {
  const router = useRouter();
  const geo = useGeolocation();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedBedrooms, setSelectedBedrooms] = useState("all");
  const [sortOption, setSortOption] = useState<SortOption>("relevance");
  const [minPrice, setMinPrice] = useState(DEFAULT_MIN_PRICE);
  const [maxPrice, setMaxPrice] = useState(DEFAULT_MAX_PRICE);

  const isOutsideCostaRica = useMemo(() => {
    if (!geo.position) return false;
    const origin = geo.position;
    const nearestListingKm = Math.min(
      ...STUB_HOTELS.map((hotel) => distanceKm(origin, hotel.coordinates)),
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
    const normalizedQuery = normalizeSearchText(query);
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
        matchesCategory && matchesLocation && matchesBedroom && matchesPrice
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
    selectedBedrooms,
    selectedCategories,
    selectedLocations,
    sortOption,
  ]);

  const toggleValue = (values: string[], value: string) =>
    values.includes(value)
      ? values.filter((item) => item !== value)
      : [...values, value];

  const handleApartmentClick = (apartment: HotelListing) => {
    router.push(`/rent/${apartment.id}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <HotelHeader />

      <div className="mx-auto flex max-w-[1180px] flex-col lg:flex-row">
        <FilterSidebar
          selectedCategories={selectedCategories}
          selectedLocations={selectedLocations}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onCategoryToggle={(category) =>
            setSelectedCategories((current) => toggleValue(current, category))
          }
          onLocationToggle={(location) =>
            setSelectedLocations((current) => toggleValue(current, location))
          }
          onMinPriceChange={setMinPrice}
          onMaxPriceChange={setMaxPrice}
        />

        <main className="flex-1 px-6 py-8 lg:px-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-[24px] leading-tight text-gray-900 dark:text-white sm:text-[30px]">
                {geo.position && !isOutsideCostaRica ? (
                  "Destinations near you"
                ) : (
                  <>
                    Available for rent in{" "}
                    <span className="font-semibold">Costa Rica, San José</span>
                  </>
                )}
              </h1>
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                204 units available
              </p>
              {isOutsideCostaRica ? (
                <p
                  className="mt-2 text-sm text-gray-600 dark:text-gray-300"
                  role="status"
                >
                  You seem to be outside Costa Rica, so we&apos;re showing
                  popular destinations.
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <NearMeButton geo={geo} />

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

              <Link
                href="/guest/suggestions"
                className="flex items-center gap-1.5 text-sm font-medium text-orange-500 transition-colors hover:text-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                <Lightbulb aria-hidden="true" className="h-4 w-4" />
                Suggestions view
              </Link>

              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="flex items-center gap-2 text-sm
                                     border border-gray-200 dark:border-slate-700
                                     rounded-lg px-3 py-2 hover:bg-gray-50
                                     dark:hover:bg-slate-800 transition-colors
                                     text-gray-700 dark:text-gray-300"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    <span>Sort & Filter</span>
                    <span className="text-orange-500 font-medium">
                      {sortOption !== "relevance" ||
                      minPrice !== 3200 ||
                      maxPrice !== 206000 ||
                      selectedBedrooms !== "all" ||
                      selectedCategories.length !== 2 ||
                      !selectedCategories.includes("Family") ||
                      !selectedCategories.includes("Students")
                        ? "•"
                        : ""}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  className="w-72 p-4 space-y-4 max-h-[85vh] overflow-y-auto
                             bg-white dark:bg-slate-800
                             border border-gray-200 dark:border-slate-700"
                >
                  {/* Sort by */}
                  <div className="space-y-2">
                    <p
                      className="text-xs font-semibold uppercase tracking-wide
                                  text-gray-500 dark:text-gray-400"
                    >
                      Sort by
                    </p>
                    {[
                      { label: "Relevance", value: "relevance" },
                      { label: "Price: Low to High", value: "price-low" },
                      { label: "Price: High to Low", value: "price-high" },
                      ...(geo.position && !isOutsideCostaRica
                        ? [{ label: "Nearest", value: "nearest" }]
                        : []),
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setSortOption(opt.value as SortOption)}
                        className={cn(
                          "w-full text-left text-sm px-3 py-2 rounded-lg transition-colors",
                          sortOption === opt.value
                            ? "bg-orange-500 text-white"
                            : "hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300",
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  <hr className="border-gray-100 dark:border-slate-700" />

                  {/* Category */}
                  <div className="space-y-2">
                    <p
                      className="text-xs font-semibold uppercase tracking-wide
                                  text-gray-500 dark:text-gray-400"
                    >
                      Category
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedCategories([])}
                        className={cn(
                          "text-xs px-3 py-1.5 rounded-full transition-colors border",
                          selectedCategories.length === 0
                            ? "bg-orange-500 border-orange-500 text-white"
                            : "border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300",
                        )}
                      >
                        All
                      </button>
                      {["Family", "Students", "Travelers"].map((cat) => (
                        <button
                          key={cat}
                          onClick={() =>
                            setSelectedCategories((prev) =>
                              toggleValue(prev, cat),
                            )
                          }
                          className={cn(
                            "text-xs px-3 py-1.5 rounded-full transition-colors border",
                            selectedCategories.includes(cat)
                              ? "bg-orange-500 border-orange-500 text-white"
                              : "border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300",
                          )}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <hr className="border-gray-100 dark:border-slate-700" />

                  {/* Bedrooms */}
                  <div className="space-y-2">
                    <p
                      className="text-xs font-semibold uppercase tracking-wide
                                  text-gray-500 dark:text-gray-400"
                    >
                      Bedrooms
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: "All", value: "all" },
                        { label: "1 bedroom", value: "1" },
                        { label: "2 bedrooms", value: "2" },
                        { label: "3 bedrooms", value: "3" },
                      ].map((bd) => (
                        <button
                          key={bd.value}
                          onClick={() => setSelectedBedrooms(bd.value)}
                          className={cn(
                            "text-xs px-3 py-1.5 rounded-full transition-colors border",
                            selectedBedrooms === bd.value
                              ? "bg-orange-500 border-orange-500 text-white"
                              : "border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300",
                          )}
                        >
                          {bd.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <hr className="border-gray-100 dark:border-slate-700" />

                  {/* Price range */}
                  <div className="space-y-2">
                    <p
                      className="text-xs font-semibold uppercase tracking-wide
                                  text-gray-500 dark:text-gray-400"
                    >
                      Price Range
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => setMinPrice(Number(e.target.value))}
                        className="w-full rounded-lg border border-gray-200
                                   dark:border-slate-600 bg-white dark:bg-slate-900
                                   px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300"
                      />
                      <span className="text-gray-400">—</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        className="w-full rounded-lg border border-gray-200
                                   dark:border-slate-600 bg-white dark:bg-slate-900
                                   px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300"
                      />
                    </div>
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
                  Available for rent in{" "}
                  <span className="font-semibold">Costa Rica, San José</span>
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  {filteredApartments.length} places available
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
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
                  </select>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <BedroomTabs
              selected={selectedBedrooms}
              onSelect={setSelectedBedrooms}
            />
          </div>

          <div className="mt-8">
            <ApartmentGrid
              apartments={filteredApartments}
              distances={distances}
              onApartmentClick={handleApartmentClick}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
