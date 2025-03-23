
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CodeListing } from "@/lib/types";
import { CodeListingCard } from "@/components/marketplace/CodeListingCard";
import { ListingFilters } from "@/components/marketplace/ListingFilters";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Download, Loader2 } from "lucide-react";

const Marketplace = () => {
  const [listings, setListings] = useState<CodeListing[]>([]);
  const [filteredListings, setFilteredListings] = useState<CodeListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching marketplace listings...');
        const { data, error } = await supabase
          .from("code_listings")
          .select("*")
          .eq("status", "published")
          .order("created_at", { ascending: false });

        if (error) throw error;
        
        console.log("Fetched listings:", data?.length || 0);
        setListings(data || []);
        setFilteredListings(data || []);
      } catch (error: any) {
        console.error("Error fetching listings:", error);
        setError(error.message || "Failed to load marketplace listings");
        toast({
          title: "Error fetching listings",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [toast]);

  const handleFilterChange = ({
    search,
    category,
    priceRange,
    sortBy,
  }: {
    search: string;
    category: string | null;
    priceRange: [number | null, number | null];
    sortBy: string;
  }) => {
    let filtered = [...listings];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (listing) =>
          listing.title.toLowerCase().includes(searchLower) ||
          (listing.description && listing.description.toLowerCase().includes(searchLower))
      );
    }

    if (category) {
      filtered = filtered.filter((listing) => listing.category === category);
    }

    const [minPrice, maxPrice] = priceRange;
    if (minPrice !== null) {
      filtered = filtered.filter((listing) => listing.price >= minPrice);
    }
    if (maxPrice !== null) {
      filtered = filtered.filter((listing) => listing.price <= maxPrice);
    }

    // Apply sorting
    switch(sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
    }

    setFilteredListings(filtered);
  };

  const exportToCsv = () => {
    // Define CSV headers
    const headers = ["Title", "Description", "Category", "Price", "Created Date"];
    
    // Convert listings data to CSV rows
    const data = filteredListings.map(listing => [
      // Wrap fields with quotes and escape any quotes within fields
      `"${listing.title.replace(/"/g, '""')}"`,
      `"${listing.description ? listing.description.replace(/"/g, '""') : ''}"`,
      `"${listing.category}"`,
      `${listing.price}`,
      `"${new Date(listing.created_at).toLocaleDateString()}"`,
    ]);
    
    // Combine headers and data
    const csvContent = [
      headers.join(","),
      ...data.map(row => row.join(","))
    ].join("\n");
    
    // Create a Blob and generate download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    // Create temporary link element to trigger download
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `marketplace-listings-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    
    // Trigger download and cleanup
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Successful",
      description: `${filteredListings.length} listings exported to CSV`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Code Marketplace</h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {!loading && filteredListings.length > 0 && (
              <Button variant="outline" onClick={exportToCsv}>
                <Download className="mr-2 h-4 w-4" /> Export CSV
              </Button>
            )}
            {user && (
              <Button asChild>
                <Link to="/listings/new">Create Listing</Link>
              </Button>
            )}
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <ListingFilters onFilterChange={handleFilterChange} />
          </div>
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading marketplace listings...</p>
              </div>
            ) : filteredListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.map((listing) => (
                  <CodeListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  No listings found matching your criteria
                </h3>
                <p className="text-muted-foreground mb-4">Try adjusting your filters or check back later</p>
                {listings.length === 0 && (
                  <Alert className="max-w-md mx-auto">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No listings in the marketplace</AlertTitle>
                    <AlertDescription>
                      There are currently no listings in the marketplace. Please check back later or create your own listing.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
