import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { History, Plus, Minus, Gift, ShoppingBag } from "lucide-react";

interface ActivityItem {
  id: string;
  type: 'point_earned' | 'point_used' | 'voucher_redeemed' | 'voucher_used' | 'bill_rejected';
  title: string;
  description: string;
  amount?: number;
  timestamp: string;
  status?: 'success' | 'failed' | 'pending';
}

export const ActivityHistory = () => {
  const activities: ActivityItem[] = [
    {
      id: "1",
      type: 'point_earned',
      title: "Tích điểm từ hóa đơn",
      description: "#HĐ8423 - Ran Mixology Quận 1",
      amount: 53000,
      timestamp: "07/08/2025 - 14:52",
      status: 'success'
    },
    {
      id: "2",
      type: 'voucher_redeemed',
      title: "Đổi voucher",
      description: "Voucher Tặng Trà Đào",
      amount: -35000,
      timestamp: "07/08/2025 - 15:05",
      status: 'success'
    },
    {
      id: "3",
      type: 'voucher_used',
      title: "Sử dụng voucher",
      description: "Ran Mixology - Chi nhánh Quận 3",
      timestamp: "08/08/2025 - 17:40",
      status: 'success'
    },
    {
      id: "4",
      type: 'bill_rejected',
      title: "Bill bị từ chối",
      description: "#HĐ8422 - Lý do: ảnh mờ, không rõ số tiền",
      timestamp: "07/08/2025 - 14:30",
      status: 'failed'
    },
    {
      id: "5",
      type: 'point_earned',
      title: "Tích điểm từ hóa đơn",
      description: "#HĐ8421 - Ran Mixology Quận 7",
      amount: 42000,
      timestamp: "06/08/2025 - 19:15",
      status: 'success'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'point_earned':
        return <Plus className="h-4 w-4 text-success" />;
      case 'point_used':
      case 'voucher_redeemed':
        return <Minus className="h-4 w-4 text-warning" />;
      case 'voucher_used':
        return <Gift className="h-4 w-4 text-primary" />;
      case 'bill_rejected':
        return <Minus className="h-4 w-4 text-destructive" />;
      default:
        return <History className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status?: string, type?: string) => {
    if (status === 'failed') {
      return <Badge variant="destructive">Thất bại</Badge>;
    }
    if (status === 'pending') {
      return <Badge variant="secondary">Đang xử lý</Badge>;
    }
    if (type === 'point_earned') {
      return <Badge variant="secondary" className="bg-success/10 text-success">Đã tích</Badge>;
    }
    if (type === 'voucher_redeemed') {
      return <Badge variant="secondary" className="bg-warning/10 text-warning">Đã đổi</Badge>;
    }
    if (type === 'voucher_used') {
      return <Badge variant="secondary" className="bg-primary/10 text-primary">Đã dùng</Badge>;
    }
    return <Badge variant="secondary">Hoàn thành</Badge>;
  };

  const formatAmount = (amount?: number) => {
    if (!amount) return "";
    const sign = amount > 0 ? "+" : "";
    return `${sign}${amount.toLocaleString()} Ran`;
  };

  const pointActivities = activities.filter(a => a.type === 'point_earned' || a.type === 'point_used' || a.type === 'bill_rejected');
  const voucherActivities = activities.filter(a => a.type === 'voucher_redeemed' || a.type === 'voucher_used');

  return (
    <Card className="card-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Lịch sử hoạt động
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="points">Điểm</TabsTrigger>
            <TabsTrigger value="vouchers">Voucher</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            <div className="space-y-3">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-medium text-sm">{activity.title}</h4>
                        <p className="text-xs text-muted-foreground">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {getStatusBadge(activity.status, activity.type)}
                        {activity.amount && (
                          <p className={`text-sm font-medium mt-1 ${activity.amount > 0 ? 'text-success' : 'text-warning'}`}>
                            {formatAmount(activity.amount)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="points" className="space-y-4">
            <div className="space-y-3">
              {pointActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-medium text-sm">{activity.title}</h4>
                        <p className="text-xs text-muted-foreground">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {getStatusBadge(activity.status, activity.type)}
                        {activity.amount && (
                          <p className={`text-sm font-medium mt-1 ${activity.amount > 0 ? 'text-success' : 'text-warning'}`}>
                            {formatAmount(activity.amount)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="vouchers" className="space-y-4">
            <div className="space-y-3">
              {voucherActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-medium text-sm">{activity.title}</h4>
                        <p className="text-xs text-muted-foreground">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {getStatusBadge(activity.status, activity.type)}
                        {activity.amount && (
                          <p className={`text-sm font-medium mt-1 ${activity.amount > 0 ? 'text-success' : 'text-warning'}`}>
                            {formatAmount(activity.amount)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};