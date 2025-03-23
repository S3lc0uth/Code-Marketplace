
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Profile, CodeListing } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CodeListingCard } from "@/components/marketplace/CodeListingCard";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const ProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [listings, setListings] = useState<CodeListing[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const isOwnProfile = user && id === user.id;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);
        
        // Fetch user's published listings
        const { data: listingsData, error: listingsError } = await supabase
          .from("code_listings")
          .select("*")
          .eq("creator_id", id)
          .eq("status", "published")
          .order("created_at", { ascending: false });

        if (listingsError) throw listingsError;
        setListings(listingsData);
      } catch (error: any) {
        toast({
          title: "Error loading profile",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProfile();
  }, [id, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Profile Not Found</h2>
          <p className="mb-4">The user profile you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/marketplace">Back to Marketplace</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.avatar_url || undefined} alt={profile.username} />
              <AvatarFallback className="text-2xl">
                {profile.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold mb-1">
                {profile.full_name || profile.username}
              </h1>
              <p className="text-gray-500 mb-4">@{profile.username}</p>
              
              {profile.bio && (
                <p className="text-gray-700 mb-4">{profile.bio}</p>
              )}
              
              {isOwnProfile && (
                <Button asChild variant="outline" className="mt-2">
                  <Link to="/profile/edit">Edit Profile</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <h2 className="text-xl font-bold mb-6">Published Listings</h2>
        
        {listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <CodeListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <p className="text-gray-500">No published listings yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
