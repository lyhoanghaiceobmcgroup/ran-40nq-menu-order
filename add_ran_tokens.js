// Script to add 500,000 RAN Tokens to account "Hai" (phone: 0826999923)
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://mrbupzghoxuzntenmazv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5cGlscWxscmRqZmhjZHpxbWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0NjU1NzIsImV4cCI6MjA2ODA0MTU3Mn0.nNwN4dyd_PbnhBy1MFe6muM0z8ST_img2EzuOuniHas";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function addRanTokens() {
  try {
    const userPhone = '0826999923';
    const tokensToAdd = 500000;
    
    console.log(`Adding ${tokensToAdd} RAN Tokens to phone: ${userPhone}`);
    
    // First, check if wallet exists
    const { data: existingWallet, error: fetchError } = await supabase
      .from('ran_wallets')
      .select('*')
      .eq('user_phone', userPhone)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching wallet:', fetchError);
      return;
    }
    
    let walletResult;
    
    if (existingWallet) {
      // Update existing wallet
      const newBalance = existingWallet.balance_ran + tokensToAdd;
      const newTotalEarned = existingWallet.total_earned_ran + tokensToAdd;
      
      walletResult = await supabase
        .from('ran_wallets')
        .update({
          balance_ran: newBalance,
          total_earned_ran: newTotalEarned,
          updated_at: new Date().toISOString()
        })
        .eq('user_phone', userPhone);
        
      console.log(`Updated wallet. New balance: ${newBalance}`);
    } else {
      // Create new wallet
      walletResult = await supabase
        .from('ran_wallets')
        .insert({
          user_phone: userPhone,
          balance_ran: tokensToAdd,
          total_earned_ran: tokensToAdd,
          total_spent_ran: 0
        });
        
      console.log(`Created new wallet with balance: ${tokensToAdd}`);
    }
    
    if (walletResult.error) {
      console.error('Error updating wallet:', walletResult.error);
      return;
    }
    
    // Add transaction record
    const { error: transactionError } = await supabase
      .from('ran_wallet_transactions')
      .insert({
        user_phone: userPhone,
        amount: tokensToAdd,
        kind: 'adjust',
        reference: 'Manual addition for user Hai'
      });
    
    if (transactionError) {
      console.error('Error adding transaction:', transactionError);
      return;
    }
    
    console.log('Transaction record added successfully');
    
    // Verify the update
    const { data: finalWallet, error: verifyError } = await supabase
      .from('ran_wallets')
      .select('*')
      .eq('user_phone', userPhone)
      .single();
    
    if (verifyError) {
      console.error('Error verifying update:', verifyError);
      return;
    }
    
    console.log('Final wallet state:', finalWallet);
    console.log('✅ Successfully added 500,000 RAN Tokens to account "Hai"');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

addRanTokens();