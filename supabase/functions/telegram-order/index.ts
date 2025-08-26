import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
  // Room ID cho order món và nhận thông tin bill thanh toán
   const CHAT_ID = '-4882156924';
    
    if (!BOT_TOKEN) {
      throw new Error('TELEGRAM_BOT_TOKEN is not configured');
    }

    const body = await req.json();
    console.log('Received order data:', body);

    // Generate orderId if not provided
    const orderId = body.orderId || `ORD-${Date.now()}`;

    let message = '';

    if (body.type === 'change_of_mind') {
      message = `🚫 KHÁCH ĐỔI Ý\n\n`;
      message += `📋 Mã đơn: ${orderId}\n`;
      message += `🏪 Bàn: ${body.tableNumber}\n`;
      message += `👤 Khách: ${body.userName} (${body.userPhone})\n`;
      message += `\n⚠️ Khách hàng đã hủy đơn hàng này!`;
    } else {
      // Format order message
      message = `🍹 ĐỚN HÀNG MỚI\n\n`;
      message += `📋 Mã đơn: ${orderId}\n`;
      message += `🏪 Bàn: ${body.tableNumber}\n`;
      message += `👤 Khách: ${body.userName} (${body.userPhone})\n`;
      message += `💳 Thanh toán: ${body.paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}\n\n`;

      message += `📋 CHI TIẾT ĐƠN HÀNG:\n`;
      body.items.forEach((item: any, index: number) => {
        message += `${index + 1}. ${item.name}\n`;
        message += `   • ${item.ice} đá, ${item.sugar} đường\n`;
        message += `   • SL: ${item.quantity} x ${item.price.toLocaleString('vi-VN')}đ\n`;
        message += `   • Thành tiền: ${(item.price * item.quantity).toLocaleString('vi-VN')}đ\n\n`;
      });

      if (body.voucherCode && body.voucherDiscount) {
        message += `🎫 Voucher: ${body.voucherCode} (-${body.voucherDiscount.toLocaleString('vi-VN')}đ)\n`;
      }

      message += `💰 TỔNG TIỀN: ${body.total.toLocaleString('vi-VN')}đ\n\n`;
      message += `⏰ Thời gian: ${new Date().toLocaleString('vi-VN')}\n`;
      message += `🔄 Tự động xác nhận sau 3 phút nếu không có thay đổi`;
    }

    // Send to Telegram
    const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const telegramResponse = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      }),
    });

    if (!telegramResponse.ok) {
      const errorData = await telegramResponse.json();
      console.error('Telegram API error:', errorData);
      throw new Error(`Telegram API error: ${errorData.description}`);
    }

    const telegramData = await telegramResponse.json();
    console.log('Message sent to Telegram:', telegramData);

    return new Response(
      JSON.stringify({ 
        success: true,
        orderId: orderId,
        message: 'Order notification sent successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in telegram-order function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});