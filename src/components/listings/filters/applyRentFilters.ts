import type { HotelListing } from "@/@types/hotel";
import type { RentFilters } from "./useRentFilters";

export function applyRentFilters(
  items: HotelListing[],
  filters: RentFilters,
): HotelListing[] {
  const results = items.filter(
    (apartment) =>
      (filters.categories.length === 0 ||
        filters.categories.includes(apartment.category)) &&
      (filters.location === null || apartment.location === filters.location) &&
      (filters.bedrooms === "all" ||
        apartment.bedrooms === Number(filters.bedrooms)) &&
      apartment.price >= filters.minPrice &&
      apartment.price <= filters.maxPrice,
  );

  if (filters.sort === "price-low") {
    return results.sort((left, right) => left.price - right.price);
  }
  if (filters.sort === "price-high") {
    return results.sort((left, right) => right.price - left.price);
  }
  return results.sort(
    (left, right) => Number(right.promoted) - Number(left.promoted),
  );
}
