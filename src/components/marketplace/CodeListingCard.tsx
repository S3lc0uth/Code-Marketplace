
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CodeListing } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Calendar, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface CodeListingCardProps {
  listing: CodeListing;
}

export const CodeListingCard = ({ listing }: CodeListingCardProps) => {
  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg line-clamp-2">{listing.title}</CardTitle>
          <div className="flex flex-col gap-1 items-end">
            <Badge variant="outline" className="capitalize">{listing.category}</Badge>
            {listing.featured && (
              <Badge className="bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700">
                <Star className="w-3 h-3 mr-1" /> Featured
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">{listing.description}</p>
        {listing.preview_url && (
          <div className="mt-4 aspect-video bg-muted rounded-md overflow-hidden group relative">
            <img 
              src={listing.preview_url} 
              alt={`Preview of ${listing.title}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {listing.demo_url && (
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <a 
                  href={listing.demo_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white dark:bg-gray-800 py-1 px-3 rounded-full text-sm font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  View Demo
                </a>
              </div>
            )}
          </div>
        )}
        <div className="mt-4 flex items-center text-xs text-muted-foreground">
          <Calendar className="w-3 h-3 mr-1" />
          <span>{formatDistanceToNow(new Date(listing.created_at), { addSuffix: true })}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-2 border-t">
        <span className="font-bold">${listing.price.toFixed(2)}</span>
        <Link 
          to={`/listings/${listing.id}`}
          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          View Details →
        </Link>
      </CardFooter>
    </Card>
  );
};
