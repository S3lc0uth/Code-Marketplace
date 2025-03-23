
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { CodeListing } from '@/lib/types';
import { initiateWisePayment, checkPurchaseAccess } from '@/lib/payment';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { LoaderCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

interface PurchaseButtonProps {
  listing: CodeListing;
}

export const PurchaseButton = ({ listing }: PurchaseButtonProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast: uiToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const { data: hasPurchased, isLoading: checkingAccess } = useQuery({
    queryKey: ['purchase-access', listing.id, user?.id],
    queryFn: () => checkPurchaseAccess(listing.id, user?.id || ''),
    enabled: !!user && !!listing.id,
  });

  const handlePurchase = async () => {
    if (!user) {
      uiToast({
        title: "Login required",
        description: "Please login to purchase this item",
      });
      navigate('/auth');
      return;
    }
    
    setIsProcessing(true);
    setProgress(10);
    toast.loading('Processing your payment...', { id: 'payment-processing' });
    
    try {
      // Simulate steps for better UX
      setProgress(30);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProgress(50);
      const result = await initiateWisePayment(listing, user.id);
      
      setProgress(80);
      await new Promise(resolve => setTimeout(resolve, 300));
      setProgress(100);
      
      if (result.success) {
        toast.dismiss('payment-processing');
        toast.success('Purchase successful!', {
          description: 'You now have access to this item.',
          duration: 5000,
          icon: <CheckCircle className="h-4 w-4 text-green-500" />
        });
        // Refresh the purchase access check
        await new Promise(resolve => setTimeout(resolve, 1000));
        window.location.reload();
      } else {
        toast.dismiss('payment-processing');
        toast.error('Payment failed', {
          description: 'There was an issue processing your payment. Please try again.',
          duration: 5000,
          icon: <AlertCircle className="h-4 w-4 text-red-500" />
        });
      }
    } catch (error) {
      toast.dismiss('payment-processing');
      console.error('Payment error:', error);
      toast.error('Payment failed', {
        description: error instanceof Error ? error.message : 'There was an issue processing your payment',
        duration: 5000,
        icon: <AlertCircle className="h-4 w-4 text-red-500" />
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };
  
  if (checkingAccess) {
    return (
      <div className="w-full space-y-2">
        <Skeleton className="h-10 w-full rounded" />
        <div className="text-center text-xs text-muted-foreground">Checking access...</div>
      </div>
    );
  }
  
  if (hasPurchased) {
    return (
      <Button variant="outline" className="w-full bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
        <CheckCircle className="mr-2 h-4 w-4" /> Purchased
      </Button>
    );
  }
  
  if (user?.id === listing.creator_id) {
    return (
      <Button variant="outline" disabled className="w-full">
        Your Listing
      </Button>
    );
  }
  
  return (
    <div className="w-full space-y-2">
      <Button 
        onClick={handlePurchase} 
        disabled={isProcessing}
        className="w-full relative"
      >
        {isProcessing ? (
          <>
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Purchase for $${listing.price.toFixed(2)}`
        )}
      </Button>
      
      {isProcessing && (
        <Progress value={progress} className="h-1 w-full" />
      )}
      
      {isProcessing && (
        <div className="text-center text-xs text-muted-foreground animate-pulse">
          Processing payment with Wise...
        </div>
      )}
    </div>
  );
};
