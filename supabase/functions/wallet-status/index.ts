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

    if (req.method !== 'GET') {
      return new Response('Method not allowed', { 
        status: 405, 
        headers: corsHeaders 
      });
    }

    const url = new URL(req.url);
    const userPhone = url.searchParams.get('phone');

    if (!userPhone) {
      return new Response('Phone parameter required', { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    console.log('Getting wallet status for:', userPhone);

    // Get wallet info
    let { data: wallet } = await supabase
      .from('ran_wallets')
      .select('*')
      .eq('user_phone', userPhone)
      .single()

    if (!wallet) {
      // Create wallet if doesn't exist
      const { data: newWallet, error: walletError } = await supabase
        .from('ran_wallets')
        .insert({
          user_phone: userPhone,
          balance_ran: 0,
          total_earned_ran: 0,
          total_spent_ran: 0
        })
        .select()
        .single()

      if (walletError) {
        console.error('Failed to create wallet:', walletError);
        return new Response('Failed to create wallet', { 
          status: 500, 
          headers: corsHeaders 
        });
      }
      wallet = newWallet;
    }

    // Get recent transactions
    const { data: transactions, error: txnError } = await supabase
      .from('ran_ledger')
      .select('*')
      .eq('user_phone', userPhone)
      .order('created_at', { ascending: false })
      .limit(10)

    if (txnError) {
      console.error('Failed to get transactions:', txnError);
    }

    // Get pending payment intents
    const { data: pendingIntents, error: pendingError } = await supabase
      .from('payment_intents')
      .select(`
        *,
        voucher_products (name, reward_ran)
      `)
      .eq('user_phone', userPhone)
      .eq('status', 'pending')
      .gte('expires_at', new Date().toISOString())

    if (pendingError) {
      console.error('Failed to get pending intents:', pendingError);
    }

    return new Response(JSON.stringify({
      success: true,
      wallet: {
        balance_ran: wallet.balance_ran,
        total_earned_ran: wallet.total_earned_ran,
        total_spent_ran: wallet.total_spent_ran
      },
      transactions: transactions || [],
      pendingIntents: pendingIntents || []
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Wallet status error:', error);
    return new Response('Internal server error', { 
      status: 500, 
      headers: corsHeaders 
    });
  }
})