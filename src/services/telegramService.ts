const TELEGRAM_BOT_TOKEN = '8168944752:AAErA0I9XFXiNdfuA3xsz0RQc8Foa0oKib4';

// Room ID cho đăng nhập và đăng ký thành viên
const TELEGRAM_AUTH_CHAT_ID = '-4936541799';

// Room ID cho order món và nhận thông tin bill thanh toán
const TELEGRAM_ORDER_CHAT_ID = '-4882156924';

// Room ID cho xác nhận mua voucher và nhận hình ảnh QR thanh toán
const TELEGRAM_VOUCHER_CHAT_ID = '-4871031372';

interface UserRegistrationData {
  name: string;
  phone: string;
  registeredAt: string;
}

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  ice: string;
  sugar: string;
}

interface OrderData {
  userName: string;
  userPhone: string;
  tableNumber: string;
  items: OrderItem[];
  voucherCode?: string;
  voucherDiscount: number;
  subtotal: number;
  total: number;
  paymentMethod: 'cash' | 'bank';
  orderId: string;
  orderTime: string;
}

export const sendUserRegistrationToTelegram = async (userData: UserRegistrationData): Promise<boolean> => {
  try {
    const message = `🎉 *Đăng ký thành viên mới*\n\n` +
      `👤 *Họ tên:* ${userData.name}\n` +
      `📱 *Số điện thoại:* ${userData.phone}\n` +
      `⏰ *Thời gian đăng ký:* ${new Date(userData.registeredAt).toLocaleString('vi-VN')}\n` +
      `🏪 *Cửa hàng:* RAN 40 Ngô Quyền, Cửa Nam, Hà Nội\n` +
      `🎁 *Ran Token khởi tạo:* 500 tokens`;

    const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const response = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_AUTH_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    if (!response.ok) {
      console.error('Failed to send message to Telegram:', response.statusText);
      return false;
    }

    const result = await response.json();
    console.log('Message sent to Telegram successfully:', result);
    return true;
  } catch (error) {
    console.error('Error sending message to Telegram:', error);
    return false;
  }
};

export const sendUserLoginToTelegram = async (userData: UserRegistrationData): Promise<boolean> => {
  try {
    const message = `🔐 *Đăng nhập thành viên*\n\n` +
      `👤 *Họ tên:* ${userData.name}\n` +
      `📱 *Số điện thoại:* ${userData.phone}\n` +
      `⏰ *Thời gian đăng nhập:* ${new Date().toLocaleString('vi-VN')}\n` +
      `🏪 *Cửa hàng:* RAN 40 Ngô Quyền, Cửa Nam, Hà Nội`;

    const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const response = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_AUTH_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    if (!response.ok) {
      console.error('Failed to send login message to Telegram:', response.statusText);
      return false;
    }

    const result = await response.json();
    console.log('Login message sent to Telegram successfully:', result);
    return true;
  } catch (error) {
    console.error('Error sending login message to Telegram:', error);
    return false;
  }
};

export const sendOrderToTelegram = async (orderData: OrderData): Promise<boolean> => {
  try {
    const formatPrice = (price: number) => {
      return (price || 0).toLocaleString("vi-VN") + " đ";
    };

    const itemsList = orderData.items.map((item, index) => 
      `${index + 1}. *${item.name}*\n` +
      `   • Số lượng: ${item.quantity}\n` +
      `   • Đá: ${item.ice}, Đường: ${item.sugar}\n` +
      `   • Giá: ${formatPrice(item.price)} x ${item.quantity} = ${formatPrice(item.price * item.quantity)}`
    ).join('\n\n');

    let message = `🛒 *ĐƠN HÀNG MỚI*\n\n` +
      `📋 *Mã đơn:* ${orderData.orderId}\n` +
      `👤 *Khách hàng:* ${orderData.userName}\n` +
      `📱 *Số điện thoại:* ${orderData.userPhone}\n` +
      `🪑 *Bàn số:* ${orderData.tableNumber}\n` +
      `⏰ *Thời gian:* ${new Date(orderData.orderTime).toLocaleString('vi-VN')}\n\n` +
      `📝 *DANH SÁCH MÓN:*\n${itemsList}\n\n` +
      `💰 *Tạm tính:* ${formatPrice(orderData.subtotal)}\n`;

    if (orderData.voucherCode && orderData.voucherDiscount > 0) {
      message += `🎫 *Voucher:* ${orderData.voucherCode} (-${formatPrice(orderData.voucherDiscount)})\n`;
    }

    message += `💳 *Tổng cộng:* ${formatPrice(orderData.total)}\n` +
      `💸 *Thanh toán:* ${orderData.paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}\n\n` +
      `🏪 *Cửa hàng:* RAN 40 Ngô Quyền, Cửa Nam, Hà Nội`;

    const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const response = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_ORDER_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    if (!response.ok) {
      console.error('Failed to send order to Telegram:', response.statusText);
      return false;
    }

    const result = await response.json();
    console.log('Order sent to Telegram successfully:', result);
    return true;
  } catch (error) {
     console.error('Error sending order to Telegram:', error);
    return false;
  }
};

export const sendVoucherPaymentToTelegram = async (paymentData: { paymentId: string; userPhone: string; voucherName: string; amount: number; qrImageUrl?: string }): Promise<boolean> => {
  try {
    const message = `🎫 *MUA VOUCHER MỚI*\n\n` +
      `🆔 *Mã thanh toán:* ${paymentData.paymentId}\n` +
      `👤 *Khách hàng:* ${paymentData.userPhone}\n` +
      `🎁 *Voucher:* ${paymentData.voucherName}\n` +
      `💰 *Số tiền:* ${paymentData.amount.toLocaleString('vi-VN')} đ\n` +
      `⏰ *Thời gian:* ${new Date().toLocaleString('vi-VN')}\n\n` +
      `🏪 *Cửa hàng:* RAN 40 Ngô Quyền, Cửa Nam, Hà Nội\n\n` +
      `💳 *Vui lòng chuyển khoản và gửi ảnh QR để xác nhận*`;

    const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const response = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_VOUCHER_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
        reply_markup: JSON.stringify({
          inline_keyboard: [[
            {
              text: "✅ Xác nhận thanh toán",
              callback_data: `pay:${paymentData.paymentId.substring(0, 8)}:${paymentData.userPhone}:${paymentData.amount}`
            }
          ]]
        })
      }),
    });

    if (!response.ok) {
      console.error('Failed to send voucher payment to Telegram:', response.statusText);
      return false;
    }

    const result = await response.json();
    console.log('Voucher payment sent to Telegram successfully:', result);
    return true;
  } catch (error) {
    console.error('Error sending voucher payment to Telegram:', error);
    return false;
  }
};

export const sendBillPhotoToTelegram = async (file: File, orderData: { orderId: string; userName: string; userPhone: string; total: number }): Promise<boolean> => {
  try {
    const formData = new FormData();
    formData.append('chat_id', TELEGRAM_ORDER_CHAT_ID);
    formData.append('photo', file);
    
    const caption = `📸 *BILL THANH TOÁN*\n\n` +
      `📋 *Mã đơn:* ${orderData.orderId}\n` +
      `👤 *Khách hàng:* ${orderData.userName}\n` +
      `📱 *Số điện thoại:* ${orderData.userPhone}\n` +
      `💳 *Tổng tiền:* ${(orderData.total || 0).toLocaleString('vi-VN')} đ\n` +
      `⏰ *Thời gian:* ${new Date().toLocaleString('vi-VN')}\n\n` +
      `🏪 *Cửa hàng:* RAN 40 Ngô Quyền, Cửa Nam, Hà Nội`;
    
    formData.append('caption', caption);
    formData.append('parse_mode', 'Markdown');

    const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;
    
    const response = await fetch(telegramApiUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      console.error('Failed to send bill photo to Telegram:', response.statusText);
      return false;
    }

    const result = await response.json();
    console.log('Bill photo sent to Telegram successfully:', result);
    return true;
  } catch (error) {
    console.error('Error sending bill photo to Telegram:', error);
    return false;
  }
};