
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ListingFiltersProps {
  onFilterChange: (filters: {
    search: string;
    category: string | null;
    priceRange: [number | null, number | null];
    sortBy: string;
  }) => void;
}

export const ListingFilters = ({ onFilterChange }: ListingFiltersProps) => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("newest");

  const handleFilter = () => {
    onFilterChange({
      search,
      category,
      priceRange: [
        minPrice ? parseFloat(minPrice) : null,
        maxPrice ? parseFloat(maxPrice) : null,
      ],
      sortBy,
    });
  };

  const handleReset = () => {
    setSearch("");
    setCategory(null);
    setMinPrice("");
    setMaxPrice("");
    setSortBy("newest");
    onFilterChange({
      search: "",
      category: null,
      priceRange: [null, null],
      sortBy: "newest",
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
      <h3 className="font-medium mb-4">Filter Listings</h3>
      <div className="space-y-4">
        <div>
          <Label htmlFor="search" className="mb-1 block">Search</Label>
          <Input
            id="search"
            type="text"
            placeholder="Search by title or description"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="sort" className="mb-1 block">Sort By</Label>
          <Select value={sortBy} onValueChange={(value) => {
            setSortBy(value);
            // Apply filter immediately when sort changes
            onFilterChange({
              search,
              category,
              priceRange: [
                minPrice ? parseFloat(minPrice) : null,
                maxPrice ? parseFloat(maxPrice) : null,
              ],
              sortBy: value,
            });
          }}>
            <SelectTrigger id="sort">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="category" className="mb-1 block">Category</Label>
          <Select value={category || ""} onValueChange={setCategory}>
            <SelectTrigger id="category">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="frontend">Frontend</SelectItem>
              <SelectItem value="backend">Backend</SelectItem>
              <SelectItem value="full-stack">Full Stack</SelectItem>
              <SelectItem value="component">Component</SelectItem>
              <SelectItem value="utility">Utility</SelectItem>
              <SelectItem value="template">Template</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="min-price" className="mb-1 block">Min Price</Label>
            <Input
              id="min-price"
              type="number"
              placeholder="Min"
              min="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="max-price" className="mb-1 block">Max Price</Label>
            <Input
              id="max-price"
              type="number"
              placeholder="Max"
              min="0"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleFilter} className="flex-1">Apply Filters</Button>
          <Button onClick={handleReset} variant="outline" className="flex-1">Reset</Button>
        </div>
      </div>
    </div>
  );
};
