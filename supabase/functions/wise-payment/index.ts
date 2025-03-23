import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createSupabaseClient } from "./_shared/supabase-client.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const WISE_API_KEY = Deno.env.get('WISE_API_KEY');
  if (!WISE_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'Wise API key not configured' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }

  try {
    const { action, ...data } = await req.json();
    const baseUrl = 'https://api.transferwise.com';
    const supabaseClient = createSupabaseClient();

    // Different endpoints based on the action requested
    switch (action) {
      case 'create-quote': {
        const { sourceAmount, targetCurrency, sourceCurrency } = data;
        
        const response = await fetch(`${baseUrl}/v3/quotes`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${WISE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sourceAmount,
            sourceCurrency: sourceCurrency || 'USD',
            targetCurrency,
            profile: 'personal', // Adjust based on your Wise account
            preferredPayIn: 'BALANCE',
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to create quote: ${response.statusText}`);
        }

        const quote = await response.json();
        return new Response(
          JSON.stringify({ quote }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'create-payment': {
        const { quoteId, listingId, buyerId } = data;
        
        // First, record the payment intent in our database
        const { data: paymentRecord, error: dbError } = await supabaseClient
          .from('purchases')
          .insert({
            listing_id: listingId,
            buyer_id: buyerId,
            amount: data.amount,
            wise_payment_id: null // Will update once payment is completed
          })
          .select()
          .single();

        if (dbError) {
          throw new Error(`Failed to record payment: ${dbError.message}`);
        }

        // Create a payment in Wise
        const response = await fetch(`${baseUrl}/v1/transfers`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${WISE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            targetAccount: data.targetAccount,
            quoteUuid: quoteId,
            customerTransactionId: paymentRecord.id,
            details: {
              reference: `Purchase for code listing ${listingId}`,
              sourceOfFunds: 'other'
            }
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to create transfer: ${response.statusText}`);
        }

        const payment = await response.json();
        
        // Update our payment record with the Wise payment ID
        await supabaseClient
          .from('purchases')
          .update({ wise_payment_id: payment.id })
          .eq('id', paymentRecord.id);

        return new Response(
          JSON.stringify({ payment, purchase: paymentRecord }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get-payment-status': {
        const { paymentId } = data;
        
        const response = await fetch(`${baseUrl}/v1/transfers/${paymentId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${WISE_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to get payment status: ${response.statusText}`);
        }

        const payment = await response.json();
        return new Response(
          JSON.stringify({ payment }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
