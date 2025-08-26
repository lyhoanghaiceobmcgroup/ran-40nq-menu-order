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

    const { txnId, creditAccount, amountVnd, contentRaw, paidAt } = await req.json()

    if (!txnId || !creditAccount || !amountVnd || !contentRaw || !paidAt) {
      return new Response('Missing required fields', { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    console.log('Processing MB webhook:', { txnId, creditAccount, amountVnd, contentRaw });

    // Check if transaction already processed
    const { data: existingTxn } = await supabase
      .from('bank_transactions')
      .select('id')
      .eq('txn_id', txnId)
      .single()

    if (existingTxn) {
      console.log('Transaction already processed:', txnId);
      return new Response('Transaction already processed', { 
        status: 200, 
        headers: corsHeaders 
      });
    }

    // Insert bank transaction record
    const { data: bankTxn, error: txnError } = await supabase
      .from('bank_transactions')
      .insert({
        txn_id: txnId,
        credit_account: creditAccount,
        amount_vnd: amountVnd,
        content_raw: contentRaw,
        paid_at: paidAt
      })
      .select()
      .single()

    if (txnError) {
      console.error('Failed to insert bank transaction:', txnError);
      return new Response('Failed to process transaction', { 
        status: 500, 
        headers: corsHeaders 
      });
    }

    // Extract phone number from content
    const phoneMatch = contentRaw.match(/(?:RAN HV|RANHN)\s*(\d{10,11})/i);
    if (!phoneMatch) {
      console.log('No phone number found in content:', contentRaw);
      return new Response('Phone number not found in content', { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    const userPhone = phoneMatch[1];
    console.log('Extracted phone:', userPhone);

    // Find matching payment intent
    const { data: intent, error: intentError } = await supabase
      .from('payment_intents')
      .select(`
        *,
        voucher_products (*)
      `)
      .eq('user_phone', userPhone)
      .eq('expected_amount_vnd', amountVnd)
      .eq('status', 'pending')
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (intentError || !intent) {
      console.log('No matching payment intent found');
      // Update bank transaction with phone but no match
      await supabase
        .from('bank_transactions')
        .update({ matched_user_phone: userPhone })
        .eq('id', bankTxn.id)
      
      return new Response('No matching payment intent', { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    console.log('Found matching intent:', intent.id);

    // Update payment intent and bank transaction
    await Promise.all([
      supabase
        .from('payment_intents')
        .update({ status: 'paid' })
        .eq('id', intent.id),
      
      supabase
        .from('bank_transactions')
        .update({ 
          matched_user_phone: userPhone,
          matched_intent_id: intent.id,
          processed_at: new Date().toISOString()
        })
        .eq('id', bankTxn.id)
    ]);

    // Get or create RAN wallet
    let { data: wallet } = await supabase
      .from('ran_wallets')
      .select('*')
      .eq('user_phone', userPhone)
      .single()

    if (!wallet) {
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

    // Credit RAN to wallet
    const rewardRan = intent.voucher_products.reward_ran;
    const newBalance = wallet.balance_ran + rewardRan;

    const { error: walletUpdateError } = await supabase
      .from('ran_wallets')
      .update({
        balance_ran: newBalance,
        total_earned_ran: wallet.total_earned_ran + rewardRan
      })
      .eq('user_phone', userPhone)

    if (walletUpdateError) {
      console.error('Failed to update wallet:', walletUpdateError);
      return new Response('Failed to update wallet', { 
        status: 500, 
        headers: corsHeaders 
      });
    }

    // Add ledger entry
    const { error: ledgerError } = await supabase
      .from('ran_ledger')
      .insert({
        user_phone: userPhone,
        transaction_type: 'PURCHASE_CREDIT',
        amount_ran: rewardRan,
        description: `Voucher ${intent.voucher_products.name} – MB ${creditAccount}`,
        reference_id: bankTxn.id,
        reference_type: 'bank_transaction',
        balance_after: newBalance
      })

    if (ledgerError) {
      console.error('Failed to insert ledger entry:', ledgerError);
    }

    console.log('RAN credited successfully:', { userPhone, rewardRan, newBalance });

    return new Response(JSON.stringify({
      success: true,
      message: `Bạn đã đổi thành công và + ${rewardRan.toLocaleString()} RAN vào tài khoản.`,
      data: {
        userPhone,
        rewardRan,
        newBalance,
        voucherName: intent.voucher_products.name
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('MB webhook error:', error);
    return new Response('Internal server error', { 
      status: 500, 
      headers: corsHeaders 
    });
  }
})