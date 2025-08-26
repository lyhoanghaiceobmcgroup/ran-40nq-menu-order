import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

const AddRanTokens = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const addTokensToHai = async () => {
    setLoading(true);
    try {
      const userPhone = '0826999923';
      const tokensToAdd = 500000;
      
      console.log(`Adding ${tokensToAdd} RAN Tokens to phone: ${userPhone}`);
      
      // Check if wallet exists
      const { data: existingWallet, error: fetchError } = await supabase
        .from('ran_wallets')
        .select('*')
        .eq('user_phone', userPhone)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw new Error(`Error fetching wallet: ${fetchError.message}`);
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
        throw new Error(`Error updating wallet: ${walletResult.error.message}`);
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
        throw new Error(`Error adding transaction: ${transactionError.message}`);
      }
      
      // Verify the update
      const { data: finalWallet, error: verifyError } = await supabase
        .from('ran_wallets')
        .select('*')
        .eq('user_phone', userPhone)
        .single();
      
      if (verifyError) {
        throw new Error(`Error verifying update: ${verifyError.message}`);
      }
      
      setResult(finalWallet);
      toast({
        title: "Thành công!",
        description: `Đã thêm ${tokensToAdd.toLocaleString()} RAN Token cho tài khoản Hai`,
      });
      
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Thêm RAN Token</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          <p><strong>Tài khoản:</strong> Hai</p>
          <p><strong>Số điện thoại:</strong> 0826999923</p>
          <p><strong>Số token thêm:</strong> 500,000 RAN</p>
        </div>
        
        <Button 
          onClick={addTokensToHai} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Đang xử lý...' : 'Thêm 500,000 RAN Token'}
        </Button>
        
        {result && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-800">✅ Thành công!</h4>
            <div className="text-sm text-green-700 mt-2">
              <p><strong>Số dư hiện tại:</strong> {result.balance_ran?.toLocaleString()} RAN</p>
              <p><strong>Tổng đã kiếm:</strong> {result.total_earned_ran?.toLocaleString()} RAN</p>
              <p><strong>Cập nhật lúc:</strong> {new Date(result.updated_at).toLocaleString()}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AddRanTokens;