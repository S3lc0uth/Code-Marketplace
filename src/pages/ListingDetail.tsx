
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { CodeListing, Profile } from "@/lib/types";
import { PurchaseButton } from "@/components/marketplace/PurchaseButton";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User } from "lucide-react";

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: listing, isLoading: listingLoading } = useQuery({
    queryKey: ["listing", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("code_listings")
        .select("*")
        .eq("id", id)
        .single();
        
      if (error) throw error;
      return data as CodeListing;
    },
  });
  
  const { data: creator, isLoading: creatorLoading } = useQuery({
    queryKey: ["profile", listing?.creator_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", listing?.creator_id)
        .single();
        
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!listing?.creator_id,
  });

  if (listingLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-5xl mx-auto mt-8 bg-white rounded-lg shadow-sm p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-2/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-40 bg-gray-200 rounded mb-6"></div>
            <div className="h-20 bg-gray-200 rounded mb-4"></div>
            <div className="h-12 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Listing Not Found</h2>
          <p className="text-gray-500 mb-4">The listing you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/marketplace")}>Back to Marketplace</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-4 pt-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/marketplace")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 w-4 h-4" /> Back to Marketplace
        </Button>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {listing.preview_url && (
            <div className="w-full h-[300px] bg-gray-100">
              <img 
                src={listing.preview_url} 
                alt={`Preview of ${listing.title}`}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-8">
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{listing.category}</Badge>
                  {listing.featured && (
                    <Badge className="bg-amber-500">Featured</Badge>
                  )}
                </div>
                <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold mb-4">${listing.price.toFixed(2)}</div>
                <PurchaseButton listing={listing} />
              </div>
            </div>
            
            <div className="my-8">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line">{listing.description}</p>
              </div>
            </div>
            
            {listing.demo_url && (
              <div className="my-8">
                <h2 className="text-xl font-semibold mb-4">Live Demo</h2>
                <Button asChild variant="outline">
                  <a href={listing.demo_url} target="_blank" rel="noopener noreferrer">
                    View Live Demo
                  </a>
                </Button>
              </div>
            )}
            
            <div className="border-t pt-6 mt-8">
              <h2 className="text-xl font-semibold mb-4">About the Creator</h2>
              {creatorLoading ? (
                <div className="animate-pulse flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              ) : creator ? (
                <div className="flex items-center">
                  <Avatar className="w-12 h-12 mr-4">
                    <AvatarImage src={creator.avatar_url || ''} />
                    <AvatarFallback>
                      <User className="w-6 h-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{creator.full_name || creator.username}</div>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-blue-600"
                      onClick={() => navigate(`/profile/${creator.id}`)}
                    >
                      View Profile
                    </Button>
                  </div>
                </div>
              ) : (
                <p>Creator information not available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;
