import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, CreditCard, Banknote, QrCode } from "lucide-react";
import { CartItem } from "@/pages/Menu";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  total: number;
  onConfirm: (paymentMethod: 'cash' | 'transfer') => void;
  onRemoveItem: (index: number) => void;
}

export const PaymentModal = ({ 
  isOpen, 
  onClose, 
  cart, 
  total, 
  onConfirm, 
  onRemoveItem 
}: PaymentModalProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Xác nhận đơn hàng
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Cart Items */}
          <div className="max-h-60 overflow-y-auto space-y-3">
            {cart.map((item, index) => (
              <div key={`${item.id}-${index}`} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{item.name}</h4>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {item.ice} đá
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {item.sugar} đường
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      x{item.quantity}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-primary mt-1">
                    {formatPrice(item.price * item.quantity)}
                  </p>
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
            ))}
          </div>

          {/* Total */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Tổng cộng:</span>
              <span className="text-primary">{formatPrice(total)}</span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3">
            <h4 className="font-medium">Phương thức thanh toán:</h4>
            
            <Button
              onClick={() => onConfirm('cash')}
              variant="outline"
              className="w-full justify-start h-auto p-4"
            >
              <Banknote className="w-5 h-5 mr-3 text-green-600" />
              <div className="text-left">
                <div className="font-medium">Tiền mặt</div>
                <div className="text-sm text-muted-foreground">
                  Thanh toán trực tiếp tại quầy
                </div>
              </div>
            </Button>

            <Button
              onClick={() => onConfirm('transfer')}
              variant="outline"
              className="w-full justify-start h-auto p-4"
            >
              <QrCode className="w-5 h-5 mr-3 text-blue-600" />
              <div className="text-left">
                <div className="font-medium">Chuyển khoản</div>
                <div className="text-sm text-muted-foreground">
                  Quét mã QR hoặc chuyển khoản
                </div>
              </div>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};