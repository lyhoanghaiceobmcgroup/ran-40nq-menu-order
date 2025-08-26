import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Crown, TrendingUp, Star, Gift } from "lucide-react";

interface MemberTierProps {
  memberData: any;
  onTierUpdate: (data: any) => void;
}

interface TierInfo {
  name: string;
  requirement: string;
  benefits: string[];
  color: string;
  icon: string;
  minSpent: number;
}

export const MemberTier = ({ memberData, onTierUpdate }: MemberTierProps) => {
  const tiers: TierInfo[] = [
    {
      name: "Đồng",
      requirement: "< 500K chi tiêu/tháng",
      benefits: ["Tích 10% Ran Point"],
      color: "bronze",
      icon: "🥉",
      minSpent: 0
    },
    {
      name: "Bạc",
      requirement: "500K - 1 triệu/tháng",
      benefits: ["Tích 10% Ran Point", "Tặng 1 voucher 10K/tháng"],
      color: "silver",
      icon: "🥈",
      minSpent: 500000
    },
    {
      name: "Vàng",
      requirement: "1 - 3 triệu/tháng",
      benefits: ["Tích 10% Ran Point", "1 món miễn phí/tháng", "Ưu tiên hỗ trợ"],
      color: "gold",
      icon: "🥇",
      minSpent: 1000000
    },
    {
      name: "Kim Cương",
      requirement: "> 3 triệu/tháng",
      benefits: [
        "Tích 12% Ran Point",
        "Ưu đãi sinh nhật đặc biệt",
        "Ưu tiên đặt bàn",
        "Hộp quà định kỳ"
      ],
      color: "diamond",
      icon: "💎",
      minSpent: 3000000
    }
  ];

  const currentTier = tiers.find(tier => tier.name === memberData.tier) || tiers[0];
  const currentTierIndex = tiers.findIndex(tier => tier.name === memberData.tier);
  const nextTier = tiers[currentTierIndex + 1];
  
  const monthlySpent = memberData.monthlySpent || 250000;
  const progressToNext = nextTier 
    ? Math.min(100, (monthlySpent / nextTier.minSpent) * 100)
    : 100;
  
  const remainingToNext = nextTier 
    ? Math.max(0, nextTier.minSpent - monthlySpent)
    : 0;

  const getTierBadgeClass = (color: string) => {
    const baseClass = "tier-badge";
    switch (color) {
      case 'bronze':
        return `${baseClass} bg-amber-100 text-amber-800 border-amber-200`;
      case 'silver':
        return `${baseClass} bg-gray-100 text-gray-800 border-gray-200`;
      case 'gold':
        return `${baseClass} bg-yellow-100 text-yellow-800 border-yellow-200`;
      case 'diamond':
        return `${baseClass} bg-blue-100 text-blue-800 border-blue-200`;
      default:
        return baseClass;
    }
  };

  return (
    <Card className="card-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-primary" />
          Hạng thành viên
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Tier */}
        <div className="text-center p-6 bg-gradient-subtle rounded-lg">
          <div className="text-4xl mb-2">{currentTier.icon}</div>
          <Badge className={getTierBadgeClass(currentTier.color)}>
            Hạng {currentTier.name}
          </Badge>
          <p className="text-sm text-muted-foreground mt-2">
            {currentTier.requirement}
          </p>
        </div>

        {/* Current Benefits */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Star className="h-4 w-4 text-primary" />
            Quyền lợi hiện tại
          </h4>
          <div className="space-y-2">
            {currentTier.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Progress to Next Tier */}
        {nextTier && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Tiến độ lên hạng
              </h4>
              <span className="text-sm text-muted-foreground">
                {progressToNext.toFixed(0)}%
              </span>
            </div>
            
            <Progress value={progressToNext} className="h-3" />
            
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">
                Để lên hạng {nextTier.name}
              </p>
              <p className="font-semibold text-primary">
                Còn {remainingToNext.toLocaleString()} VNĐ
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Chi tiêu thêm trong tháng này
              </p>
            </div>
          </div>
        )}

        {/* All Tiers Overview */}
        <div className="space-y-3">
          <h4 className="font-medium">Tất cả hạng thành viên</h4>
          <div className="space-y-3">
            {tiers.map((tier, index) => (
              <div
                key={tier.name}
                className={`p-3 rounded-lg border ${
                  tier.name === memberData.tier
                    ? 'bg-primary/5 border-primary/20'
                    : 'bg-muted/30 border-muted'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{tier.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{tier.name}</span>
                      {tier.name === memberData.tier && (
                        <Badge variant="secondary" className="text-xs">
                          Hiện tại
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {tier.requirement}
                    </p>
                  </div>
                </div>
                
                <div className="mt-2 space-y-1">
                  {tier.benefits.map((benefit, benefitIndex) => (
                    <div key={benefitIndex} className="flex items-center gap-2 text-xs">
                      <Gift className="h-3 w-3 text-primary" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Spending */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Chi tiêu tháng này</p>
              <p className="font-semibold text-lg">
                {monthlySpent.toLocaleString()} VNĐ
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng chi tiêu</p>
              <p className="font-semibold text-lg">
                {(memberData.totalSpent || 5500000).toLocaleString()} VNĐ
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};