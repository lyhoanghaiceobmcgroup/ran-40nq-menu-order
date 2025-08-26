import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Clock, CreditCard, CheckCircle, AlertCircle, Camera, Upload } from "lucide-react";
import { toast } from "sonner";
import qrImage from "@/assets/qr-scan.jpg";

interface PaymentIntent {
  id: string;
  amount: number;
  paymentContent: string;
  expiresAt: string;
  accountNumber: string;
  bankName: string;
}

interface Voucher {
  name: string;
  description: string;
  rewardRan: number;
}

interface MBPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentIntent: PaymentIntent | null;
  voucher: Voucher | null;
  userPhone: string;
  onSuccess: (rewardRan: number) => void;
}

export const MBPaymentModal = ({ 
  isOpen, 
  onClose, 
  paymentIntent, 
  voucher, 
  userPhone,
  onSuccess 
}: MBPaymentModalProps) => {
  const [isChecking, setIsChecking] = useState(false);
  const [checkAttempts, setCheckAttempts] = useState(0);
  const [showBillUpload, setShowBillUpload] = useState(false);
  const [uploadingBill, setUploadingBill] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${label}`);
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('vi-VN') + ' VNĐ';
  };

  const checkPaymentStatus = async () => {
    if (!paymentIntent || isChecking) return;

    setIsChecking(true);
    setCheckAttempts(prev => prev + 1);

    try {
      const response = await fetch(`https://mrbupzghoxuzntenmazv.supabase.co/functions/v1/wallet-status?phone=${userPhone}`);
      const data = await response.json();

      if (data.success) {
        // Check if there are any completed transactions since we started waiting
        const recentTransactions = data.transactions.filter((txn: any) => 
          txn.transaction_type === 'PURCHASE_CREDIT' && 
          new Date(txn.created_at) > new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
        );

        if (recentTransactions.length > 0 && voucher) {
          toast.success(`Bạn đã đổi thành công và + ${voucher.rewardRan.toLocaleString()} RAN vào tài khoản.`);
          onSuccess(voucher.rewardRan);
          onClose();
          return;
        }
      }

      if (checkAttempts < 10) {
        // Continue checking every 3 seconds for up to 30 seconds
        setTimeout(() => checkPaymentStatus(), 3000);
      } else {
        toast.error("Chưa nhận được xác nhận thanh toán. Vui lòng kiểm tra lại sau.");
      }
    } catch (error) {
      console.error('Payment check error:', error);
      toast.error("Lỗi kiểm tra thanh toán. Vui lòng thử lại.");
    } finally {
      setIsChecking(false);
    }
  };

  const handleStartChecking = () => {
    setCheckAttempts(0);
    checkPaymentStatus();
    toast.info("Đang theo dõi thanh toán... Vui lòng chuyển khoản ngay bây giờ.");
  };

  const handleBillUpload = async (file: File) => {
    if (!paymentIntent || !voucher) {
      toast.error("Thông tin thanh toán không hợp lệ.");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File quá lớn. Vui lòng chọn file nhỏ hơn 10MB.");
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Vui lòng chọn file ảnh hợp lệ.");
      return;
    }

    setUploadingBill(true);
    try {
      console.log('Starting bill upload...', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('photo', file);
      
      const telegramBotToken = '8168944752:AAErA0I9XFXiNdfuA3xsz0RQc8Foa0oKib4';
      const chatId = '-4871031372';
      
      const message = `🧾 BILL THANH TOÁN VOUCHER\n\n` +
        `👤 Khách hàng: ${userPhone}\n` +
        `🎫 Voucher: ${voucher.name}\n` +
        `💰 Số tiền: ${formatAmount(paymentIntent.amount)}\n` +
        `📝 Nội dung CK: ${paymentIntent.paymentContent}\n` +
        `🏆 RAN Token: +${voucher.rewardRan.toLocaleString()}\n\n` +
        `⏰ Thời gian: ${new Date().toLocaleString('vi-VN')}`;

      formData.append('chat_id', chatId);
      formData.append('caption', message);
      // Shorten callback_data to avoid BUTTON_DATA_INVALID error (max 64 bytes)
      const shortPaymentId = paymentIntent.id.substring(0, 8);
      const callbackData = `pay:${shortPaymentId}:${userPhone}:${voucher.rewardRan}`;
      
      console.log('Callback data length:', callbackData.length, 'data:', callbackData);
      
      formData.append('reply_markup', JSON.stringify({
        inline_keyboard: [[
          {
            text: '✅ Xác nhận thanh toán',
            callback_data: callbackData
          }
        ]]
      }));

      console.log('Sending to Telegram...', {
        chatId,
        messageLength: message.length
      });

      // Send photo with inline keyboard
      const response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendPhoto`, {
        method: 'POST',
        body: formData
      });

      console.log('Telegram response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Telegram response:', result);
        toast.success("Đã gửi bill thanh toán! Vui lòng chờ xác nhận.");
        setShowBillUpload(false);
        
        // Start listening for confirmation from Telegram
        startListeningForConfirmation();
      } else {
        const errorText = await response.text();
        console.error('Telegram API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Telegram API error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error uploading bill:', error);
      if (error instanceof Error) {
        toast.error(`Lỗi khi gửi bill: ${error.message}`);
      } else {
        toast.error("Lỗi khi gửi bill. Vui lòng thử lại.");
      }
    } finally {
      setUploadingBill(false);
    }
  };

  const startListeningForConfirmation = () => {
    if (!paymentIntent || !voucher) return;
    
    console.log('Started listening for payment confirmation...', paymentIntent.id);
    
    // Poll for payment confirmation every 5 seconds
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:3001/payment-status/${paymentIntent.id}`);
        
        if (response.ok) {
          const result = await response.json();
          console.log('Payment status check:', result);
          
          if (result.confirmed) {
            clearInterval(pollInterval);
            toast.success(`Chúc mừng! Thanh toán đã được xác nhận. +${voucher.rewardRan.toLocaleString()} RAN Token đã được cộng vào tài khoản.`);
            onSuccess(voucher.rewardRan);
            onClose();
          }
        } else {
          console.warn('Failed to check payment status:', response.status);
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    }, 5000);
    
    // Stop polling after 10 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      console.log('Stopped polling for payment confirmation after 10 minutes');
    }, 10 * 60 * 1000);
    
    // Show initial message
    toast.info("Đang chờ xác nhận từ admin. Bạn sẽ nhận được thông báo khi thanh toán được xác nhận.");
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        handleBillUpload(file);
      } else {
        toast.error("Vui lòng chọn file ảnh.");
      }
    }
  };

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  };

  const handleGallerySelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };

  if (!paymentIntent || !voucher) return null;

  const expiryTime = new Date(paymentIntent.expiresAt);
  const isExpired = new Date() > expiryTime;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-3">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-4 w-4 text-primary" />
            Thanh toán {voucher.name}
          </DialogTitle>
          <DialogDescription className="text-sm">
            Quét mã QR hoặc chuyển khoản theo thông tin bên dưới
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Voucher Info - Compact */}
          <div className="bg-gradient-subtle p-3 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm text-primary">{voucher.name}</h3>
              <Badge variant="secondary" className="bg-success/10 text-success text-xs">
                +{voucher.rewardRan.toLocaleString()} RAN
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{voucher.description}</p>
          </div>

          {/* QR Code - Smaller */}
          <div className="text-center">
            <div className="bg-white p-3 rounded-lg shadow-sm border mx-auto w-fit">
              <img 
                src="/lovable-uploads/a95ba391-3b03-4858-a818-f0c0843f1963.png" 
                alt="QR Code MB Bank - 9090190899999" 
                className="w-32 h-32 mx-auto"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Quét mã QR bằng app MB Bank
            </p>
          </div>

          {/* Payment Details - Compact */}
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-card rounded border">
              <span className="text-xs font-medium">Tài khoản:</span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-sm">{paymentIntent.accountNumber}</span>
                <Button
                  size="sm" 
                  variant="outline"
                  className="h-6 w-6 p-0"
                  onClick={() => copyToClipboard(paymentIntent.accountNumber, "số tài khoản")}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 bg-card rounded border">
              <span className="text-xs font-medium">Số tiền:</span>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-primary text-sm">
                  {formatAmount(paymentIntent.amount)}
                </span>
                <Button
                  size="sm" 
                  variant="outline"
                  className="h-6 w-6 p-0"
                  onClick={() => copyToClipboard(paymentIntent.amount.toString(), "số tiền")}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 bg-card rounded border">
              <span className="text-xs font-medium">Nội dung CK:</span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-xs">{paymentIntent.paymentContent}</span>
                <Button
                  size="sm" 
                  variant="outline"
                  className="h-6 w-6 p-0"
                  onClick={() => copyToClipboard(paymentIntent.paymentContent, "nội dung")}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Warning - Compact */}
          <div className="flex items-start gap-2 p-2 bg-warning/10 border border-warning/20 rounded">
            <AlertCircle className="h-3 w-3 text-warning mt-0.5 flex-shrink-0" />
            <div className="text-xs">
              <p className="font-medium text-warning">Lưu ý:</p>
              <p className="text-muted-foreground">
                Chuyển đúng số tiền và giữ nguyên nội dung để hệ thống tự động cộng RAN.
              </p>
            </div>
          </div>

          {/* Expiry - Compact */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>
              {isExpired ? 
                "Đã hết hạn" : 
                `Hết hạn: ${expiryTime.toLocaleDateString('vi-VN')} ${expiryTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
              }
            </span>
          </div>

          {/* Action Buttons - Compact */}
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1 h-9"
              size="sm"
            >
              Đóng
            </Button>
            <Button 
              onClick={() => setShowBillUpload(true)}
              disabled={isExpired || uploadingBill}
              className="flex-1 h-9"
              size="sm"
            >
              {uploadingBill ? (
                <>
                  <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <CheckCircle className="h-3 w-3 mr-2" />
                  Đã chuyển khoản
                </>
              )}
            </Button>
          </div>

          {/* Bill Upload Options */}
          {showBillUpload && (
            <div className="space-y-3 p-3 bg-card rounded-lg border">
              <h4 className="font-semibold text-sm text-center">Chụp bill thanh toán</h4>
              <div className="flex gap-2">
                <Button
                  onClick={handleCameraCapture}
                  disabled={uploadingBill}
                  className="flex-1 h-10"
                  variant="outline"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Chụp ảnh
                </Button>
                <Button
                  onClick={handleGallerySelect}
                  disabled={uploadingBill}
                  className="flex-1 h-10"
                  variant="outline"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Từ thư viện
                </Button>
              </div>
              <Button
                onClick={() => setShowBillUpload(false)}
                variant="ghost"
                className="w-full h-8 text-xs"
              >
                Hủy
              </Button>
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};