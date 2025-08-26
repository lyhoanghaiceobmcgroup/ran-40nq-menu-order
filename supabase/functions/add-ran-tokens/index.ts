import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { userPhone, amount, reference } = await req.json()
    
    console.log(`Adding ${amount} RAN Tokens to phone: ${userPhone}`)
    
    // Check if wallet exists
    const { data: existingWallet, error: fetchError } = await supabaseClient
      .from('ran_wallets')
      .select('*')
      .eq('user_phone', userPhone)
      .single()
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      throw new Error(`Error fetching wallet: ${fetchError.message}`)
    }
    
    let walletResult
    
    if (existingWallet) {
      // Update existing wallet
      const newBalance = existingWallet.balance_ran + amount
      const newTotalEarned = existingWallet.total_earned_ran + amount
      
      walletResult = await supabaseClient
        .from('ran_wallets')
        .update({
          balance_ran: newBalance,
          total_earned_ran: newTotalEarned,
          updated_at: new Date().toISOString()
        })
        .eq('user_phone', userPhone)
        
      console.log(`Updated wallet. New balance: ${newBalance}`)
    } else {
      // Create new wallet
      walletResult = await supabaseClient
        .from('ran_wallets')
        .insert({
          user_phone: userPhone,
          balance_ran: amount,
          total_earned_ran: amount,
          total_spent_ran: 0
        })
        
      console.log(`Created new wallet with balance: ${amount}`)
    }
    
    if (walletResult.error) {
      throw new Error(`Error updating wallet: ${walletResult.error.message}`)
    }
    
    // Add transaction record
    const { error: transactionError } = await supabaseClient
      .from('ran_wallet_transactions')
      .insert({
        user_phone: userPhone,
        amount: amount,
        kind: 'adjust',
        reference: reference || 'Manual addition'
      })
    
    if (transactionError) {
      throw new Error(`Error adding transaction: ${transactionError.message}`)
    }
    
    // Get final wallet state
    const { data: finalWallet, error: verifyError } = await supabaseClient
      .from('ran_wallets')
      .select('*')
      .eq('user_phone', userPhone)
      .single()
    
    if (verifyError) {
      throw new Error(`Error verifying update: ${verifyError.message}`)
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully added ${amount} RAN Tokens`,
        wallet: finalWallet
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})