const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase client with service role key
const supabaseUrl = 'https://mrbupzghoxuzntenmazv.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5cGlscWxscmRqZmhjZHpxbWRyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ2NTU3MiwiZXhwIjoyMDY4MDQxNTcyfQ.SERVICE_ROLE_KEY_PLACEHOLDER';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Telegram Bot Token - replace with your actual bot token
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN || '8168944752:AAErA0I9XFXiNdfuA3xsz0RQc8Foa0oKib4';

console.log('Supabase URL:', supabaseUrl);
console.log('Service key configured:', supabaseServiceKey ? 'Yes' : 'No');
console.log('Telegram bot token configured:', telegramBotToken ? 'Yes' : 'No');

// Telegram webhook endpoint
app.post('/telegram-webhook', async (req, res) => {
  try {
    const update = req.body;
    console.log('Received Telegram update:', JSON.stringify(update, null, 2));
    
    // Handle callback query (button press)
    if (update.callback_query) {
      const callbackQuery = update.callback_query;
      const data = callbackQuery.data;
      
      console.log('Callback data:', data);
      
      if (data && data.startsWith('pay:')) {
         // Parse the callback data: pay:shortPaymentId:userPhone:ranAmount
         const parts = data.split(':');
         if (parts.length === 4) {
           const [, shortPaymentId, userPhone, ranAmount] = parts;
          
          console.log('Processing payment confirmation:', {
             shortPaymentId,
             userPhone,
             ranAmount: parseInt(ranAmount)
           });
           
           // Check if transaction already exists to prevent double processing
           // Use shortPaymentId to find transactions that start with this prefix
           const { data: existingTransactions } = await supabase
             .from('ran_wallet_transactions')
             .select('*')
             .like('reference_id', `${shortPaymentId}%`)
             .eq('transaction_type', 'voucher_purchase');
           
           if (existingTransactions && existingTransactions.length > 0) {
             console.log('Transaction already processed:', shortPaymentId);
             await fetch(`https://api.telegram.org/bot${telegramBotToken}/answerCallbackQuery`, {
               method: 'POST',
               headers: {
                 'Content-Type': 'application/json',
               },
               body: JSON.stringify({
                 callback_query_id: callbackQuery.id,
                 text: 'Giao dịch này đã được xử lý trước đó!'
               })
             });
             res.status(200).json({ ok: true });
             return;
           }
          
          // Update or create user's RAN wallet
          const { data: existingWallet, error: walletError } = await supabase
            .from('ran_wallets')
            .select('*')
            .eq('phone_number', userPhone)
            .single();
          
          if (walletError && walletError.code !== 'PGRST116') {
            console.error('Error fetching wallet:', walletError);
            throw walletError;
          }
          
          let walletData;
          if (existingWallet) {
            // Update existing wallet
            const newBalance = existingWallet.balance + parseInt(ranAmount);
            const newTotalEarned = existingWallet.total_earned + parseInt(ranAmount);
            
            const { data: updatedWallet, error: updateError } = await supabase
              .from('ran_wallets')
              .update({
                balance: newBalance,
                total_earned: newTotalEarned,
                updated_at: new Date().toISOString()
              })
              .eq('phone_number', userPhone)
              .select()
              .single();
            
            if (updateError) {
              console.error('Error updating wallet:', updateError);
              throw updateError;
            }
            
            walletData = updatedWallet;
          } else {
            // Create new wallet
            const { data: newWallet, error: createError } = await supabase
              .from('ran_wallets')
              .insert({
                phone_number: userPhone,
                balance: parseInt(ranAmount),
                total_earned: parseInt(ranAmount),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .select()
              .single();
            
            if (createError) {
              console.error('Error creating wallet:', createError);
              throw createError;
            }
            
            walletData = newWallet;
          }
          
          // Record the transaction
           const { error: transactionError } = await supabase
             .from('ran_wallet_transactions')
             .insert({
               wallet_id: walletData.id,
               transaction_type: 'voucher_purchase',
               amount: parseInt(ranAmount),
               reference_id: shortPaymentId,
               description: `Voucher purchase payment confirmation - ${ranAmount} RAN`,
               created_at: new Date().toISOString()
             });
           
           if (transactionError) {
             console.error('Error recording transaction:', transactionError);
             throw transactionError;
           }
           
           // Send confirmation message back to Telegram
           const confirmationMessage = `✅ Thanh toán đã được xác nhận!\n\n` +
             `📱 Số điện thoại: ${userPhone}\n` +
             `💰 Số RAN đã cộng: ${parseInt(ranAmount).toLocaleString()}\n` +
             `💳 Số dư hiện tại: ${walletData.balance.toLocaleString()} RAN\n` +
             `🆔 Mã giao dịch: ${shortPaymentId}`;
          
          await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
             method: 'POST',
             headers: {
               'Content-Type': 'application/json',
             },
             body: JSON.stringify({
               chat_id: callbackQuery.message.chat.id,
               text: confirmationMessage,
               parse_mode: 'HTML'
             })
           });
           
           // Answer the callback query
           await fetch(`https://api.telegram.org/bot${telegramBotToken}/answerCallbackQuery`, {
             method: 'POST',
             headers: {
               'Content-Type': 'application/json',
             },
             body: JSON.stringify({
               callback_query_id: callbackQuery.id,
               text: 'Thanh toán đã được xác nhận thành công!'
             })
           });
          
          console.log('Payment confirmation processed successfully');
        }
        
        // Handle bill confirmation callbacks
        if (data.startsWith('confirm_bill:')) {
          const parts = data.split(':');
          const orderId = parts[1];
          const userPhone = parts[2];
          
          console.log('Processing bill confirmation:', { orderId, userPhone });
          
          // Store bill confirmation in database
          const { error: insertError } = await supabase
            .from('bill_confirmations')
            .insert({
              order_id: orderId,
              user_phone: userPhone,
              confirmed: true,
              confirmed_at: new Date().toISOString(),
              confirmed_by: callbackQuery.from.username || callbackQuery.from.first_name
            });
          
          if (insertError) {
            console.error('Error storing bill confirmation:', insertError);
          }
          
          // Send confirmation message
          await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              chat_id: callbackQuery.message.chat.id,
              text: `✅ *Bill đã được xác nhận*\n\n🆔 Mã đơn: ${orderId}\n📱 SĐT: ${userPhone}\n👤 Xác nhận bởi: ${callbackQuery.from.username || callbackQuery.from.first_name}\n⏰ Thời gian: ${new Date().toLocaleString('vi-VN')}\n\n💡 Vui lòng nhập số RAN Token để cộng cho khách hàng.`,
              parse_mode: 'Markdown',
              reply_markup: JSON.stringify({
                inline_keyboard: [[
                  {
                    text: "💰 Nhập RAN Token",
                    callback_data: `input_token:${orderId}:${userPhone}`
                  }
                ]]
              })
            })
          });
          
          // Answer callback query
          await fetch(`https://api.telegram.org/bot${telegramBotToken}/answerCallbackQuery`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              callback_query_id: callbackQuery.id,
              text: 'Bill đã được xác nhận!'
            })
          });
        }
        
        // Handle RAN Token input callbacks
        if (data.startsWith('input_token:')) {
          const parts = data.split(':');
          const orderId = parts[1];
          const userPhone = parts[2];
          
          console.log('Processing token input request:', { orderId, userPhone });
          
          // Send message asking for RAN Token amount
          await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              chat_id: callbackQuery.message.chat.id,
              text: `💰 *Nhập số RAN Token*\n\n🆔 Mã đơn: ${orderId}\n📱 SĐT: ${userPhone}\n\n📝 Vui lòng reply tin nhắn này với format:\n\`/addtoken ${orderId} ${userPhone} [SỐ_TOKEN]\`\n\nVí dụ: \`/addtoken ${orderId} ${userPhone} 50000\``,
              parse_mode: 'Markdown'
            })
          });
          
          // Answer callback query
          await fetch(`https://api.telegram.org/bot${telegramBotToken}/answerCallbackQuery`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              callback_query_id: callbackQuery.id,
              text: 'Vui lòng nhập số RAN Token theo hướng dẫn!'
            })
          });
        }
      }
    }
    
    // Handle text messages for /addtoken command
    if (update.message && update.message.text && update.message.text.startsWith('/addtoken')) {
      const parts = update.message.text.split(' ');
      if (parts.length === 4) {
        const orderId = parts[1];
        const userPhone = parts[2];
        const ranAmount = parseInt(parts[3]);
        
        if (isNaN(ranAmount) || ranAmount <= 0) {
          await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              chat_id: update.message.chat.id,
              text: '❌ Số RAN Token không hợp lệ. Vui lòng nhập số dương.'
            })
          });
          res.status(200).json({ ok: true });
          return;
        }
        
        console.log('Processing RAN Token addition:', { orderId, userPhone, ranAmount });
        
        try {
          // Update or create user's RAN wallet
          const { data: existingWallet, error: walletError } = await supabase
            .from('ran_wallets')
            .select('*')
            .eq('phone_number', userPhone)
            .single();
          
          if (walletError && walletError.code !== 'PGRST116') {
            console.error('Error fetching wallet:', walletError);
            throw walletError;
          }
          
          let walletData;
          if (existingWallet) {
            // Update existing wallet
            const newBalance = existingWallet.balance + ranAmount;
            const newTotalEarned = existingWallet.total_earned + ranAmount;
            
            const { data: updatedWallet, error: updateError } = await supabase
              .from('ran_wallets')
              .update({
                balance: newBalance,
                total_earned: newTotalEarned,
                updated_at: new Date().toISOString()
              })
              .eq('phone_number', userPhone)
              .select()
              .single();
            
            if (updateError) {
              console.error('Error updating wallet:', updateError);
              throw updateError;
            }
            
            walletData = updatedWallet;
          } else {
            // Create new wallet
            const { data: newWallet, error: createError } = await supabase
              .from('ran_wallets')
              .insert({
                phone_number: userPhone,
                balance: ranAmount,
                total_earned: ranAmount,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .select()
              .single();
            
            if (createError) {
              console.error('Error creating wallet:', createError);
              throw createError;
            }
            
            walletData = newWallet;
          }
          
          // Record transaction
          const { error: transactionError } = await supabase
            .from('ran_wallet_transactions')
            .insert({
              phone_number: userPhone,
              transaction_type: 'bill_reward',
              amount: ranAmount,
              reference_id: orderId,
              description: `Bill reward for order ${orderId}`,
              created_at: new Date().toISOString()
            });
          
          if (transactionError) {
            console.error('Error recording transaction:', transactionError);
          }
          
          // Update bill confirmation with RAN tokens
          const { error: updateBillError } = await supabase
            .from('bill_confirmations')
            .update({
              ran_tokens: ranAmount,
              processed_at: new Date().toISOString()
            })
            .eq('order_id', orderId)
            .eq('user_phone', userPhone);
          
          if (updateBillError) {
            console.error('Error updating bill confirmation:', updateBillError);
          }
          
          // Send success message to Telegram
          await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              chat_id: update.message.chat.id,
              text: `✅ *Đã cộng RAN Token thành công!*\n\n🆔 Mã đơn: ${orderId}\n📱 SĐT: ${userPhone}\n💰 Số RAN đã cộng: ${ranAmount.toLocaleString()}\n💳 Số dư hiện tại: ${walletData.balance.toLocaleString()} RAN\n⏰ Thời gian: ${new Date().toLocaleString('vi-VN')}\n\n🎉 Khách hàng sẽ nhận được thông báo trên website!`,
              parse_mode: 'Markdown'
            })
          });
          
          console.log('RAN Token addition processed successfully');
        } catch (error) {
          console.error('Error processing RAN Token addition:', error);
          
          await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              chat_id: update.message.chat.id,
              text: '❌ Có lỗi xảy ra khi cộng RAN Token. Vui lòng thử lại.'
            })
          });
        }
      } else {
        await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: update.message.chat.id,
            text: '❌ Format không đúng. Vui lòng sử dụng: /addtoken [ORDER_ID] [PHONE] [AMOUNT]'
          })
        });
      }
    }
    
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Check payment status endpoint
app.get('/payment-status/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const shortPaymentId = paymentId.substring(0, 8);
    
    // Check if payment has been confirmed in database using shortPaymentId
    const { data: transactions } = await supabase
      .from('ran_wallet_transactions')
      .select('*')
      .like('reference_id', `${shortPaymentId}%`)
      .eq('transaction_type', 'voucher_purchase');
    
    if (transactions && transactions.length > 0) {
      res.json({ 
        confirmed: true, 
        transaction: transactions[0],
        timestamp: new Date().toISOString() 
      });
    } else {
      res.json({ 
        confirmed: false, 
        timestamp: new Date().toISOString() 
      });
    }
  } catch (error) {
    console.error('Error checking payment status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check bill status endpoint
app.get('/bill-status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Check if bill has been confirmed and processed
    const { data: billConfirmation } = await supabase
      .from('bill_confirmations')
      .select('*')
      .eq('order_id', orderId)
      .eq('confirmed', true)
      .single();
    
    if (billConfirmation && billConfirmation.ran_tokens) {
      res.json({ 
        confirmed: true, 
        ranTokens: billConfirmation.ran_tokens,
        confirmedAt: billConfirmation.confirmed_at,
        processedAt: billConfirmation.processed_at,
        timestamp: new Date().toISOString() 
      });
    } else {
      res.json({ 
        confirmed: false, 
        timestamp: new Date().toISOString() 
      });
    }
  } catch (error) {
    console.error('Error checking bill status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Telegram webhook server running on http://localhost:${port}`);
  console.log(`Webhook URL: http://localhost:${port}/telegram-webhook`);
});