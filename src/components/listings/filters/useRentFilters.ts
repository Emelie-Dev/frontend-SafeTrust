"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { HOTEL_CATEGORIES, HOTEL_LOCATIONS } from "@/lib/mockData/hotels";

export const PRICE_BOUNDS = { min: 0, max: 250_000 } as const;
export type SortOption = "relevance" | "price-low" | "price-high" | "nearest";
export type Category = (typeof HOTEL_CATEGORIES)[number];
export type Location = (typeof HOTEL_LOCATIONS)[number];
export type BedroomCount = "all" | "1" | "2" | "3";

export type RentFilters = {
  categories: Category[];
  location: Location | null;
  bedrooms: BedroomCount;
  minPrice: number;
  maxPrice: number;
  sort: SortOption;
};

export const DEFAULT_FILTERS: RentFilters = {
  categories: [],
  location: null,
  bedrooms: "all",
  minPrice: PRICE_BOUNDS.min,
  maxPrice: PRICE_BOUNDS.max,
  sort: "relevance",
};

const isCategory = (value: string): value is Category =>
  (HOTEL_CATEGORIES as readonly string[]).includes(value);
const isLocation = (value: string): value is Location =>
  (HOTEL_LOCATIONS as readonly string[]).includes(value);

export function parseFilters(params: URLSearchParams): RentFilters {
  const numberParam = (key: string, fallback: number) => {
    const value = Number(params.get(key));
    return params.has(key) && Number.isFinite(value) ? value : fallback;
  };
  const rawLocation = params.get("location");
  const rawSort = params.get("sort");
  const rawBedrooms = params.get("bedrooms");
  const minPrice = numberParam("min", DEFAULT_FILTERS.minPrice);
  const maxPrice = numberParam("max", DEFAULT_FILTERS.maxPrice);

  if (
    minPrice < PRICE_BOUNDS.min ||
    maxPrice > PRICE_BOUNDS.max ||
    minPrice > maxPrice
  ) {
    return {
      ...DEFAULT_FILTERS,
      categories: (params.get("categories")?.split(",") ?? []).filter(
        isCategory,
      ),
      location: rawLocation && isLocation(rawLocation) ? rawLocation : null,
      bedrooms:
        rawBedrooms === "1" || rawBedrooms === "2" || rawBedrooms === "3"
          ? rawBedrooms
          : "all",
      sort:
        rawSort === "price-low" ||
        rawSort === "price-high" ||
        rawSort === "nearest"
          ? rawSort
          : "relevance",
    };
  }

  return {
    categories: (params.get("categories")?.split(",") ?? []).filter(isCategory),
    location: rawLocation && isLocation(rawLocation) ? rawLocation : null,
    bedrooms:
      rawBedrooms === "1" || rawBedrooms === "2" || rawBedrooms === "3"
        ? rawBedrooms
        : "all",
    minPrice,
    maxPrice,
    sort:
      rawSort === "price-low" ||
      rawSort === "price-high" ||
      rawSort === "nearest"
        ? rawSort
        : "relevance",
  };
}

export function useRentFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const filters = useMemo(
    () => parseFilters(new URLSearchParams(params.toString())),
    [params],
  );

  const setFilters = useCallback(
    (patch: Partial<RentFilters>) => {
      const next = { ...filters, ...patch };
      const query = new URLSearchParams();
      if (next.categories.length) {
        query.set("categories", next.categories.join(","));
      }
      if (next.location) query.set("location", next.location);
      if (next.bedrooms !== "all") query.set("bedrooms", next.bedrooms);
      if (next.minPrice !== DEFAULT_FILTERS.minPrice) {
        query.set("min", String(next.minPrice));
      }
      if (next.maxPrice !== DEFAULT_FILTERS.maxPrice) {
        query.set("max", String(next.maxPrice));
      }
      if (next.sort !== "relevance") query.set("sort", next.sort);

      router.replace(query.size ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [filters, pathname, router],
  );

  const reset = useCallback(
    () => router.replace(pathname, { scroll: false }),
    [pathname, router],
  );

  const activeCount =
    filters.categories.length +
    Number(filters.location !== null) +
    Number(filters.bedrooms !== "all") +
    Number(
      filters.minPrice !== DEFAULT_FILTERS.minPrice ||
        filters.maxPrice !== DEFAULT_FILTERS.maxPrice,
    );

  return { filters, setFilters, reset, activeCount };
}
