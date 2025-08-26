import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Trash2, Banknote, QrCode, ArrowLeft, Timer, Minus, Camera, Upload, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { sendOrderToTelegram, sendBillPhotoToTelegram } from "@/services/telegramService";
import { BillCaptureModal } from "@/components/member/BillCaptureModal";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  ice: string;
  sugar: string;
  quantity: number;
  prepTime: number;
}

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onRemoveItem: (index: number) => void;
  onUpdateQuantity: (index: number, quantity: number) => void;
  onBackToMenu: () => void;
  userPhone: string;
  userName: string;
  tableNumber: string;
}

export const CartModal = ({
  isOpen,
  onClose,
  cart,
  onRemoveItem,
  onUpdateQuantity,
  onBackToMenu,
  userPhone,
  userName,
  tableNumber
}: CartModalProps) => {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank'>('cash');
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [orderStatus, setOrderStatus] = useState<'waiting' | 'confirmed' | 'ready' | 'completed'>('waiting');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [showBillCapture, setShowBillCapture] = useState(false);
  const [ranTokensEarned, setRanTokensEarned] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal - voucherDiscount;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

  const applyVoucher = async () => {
    if (!voucherCode.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập mã voucher",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('voucher-purchase', {
        body: {
          voucherCode: voucherCode.trim(),
          userPhone,
          orderTotal: subtotal
        }
      });

      if (error) throw error;

      if (data.success) {
        setVoucherDiscount(data.discount);
        toast({
          title: "Thành công",
          description: `Áp dụng voucher thành công! Giảm ${formatPrice(data.discount)}`
        });
      } else {
        toast({
          title: "Lỗi",
          description: data.message || "Mã voucher không hợp lệ",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Voucher error:', error);
      toast({
        title: "Lỗi",
        description: "Không thể áp dụng voucher",
        variant: "destructive"
      });
    }
  };

  const handleConfirm = async () => {
    try {
      // Generate order ID
      const generatedOrderId = `ORD-${Date.now()}`;
      
      // Send order to Telegram
      const success = await sendOrderToTelegram({
        orderId: generatedOrderId,
        userName,
        userPhone,
        tableNumber,
        items: cart,
        total: total,
        subtotal: total - voucherDiscount,
        paymentMethod,
        voucherCode: voucherCode || '',
        voucherDiscount,
        orderTime: new Date().toLocaleString('vi-VN')
      });

      if (success) {
        setOrderId(generatedOrderId);
        setOrderStatus('waiting');
        
        toast({
          title: "Đặt hàng thành công!",
          description: `Mã đơn hàng: ${generatedOrderId}`
        });
      } else {
        throw new Error('Failed to send order to Telegram');
      }
    } catch (error) {
      console.error('Order error:', error);
      toast({
        title: "Lỗi",
        description: "Không thể đặt hàng. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };

  const handleReset = () => {
    setPaymentMethod('cash');
    setVoucherCode('');
    setVoucherDiscount(0);
    setOrderStatus('waiting');
    setOrderId(null);
    setShowBillCapture(false);
    setRanTokensEarned(0);
    onBackToMenu();
  };

  const handleAgreeNow = () => {
    setOrderStatus('confirmed');
    toast({
      title: "Đã xác nhận",
      description: "Đơn hàng đang được pha chế"
    });
  };

  const handleReceivedOrder = () => {
    setOrderStatus('ready');
    setShowBillCapture(true);
  };

  const handleBillCaptureSuccess = (tokens: number) => {
    setRanTokensEarned(tokens);
    setOrderStatus('completed');
    setShowBillCapture(false);
    toast({
      title: "Hoàn thành!",
      description: `Bạn đã nhận được ${tokens} RAN Tokens`
    });
  };

  useEffect(() => {
    if (orderStatus === 'waiting' && orderId) {
      setCountdown(180); // 3 minutes
      intervalRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [orderStatus, orderId]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Order status displays
  if (orderStatus === 'waiting' && orderId) {
    return (
      <>
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center flex items-center justify-center gap-2">
                <Timer className="w-5 h-5" />
                Đang chờ xác nhận
              </DialogTitle>
            </DialogHeader>
            
            <div className="text-center space-y-4">
              <div className="bg-orange-50 p-6 rounded-lg">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {formatTime(countdown)}
                </div>
                <p className="text-sm text-gray-600">Tự động xác nhận sau</p>
              </div>
              
              <div className="space-y-2 text-sm">
                <p><strong>Mã đơn hàng:</strong> {orderId}</p>
                <p><strong>Tổng tiền:</strong> {formatPrice(total)}</p>
                <p><strong>Phương thức:</strong> {paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}</p>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleReset}
                  className="flex-1"
                >
                  Đổi ý / Hủy đơn
                </Button>
                <Button 
                  onClick={handleAgreeNow}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Đồng ý ngay
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        <BillCaptureModal
          isOpen={showBillCapture}
          onClose={() => setShowBillCapture(false)}
          orderData={{
            orderId: orderId || '',
            userName: userName || 'Khách hàng',
            userPhone: userPhone || '',
            total
          }}
          onSuccess={handleBillCaptureSuccess}
        />
      </>
    );
  }

  if (orderStatus === 'confirmed' && orderId) {
    return (
      <>
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-blue-600">
                Đang pha chế
              </DialogTitle>
            </DialogHeader>
            
            <div className="text-center space-y-4">
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  Đang chuẩn bị...
                </div>
                <p className="text-sm text-gray-600">Đơn hàng của bạn đang được pha chế</p>
              </div>
              
              <div className="space-y-2 text-sm">
                <p><strong>Mã đơn hàng:</strong> {orderId}</p>
                <p><strong>Tổng tiền:</strong> {formatPrice(total)}</p>
              </div>
              
              <Button 
                onClick={handleReceivedOrder}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Đã nhận món
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        <BillCaptureModal
          isOpen={showBillCapture}
          onClose={() => setShowBillCapture(false)}
          orderData={{
            orderId: orderId || '',
            userName: userName || 'Khách hàng',
            userPhone: userPhone || '',
            total
          }}
          onSuccess={handleBillCaptureSuccess}
        />
      </>
    );
  }

  if (orderStatus === 'ready' && orderId) {
    return (
      <>
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-green-600">
                Sẵn sàng thanh toán
              </DialogTitle>
            </DialogHeader>
            
            <div className="text-center space-y-4">
              <div className="bg-green-50 p-6 rounded-lg">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-green-600 mb-2">
                  Đơn hàng đã sẵn sàng!
                </div>
                <p className="text-sm text-gray-600">Vui lòng chụp ảnh bill để hoàn thành</p>
              </div>
              
              <div className="space-y-2 text-sm">
                <p><strong>Mã đơn hàng:</strong> {orderId}</p>
                <p><strong>Tổng tiền:</strong> {formatPrice(total)}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        <BillCaptureModal
          isOpen={showBillCapture}
          onClose={() => setShowBillCapture(false)}
          orderData={{
            orderId: orderId || '',
            userName: userName || 'Khách hàng',
            userPhone: userPhone || '',
            total
          }}
          onSuccess={handleBillCaptureSuccess}
        />
      </>
    );
  }

  if (orderStatus === 'completed' && orderId) {
    return (
      <>
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-green-600">
                Hoàn thành!
              </DialogTitle>
            </DialogHeader>
            
            <div className="text-center space-y-4">
              <div className="bg-green-50 p-6 rounded-lg">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-green-600 mb-2">
                  Cảm ơn bạn!
                </div>
                <p className="text-sm text-gray-600 mb-4">Đơn hàng đã hoàn thành</p>
                
                {ranTokensEarned > 0 && (
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <p className="text-sm font-medium text-yellow-800">
                      🎉 Bạn đã nhận được {ranTokensEarned} RAN Tokens!
                    </p>
                  </div>
                )}
              </div>
              
              <div className="space-y-2 text-sm">
                <p><strong>Mã đơn hàng:</strong> {orderId}</p>
                <p><strong>Tổng tiền:</strong> {formatPrice(total)}</p>
              </div>
              
              <Button 
                onClick={handleReset}
                className="w-full"
              >
                Đặt hàng mới
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        <BillCaptureModal
          isOpen={showBillCapture}
          onClose={() => setShowBillCapture(false)}
          orderData={{
            orderId: orderId || '',
            userName: userName || 'Khách hàng',
            userPhone: userPhone || '',
            total
          }}
          onSuccess={handleBillCaptureSuccess}
        />
      </>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Giỏ hàng & Thanh toán
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Cart Items */}
            <div className="space-y-3">
              <h3 className="font-medium">Danh sách món ({cart.length})</h3>
              <div className="max-h-60 overflow-y-auto space-y-2 border rounded-lg p-3">
                {cart.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {item.ice} đá
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {item.sugar} đường
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-primary mt-1">
                        {formatPrice(item.price)} x {item.quantity} = {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => onUpdateQuantity(index, Math.max(1, item.quantity - 1))} 
                          className="w-8 h-8 p-0"
                        >
                          -
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => onUpdateQuantity(index, item.quantity + 1)} 
                          className="w-8 h-8 p-0"
                        >
                          +
                        </Button>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onRemoveItem(index)} 
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Voucher Section */}
            <div className="space-y-3">
              <Label htmlFor="voucher">Mã voucher (tùy chọn)</Label>
              <div className="flex gap-2">
                <Input 
                  id="voucher" 
                  placeholder="Nhập mã voucher" 
                  value={voucherCode} 
                  onChange={(e) => setVoucherCode(e.target.value)} 
                />
                <Button onClick={applyVoucher} variant="outline">
                  Áp dụng
                </Button>
              </div>
            </div>

            {/* Total Section */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Tạm tính:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {voucherDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá:</span>
                  <span>-{formatPrice(voucherDiscount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Tổng cộng:</span>
                <span className="text-primary">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-3">
              <Label>Phương thức thanh toán</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant={paymentMethod === 'cash' ? 'default' : 'outline'} 
                  onClick={() => setPaymentMethod('cash')} 
                  className="h-auto p-4"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Banknote className="w-5 h-5" />
                    <div className="text-center">
                      <div className="font-medium">Tiền mặt</div>
                      <div className="text-xs opacity-80">Thanh toán tại quầy</div>
                    </div>
                  </div>
                </Button>
                
                <Button 
                  variant={paymentMethod === 'bank' ? 'default' : 'outline'} 
                  onClick={() => setPaymentMethod('bank')} 
                  className="h-auto p-4"
                >
                  <div className="flex flex-col items-center gap-2">
                    <QrCode className="w-5 h-5" />
                    <div className="text-center">
                      <div className="font-medium">Chuyển khoản</div>
                      <div className="text-xs opacity-80">QR Code / Banking</div>
                    </div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleReset} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Lựa chọn lại
              </Button>
              <Button 
                id="btnConfirmOrder" 
                type="button" 
                onClick={handleConfirm} 
                className="flex-1 premium-gradient"
              >
                Xác nhận đơn hàng
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <BillCaptureModal
        isOpen={showBillCapture}
        onClose={() => setShowBillCapture(false)}
        orderData={{
          orderId: orderId || '',
          userName: userName || 'Khách hàng',
          userPhone: userPhone || '',
          total
        }}
        onSuccess={handleBillCaptureSuccess}
      />
    </>
  );
};