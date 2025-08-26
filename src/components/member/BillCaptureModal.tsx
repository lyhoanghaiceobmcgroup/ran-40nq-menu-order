import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface BillCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: {
    orderId: string;
    userName: string;
    userPhone: string;
    total: number;
  };
  onSuccess: (ranTokens: number) => void;
}

export const BillCaptureModal = ({
  isOpen,
  onClose,
  orderData,
  onSuccess
}: BillCaptureModalProps) => {
  const [billImage, setBillImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setBillImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const triggerCameraInput = () => {
    cameraInputRef.current?.click();
  };

  const handleBillUpload = async () => {
    if (!billImage || !orderData) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', billImage);
      formData.append('orderId', orderData.orderId);
      formData.append('userName', orderData.userName);
      formData.append('userPhone', orderData.userPhone);
      formData.append('total', orderData.total.toString());

      // Send to Telegram bot with inline keyboard
      const telegramBotToken = '8168944752:AAErA0I9XFXiNdfuA3xsz0RQc8Foa0oKib4';
      const chatId = '-4882156924';
      
      const caption = `🧾 *Bill Thanh Toán Mới*\n\n` +
        `👤 *Khách hàng:* ${orderData.userName}\n` +
        `📱 *Số điện thoại:* ${orderData.userPhone}\n` +
        `🆔 *Mã đơn hàng:* ${orderData.orderId}\n` +
        `💰 *Tổng tiền:* ${orderData.total.toLocaleString('vi-VN')} đ\n` +
        `⏰ *Thời gian:* ${new Date().toLocaleString('vi-VN')}`;

      const inlineKeyboard = {
        inline_keyboard: [[
          {
            text: "✅ Xác Nhận",
            callback_data: `confirm_bill:${orderData.orderId}:${orderData.userPhone}`
          },
          {
            text: "💰 Nhập RAN Token",
            callback_data: `input_token:${orderData.orderId}:${orderData.userPhone}`
          }
        ]]
      };

      const telegramFormData = new FormData();
      telegramFormData.append('chat_id', chatId);
      telegramFormData.append('photo', billImage);
      telegramFormData.append('caption', caption);
      telegramFormData.append('parse_mode', 'Markdown');
      telegramFormData.append('reply_markup', JSON.stringify(inlineKeyboard));

      const response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendPhoto`, {
        method: 'POST',
        body: telegramFormData
      });

      if (response.ok) {
        toast.success('Bill đã được gửi thành công! Đang chờ admin xác nhận.');
        
        // Start listening for confirmation
        startListeningForConfirmation();
        
        // Reset form
        setBillImage(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (cameraInputRef.current) cameraInputRef.current.value = '';
      } else {
        throw new Error('Failed to send to Telegram');
      }
    } catch (error) {
      console.error('Error uploading bill:', error);
      toast.error('Lỗi khi gửi bill. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
    }
  };

  const startListeningForConfirmation = () => {
    if (!orderData) return;
    
    console.log('Started listening for bill confirmation...', orderData.orderId);
    
    // Poll for confirmation every 5 seconds
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:3001/bill-status/${orderData.orderId}`);
        
        if (response.ok) {
          const result = await response.json();
          console.log('Bill status check:', result);
          
          if (result.confirmed && result.ranTokens) {
            clearInterval(pollInterval);
            toast.success(`Chúc mừng! Bill đã được xác nhận. +${result.ranTokens.toLocaleString()} RAN Token đã được cộng vào tài khoản.`);
            onSuccess(result.ranTokens);
            onClose();
          }
        } else {
          console.warn('Failed to check bill status:', response.status);
        }
      } catch (error) {
        console.error('Error checking bill status:', error);
      }
    }, 5000);
    
    // Stop polling after 10 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      console.log('Stopped polling for bill confirmation after 10 minutes');
    }, 10 * 60 * 1000);
    
    // Show initial message
    toast.info("Đang chờ xác nhận từ admin. Bạn sẽ nhận được thông báo khi bill được xác nhận.");
  };

  const clearImage = () => {
    setBillImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            📸 Chụp ảnh Bill Thanh Toán
          </DialogTitle>
          <DialogDescription>
            Chụp ảnh hoặc chọn ảnh bill thanh toán để nhận RAN Token
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Order Info */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="font-medium mb-2">Thông tin đơn hàng</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Mã đơn: {orderData.orderId}</p>
              <p>Khách hàng: {orderData.userName}</p>
              <p>Tổng tiền: {orderData.total.toLocaleString('vi-VN')} đ</p>
            </div>
          </div>

          {/* Image Preview */}
          {previewUrl && (
            <div className="relative">
              <img 
                src={previewUrl} 
                alt="Bill preview" 
                className="w-full h-48 object-cover rounded-lg border"
              />
              <Button
                onClick={clearImage}
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* File Inputs */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
          />
          <input
            type="file"
            ref={cameraInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            capture="environment"
            className="hidden"
          />

          {/* Action Buttons */}
          {!billImage ? (
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={triggerCameraInput} variant="outline" className="h-20 flex-col">
                <Camera className="w-6 h-6 mb-2" />
                <span className="text-sm">Chụp ảnh</span>
              </Button>
              <Button onClick={triggerFileInput} variant="outline" className="h-20 flex-col">
                <Upload className="w-6 h-6 mb-2" />
                <span className="text-sm">Chọn từ album</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-green-600 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Đã chọn ảnh: {billImage.name}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={clearImage} variant="outline">
                  Chọn lại
                </Button>
                <Button 
                  onClick={handleBillUpload} 
                  disabled={isUploading}
                  className="premium-gradient text-white"
                >
                  {isUploading ? 'Đang gửi...' : 'Gửi Bill'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};