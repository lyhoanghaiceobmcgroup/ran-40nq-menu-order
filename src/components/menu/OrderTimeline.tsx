import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Coffee, Bell } from "lucide-react";
import { Order } from "@/pages/Menu";

interface OrderTimelineProps {
  order: Order;
  onOrderUpdate: (order: Order) => void;
}

export const OrderTimeline = ({ order, onOrderUpdate }: OrderTimelineProps) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentStatus, setCurrentStatus] = useState(order.status);

  useEffect(() => {
    if (order.status === 'confirmed') {
      setTimeLeft(order.estimatedTime);
      
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Order is ready
            const updatedOrder = { ...order, status: 'ready' as const };
            setCurrentStatus('ready');
            onOrderUpdate(updatedOrder);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [order.status, order.estimatedTime, onOrderUpdate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Chờ xác nhận',
          description: 'Đang chờ nhân viên xác nhận thanh toán',
          icon: Clock,
          color: 'bg-yellow-500'
        };
      case 'confirmed':
        return {
          label: 'Đang chuẩn bị',
          description: 'Nhân viên đang pha chế đồ uống của bạn',
          icon: Coffee,
          color: 'bg-blue-500'
        };
      case 'ready':
        return {
          label: 'Sẵn sàng',
          description: 'Đồ uống đã hoàn tất - Vui lòng nhận tại quầy',
          icon: Bell,
          color: 'bg-green-500'
        };
      case 'completed':
        return {
          label: 'Hoàn tất',
          description: 'Cảm ơn bạn đã sử dụng dịch vụ',
          icon: CheckCircle,
          color: 'bg-green-600'
        };
      default:
        return {
          label: 'Đang xử lý',
          description: 'Đang xử lý đơn hàng',
          icon: Clock,
          color: 'bg-gray-500'
        };
    }
  };

  const statusInfo = getStatusInfo(currentStatus);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <Card className="bg-background/95 backdrop-blur-sm border-primary/20 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${statusInfo.color} animate-pulse`} />
            Đơn hàng #{order.id.slice(-4)}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <StatusIcon className="w-5 h-5 text-primary" />
              <div>
                <div className="font-medium">{statusInfo.label}</div>
                <div className="text-sm text-muted-foreground">
                  {statusInfo.description}
                </div>
              </div>
            </div>
            
            {currentStatus === 'confirmed' && timeLeft > 0 && (
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-xs text-muted-foreground">
                  thời gian còn lại
                </div>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Đồ uống đã gọi:</div>
            <div className="flex flex-wrap gap-2">
              {order.items.map((item, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {item.name} x{item.quantity}
                </Badge>
              ))}
            </div>
          </div>

          {/* Progress Bar for confirmed orders */}
          {currentStatus === 'confirmed' && (
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-1000"
                style={{ 
                  width: `${((order.estimatedTime - timeLeft) / order.estimatedTime) * 100}%` 
                }}
              />
            </div>
          )}

          {currentStatus === 'ready' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-green-800">
                <Bell className="w-4 h-4" />
                <span className="font-medium">
                  Đồ uống của bạn đã sẵn sàng! Vui lòng nhận tại quầy.
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};