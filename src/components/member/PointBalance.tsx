import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, TrendingUp, Clock, Gift } from "lucide-react";

interface PointBalanceProps {
  ranTokens: number;
  memberData: any;
}

export const PointBalance = ({ ranTokens, memberData }: PointBalanceProps) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const getMonthlyGain = () => {
    // Simulate monthly point gain based on total spent
    return Math.floor(memberData.monthlySpent * 0.1) || 75000;
  };

  const getTotalLifetime = () => {
    // Simulate lifetime points based on total spent
    return Math.floor(memberData.totalSpent * 0.1) || 1250000;
  };

  return (
    <Card className="card-shadow gradient-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-primary" />
          Số dư Ran Point
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Balance */}
        <div className="text-center p-6 bg-gradient-primary rounded-lg text-white">
          <p className="text-sm opacity-90 mb-2">Số điểm hiện tại</p>
          <p className="text-3xl font-bold mb-1">{formatNumber(ranTokens)}</p>
          <p className="text-sm opacity-90">Ran Point</p>
        </div>

        {/* Value Equivalent */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Giá trị quy đổi</span>
          </div>
          <p className="text-lg font-semibold text-primary">
            {formatNumber(ranTokens)} VNĐ
          </p>
          <p className="text-xs text-muted-foreground">Tương đương voucher</p>
        </div>

        {/* Points Expiring Soon */}
        <div className="bg-warning/10 border border-warning/20 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-warning" />
            <span className="text-sm font-medium">Điểm sắp hết hạn</span>
          </div>
          <p className="font-semibold">{formatNumber(memberData.pointsExpiringSoon || 25000)} Ran</p>
          <p className="text-xs text-muted-foreground">
            Hết hạn vào {memberData.expiryDate || "30/08/2025"}
          </p>
        </div>

        {/* Monthly Stats */}
        <div className="grid grid-cols-1 gap-4">
          <div className="text-center p-3 bg-success/10 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-success" />
              <span className="text-sm font-medium">Tích lũy tháng này</span>
            </div>
            <p className="text-lg font-semibold text-success">
              +{formatNumber(getMonthlyGain())} Ran
            </p>
            <p className="text-xs text-muted-foreground">Tháng 08</p>
          </div>

          <div className="text-center p-3 bg-primary/10 rounded-lg">
            <span className="text-sm font-medium block mb-1">Tổng tích lũy</span>
            <p className="text-lg font-semibold text-primary">
              {formatNumber(getTotalLifetime())} Ran
            </p>
            <p className="text-xs text-muted-foreground">
              (~{formatNumber(getTotalLifetime() / 100)} triệu chi tiêu)
            </p>
          </div>
        </div>

        {/* Point Earning Rate */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Tỷ lệ tích điểm</span>
            <Badge variant="secondary">
              {memberData.tier === "Kim Cương" ? "12%" : "10%"} của hóa đơn
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};