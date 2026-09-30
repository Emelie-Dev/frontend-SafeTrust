"use client";

import { HOTEL_CATEGORIES, HOTEL_LOCATIONS } from "@/lib/mockData/hotels";
import { formatListingPrice } from "./formatListingPrice";

interface FilterSidebarProps {
  selectedCategories: string[];
  selectedLocations: string[];
  minPrice: number;
  maxPrice: number;
  onCategoryToggle: (category: string) => void;
  onLocationToggle: (location: string) => void;
  onMinPriceChange: (value: number) => void;
  onMaxPriceChange: (value: number) => void;
  className?: string;
}

function CheckboxRow({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 dark:border-slate-600"
      />
      {label}
    </label>
  );
}

export default function FilterSidebar({
  selectedCategories,
  selectedLocations,
  minPrice,
  maxPrice,
  onCategoryToggle,
  onLocationToggle,
  onMinPriceChange,
  onMaxPriceChange,
  className,
}: FilterSidebarProps) {
  return (
    <aside
      className={
        className ??
        "w-full border-b border-border px-6 py-8 lg:border-b-0 lg:border-r"
      }
    >
      <section className="pb-8">
        <h2 className="mb-5 text-sm font-semibold text-foreground">Category</h2>
        <div className="space-y-3">
          {HOTEL_CATEGORIES.map((category) => (
            <CheckboxRow
              key={category}
              checked={selectedCategories.includes(category)}
              label={category}
              onChange={() => onCategoryToggle(category)}
            />
          ))}
        </div>
      </section>

      <div className="my-0 h-px bg-border" />

      <section className="py-8">
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          Price Range
        </h2>
        <p className="mb-5 text-sm text-gray-700 dark:text-gray-300">
          {formatListingPrice(minPrice)} - {formatListingPrice(maxPrice)}
        </p>

        <div className="space-y-3">
          <label
            className="block text-xs text-muted-foreground"
            htmlFor="minimum-price-range"
          >
            Minimum price
          </label>
          <input
            type="range"
            id="minimum-price-range"
            aria-label="Minimum price"
            min={3200}
            max={maxPrice}
            step={100}
            value={minPrice}
            onChange={(event) =>
              onMinPriceChange(Math.min(Number(event.target.value), maxPrice))
            }
            className="min-h-10 w-full touch-pan-y accent-orange-500"
          />
          <label
            className="block text-xs text-muted-foreground"
            htmlFor="maximum-price-range"
          >
            Maximum price
          </label>
          <input
            type="range"
            id="maximum-price-range"
            aria-label="Maximum price"
            min={3200}
            max={206000}
            step={100}
            value={maxPrice}
            onChange={(event) =>
              onMaxPriceChange(Math.max(Number(event.target.value), minPrice))
            }
            className="min-h-10 w-full touch-pan-y accent-orange-500"
          />
        </div>
      </section>

      <div className="my-0 h-px bg-border" />

      <section className="pt-8">
        <h2 className="mb-5 text-sm font-semibold text-foreground">Location</h2>
        <div className="space-y-3">
          {HOTEL_LOCATIONS.map((location) => (
            <CheckboxRow
              key={location}
              checked={selectedLocations.includes(location)}
              label={location}
              onChange={() => onLocationToggle(location)}
            />
          ))}
        </div>
      </section>
    </aside>
  );
}
