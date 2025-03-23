
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CodeListing } from './types';

export const initiateWisePayment = async (
  listing: CodeListing,
  buyerId: string
): Promise<{ success: boolean; purchaseId?: string }> => {
  try {
    // Step 1: Create a quote
    const quoteResponse = await supabase.functions.invoke('wise-payment', {
      body: {
        action: 'create-quote',
        sourceAmount: listing.price,
        targetCurrency: 'USD', // Assuming USD for simplicity
        sourceCurrency: 'USD'
      }
    });

    if (quoteResponse.error) {
      throw new Error(`Quote creation failed: ${quoteResponse.error.message}`);
    }

    const { quote } = quoteResponse.data;
    
    // In a real implementation, you would show UI to collect payment details
    // For simplicity, we're assuming a direct payment without user input
    
    // Step 2: Create a payment
    const paymentResponse = await supabase.functions.invoke('wise-payment', {
      body: {
        action: 'create-payment',
        quoteId: quote.id,
        listingId: listing.id,
        buyerId,
        amount: listing.price,
        targetAccount: listing.creator_id // Simplified - would use actual account details
      }
    });

    if (paymentResponse.error) {
      throw new Error(`Payment creation failed: ${paymentResponse.error.message}`);
    }

    const { payment, purchase } = paymentResponse.data;
    
    // Step 3: Check payment status
    // In a real app, you'd implement a webhook or polling mechanism
    const statusResponse = await supabase.functions.invoke('wise-payment', {
      body: {
        action: 'get-payment-status',
        paymentId: payment.id
      }
    });

    if (statusResponse.error) {
      throw new Error(`Status check failed: ${statusResponse.error.message}`);
    }

    // This is simplified - in a real app, you'd handle different payment statuses
    toast.success('Payment successful! You now have access to this code.', { duration: 5000 });
    
    return { success: true, purchaseId: purchase.id };
  } catch (error) {
    console.error('Payment error:', error);
    toast.error(error instanceof Error ? error.message : 'Payment failed. Please try again.');
    return { success: false };
  }
};

export const checkPurchaseAccess = async (
  listingId: string,
  userId: string
): Promise<boolean> => {
  if (!userId) return false;
  
  const { data, error } = await supabase
    .from('purchases')
    .select('id')
    .eq('listing_id', listingId)
    .eq('buyer_id', userId)
    .maybeSingle();
  
  if (error) {
    console.error('Error checking purchase access:', error);
    return false;
  }
  
  return !!data;
};
