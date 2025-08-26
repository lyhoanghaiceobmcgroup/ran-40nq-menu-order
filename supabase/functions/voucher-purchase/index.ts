import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405, 
        headers: corsHeaders 
      });
    }

    const { voucherId, userPhone } = await req.json()

    if (!voucherId || !userPhone) {
      return new Response('Missing required fields', { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    console.log('Processing voucher purchase:', { voucherId, userPhone });

    // Get voucher product details
    const { data: voucher, error: voucherError } = await supabase
      .from('voucher_products')
      .select('*')
      .eq('id', voucherId)
      .eq('status', 'active')
      .single()

    if (voucherError || !voucher) {
      console.error('Voucher not found:', voucherError);
      return new Response('Voucher not found', { 
        status: 404, 
        headers: corsHeaders 
      });
    }

    // Create payment intent
    const paymentContent = `RAN HV ${userPhone}`;
    
    const { data: intent, error: intentError } = await supabase
      .from('payment_intents')
      .insert({
        user_phone: userPhone,
        voucher_product_id: voucherId,
        expected_amount_vnd: voucher.sell_price_vnd,
        payment_content: paymentContent
      })
      .select()
      .single()

    if (intentError) {
      console.error('Failed to create payment intent:', intentError);
      return new Response('Failed to create payment intent', { 
        status: 500, 
        headers: corsHeaders 
      });
    }

    console.log('Payment intent created:', intent.id);

    return new Response(JSON.stringify({
      success: true,
      paymentIntent: {
        id: intent.id,
        amount: voucher.sell_price_vnd,
        paymentContent: paymentContent,
        expiresAt: intent.expires_at,
        accountNumber: '9090190899999',
        bankName: 'MB Bank'
      },
      voucher: {
        name: voucher.name,
        description: voucher.description,
        rewardRan: voucher.reward_ran
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Voucher purchase error:', error);
    return new Response('Internal server error', { 
      status: 500, 
      headers: corsHeaders 
    });
  }
})