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

    const body = await req.json()
    console.log('Telegram webhook received:', JSON.stringify(body, null, 2))

    // Handle callback query (when admin clicks confirmation button)
    if (body.callback_query) {
      const callbackData = body.callback_query.data
      const chatId = body.callback_query.message.chat.id
      const messageId = body.callback_query.message.message_id
      
      console.log('Callback data:', callbackData)
      
      // Parse callback data: confirm_payment_{paymentIntentId}_{userPhone}_{rewardRan}
      if (callbackData.startsWith('confirm_payment_')) {
        const parts = callbackData.split('_')
        if (parts.length >= 5) {
          const paymentIntentId = parts[2]
          const userPhone = parts[3]
          const rewardRan = parseInt(parts[4])
          
          console.log('Processing payment confirmation:', { paymentIntentId, userPhone, rewardRan })
          
          // Update user's RAN wallet
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
            const newBalance = existingWallet.balance_ran + rewardRan
            const newTotalEarned = existingWallet.total_earned_ran + rewardRan
            
            walletResult = await supabaseClient
              .from('ran_wallets')
              .update({
                balance_ran: newBalance,
                total_earned_ran: newTotalEarned,
                updated_at: new Date().toISOString()
              })
              .eq('user_phone', userPhone)
          } else {
            // Create new wallet
            walletResult = await supabaseClient
              .from('ran_wallets')
              .insert({
                user_phone: userPhone,
                balance_ran: rewardRan,
                total_earned_ran: rewardRan,
                total_spent_ran: 0
              })
          }
          
          if (walletResult.error) {
            throw new Error(`Error updating wallet: ${walletResult.error.message}`)
          }
          
          // Add transaction record
          const { error: transactionError } = await supabaseClient
            .from('ran_wallet_transactions')
            .insert({
              user_phone: userPhone,
              amount: rewardRan,
              kind: 'bill',
              reference: `Payment confirmation for intent ${paymentIntentId}`
            })
          
          if (transactionError) {
            console.error('Error adding transaction:', transactionError)
          }
          
          // Send confirmation message to Telegram
          const confirmationMessage = {
            chat_id: chatId,
            text: `✅ Đã xác nhận thanh toán thành công!\n\n` +
                  `👤 Khách hàng: ${userPhone}\n` +
                  `🏆 RAN Token đã cộng: +${rewardRan.toLocaleString()}\n` +
                  `⏰ Thời gian xác nhận: ${new Date().toLocaleString('vi-VN')}`,
            reply_to_message_id: messageId
          }
          
          // Send confirmation to Telegram
          await fetch(`https://api.telegram.org/bot8168944752:AAErA0I9XFXiNdfuA3xsz0RQc8Foa0oKib4/sendMessage`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(confirmationMessage)
          })
          
          // Answer the callback query
          await fetch(`https://api.telegram.org/bot8168944752:AAErA0I9XFXiNdfuA3xsz0RQc8Foa0oKib4/answerCallbackQuery`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              callback_query_id: body.callback_query.id,
              text: `Đã xác nhận thanh toán cho ${userPhone}`,
              show_alert: false
            })
          })
          
          // Here you would typically send a real-time notification to the user's browser
          // For now, we'll just log it
          console.log(`Payment confirmed for ${userPhone}, added ${rewardRan} RAN tokens`)
          
          return new Response(
            JSON.stringify({ success: true, message: 'Payment confirmed' }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            },
          )
        }
      }
    }
    
    return new Response(
      JSON.stringify({ success: true, message: 'Webhook processed' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})