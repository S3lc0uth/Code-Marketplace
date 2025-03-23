
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { CodeListing } from "@/lib/types";
import { CodeListingCard } from "@/components/marketplace/CodeListingCard";
import { ThemeToggle } from "@/components/theme-toggle";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [featuredListings, setFeaturedListings] = useState<CodeListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedListings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from("code_listings")
          .select("*")
          .eq("status", "published")
          .eq("featured", true)
          .limit(3);

        if (error) throw error;
        
        console.log("Featured listings:", data);
        setFeaturedListings(data || []);
      } catch (error: any) {
        console.error("Error fetching featured listings:", error);
        setError(error.message || "Failed to load featured listings");
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedListings();
  }, []);

  const goToMarketplace = () => {
    navigate("/marketplace");
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-foreground">Code Marketplace</h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button asChild variant="ghost">
                <Link to="/marketplace">Browse</Link>
              </Button>
              {user ? (
                <>
                  <Button asChild variant="ghost">
                    <Link to={`/profile/${user.id}`}>Profile</Link>
                  </Button>
                  <Button
                    onClick={async () => {
                      await supabase.auth.signOut();
                    }}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-indigo-700 dark:to-purple-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
            <h2 className="text-5xl font-bold mb-6">Welcome to Code Marketplace</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Discover and share high-quality code snippets, components, and full applications.
              Buy and sell with the developer community.
            </p>
            <div className="flex justify-center space-x-4">
              <Button onClick={goToMarketplace} size="lg" className="bg-white text-blue-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-blue-300 dark:hover:bg-gray-700">
                Browse Marketplace
              </Button>
              {!user && (
                <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  <Link to="/auth">Get Started</Link>
                </Button>
              )}
            </div>
            
            <div className="mt-8 max-w-md mx-auto">
              <Alert className="bg-white/90 text-blue-800 border-blue-300">
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>Demo Account</AlertTitle>
                <AlertDescription className="mt-2 font-mono text-sm">
                  Email: demo@example.com<br />
                  Password: password123
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>

        {/* Featured Listings */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-foreground">Featured Listings</h2>
            <Button asChild variant="outline">
              <Link to="/marketplace">View All</Link>
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Error loading marketplace data</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-card rounded-lg shadow-sm h-64 animate-pulse" />
              ))}
            </div>
          ) : featuredListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredListings.map((listing) => (
                <CodeListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No featured listings yet
              </h3>
              <p className="text-muted-foreground mb-4">Click below to browse all listings</p>
              <Button onClick={goToMarketplace}>
                Browse All Listings
              </Button>
            </div>
          )}
        </div>

        {/* Categories Section */}
        <div className="bg-muted py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-8 text-center text-foreground">Browse by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {['Frontend', 'Backend', 'Full-Stack', 'Component', 'Utility', 'Template'].map((category) => (
                <Link 
                  key={category} 
                  to={`/marketplace?category=${category.toLowerCase()}`}
                  className="bg-card p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center"
                >
                  <h3 className="font-medium text-foreground">{category}</h3>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
