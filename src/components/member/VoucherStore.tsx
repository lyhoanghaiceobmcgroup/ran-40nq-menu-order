import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gift, Clock, MapPin, Star, CreditCard } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { MBPaymentModal } from "./MBPaymentModal";
import { supabase } from "@/integrations/supabase/client";

interface VoucherStoreProps {
  ranTokens: number;
  onVoucherPurchased: (cost: number) => void;
  userPhone: string;
}

interface Voucher {
  id: string;
  title: string;
  description: string;
  cost: number;
  value: string;
  condition: string;
  category: 'discount' | 'free' | 'combo' | 'birthday' | 'membership';
  validUntil?: string;
  usageLimit?: string;
  isSpecial?: boolean;
  isMembership?: boolean;
  sellPriceVnd?: number;
  rewardRan?: number;
}

interface PaymentIntent {
  id: string;
  amount: number;
  paymentContent: string;
  expiresAt: string;
  accountNumber: string;
  bankName: string;
}

interface VoucherProduct {
  name: string;
  description: string;
  rewardRan: number;
}

export const VoucherStore = ({ ranTokens, onVoucherPurchased, userPhone }: VoucherStoreProps) => {
  const [myVouchers, setMyVouchers] = useState<Voucher[]>([]);
  const [membershipVouchers, setMembershipVouchers] = useState<Voucher[]>([]);
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean;
    paymentIntent: PaymentIntent | null;
    voucher: VoucherProduct | null;
  }>({
    isOpen: false,
    paymentIntent: null,
    voucher: null
  });
  const [loading, setLoading] = useState(false);

  // Load membership vouchers from database
  useEffect(() => {
    const loadMembershipVouchers = async () => {
      try {
        const { data, error } = await supabase
          .from('voucher_products')
          .select('*')
          .eq('status', 'active');

        if (error) {
          console.error('Error loading vouchers:', error);
          return;
        }

        const membershipVoucherData = data.map(product => ({
          id: product.id,
          title: product.name,
          description: product.description || '',
          cost: 0, // Will be handled differently for membership vouchers
          value: `+${product.reward_ran.toLocaleString()} RAN`,
          condition: `Thanh toán ${product.sell_price_vnd.toLocaleString()} VNĐ qua ${product.payment_channel}`,
          category: 'membership' as const,
          isMembership: true,
          isSpecial: true,
          sellPriceVnd: product.sell_price_vnd,
          rewardRan: product.reward_ran
        }));

        setMembershipVouchers(membershipVoucherData);
      } catch (error) {
        console.error('Error loading membership vouchers:', error);
      }
    };

    loadMembershipVouchers();
  }, []);

  const availableVouchers: Voucher[] = [
    {
      id: "VIP799K",
      title: "VIP 799k",
      description: "Voucher VIP đặc biệt với nhiều ưu đãi hấp dẫn",
      cost: 1000000,
      value: "VIP Package",
      condition: "Mã: VIP799K + số điện thoại",
      category: 'membership',
      isSpecial: true,
      isMembership: true,
      sellPriceVnd: 799000,
      rewardRan: 0
    },
    {
      id: "V001",
      title: "Giảm 10.000 VNĐ",
      description: "Áp dụng cho tất cả đồ uống",
      cost: 10000,
      value: "10.000 VNĐ",
      condition: "Hóa đơn từ 100.000 VNĐ",
      category: 'discount'
    },
    {
      id: "V002",
      title: "Giảm 50.000 VNĐ",
      description: "Voucher giảm giá lớn",
      cost: 45000,
      value: "50.000 VNĐ",
      condition: "Hóa đơn từ 300.000 VNĐ",
      category: 'discount'
    },
    {
      id: "V003",
      title: "Tặng Signature Drink",
      description: "Một ly đồ uống đặc biệt miễn phí",
      cost: 35000,
      value: "1 ly miễn phí",
      condition: "Mỗi tài khoản 1 lần/tháng",
      category: 'free',
      isSpecial: true
    },
    {
      id: "V004",
      title: "Combo Lunch Ưu Đãi",
      description: "Combo đồ uống + bánh ngọt",
      cost: 70000,
      value: "Combo giá ưu đãi",
      condition: "Từ 11:00 - 14:00 hàng ngày",
      category: 'combo'
    },
    {
      id: "V005",
      title: "Sinh Nhật Đặc Biệt",
      description: "Giảm 50% toàn bộ hóa đơn",
      cost: 0,
      value: "50% OFF",
      condition: "Chỉ ngày sinh nhật",
      category: 'birthday',
      isSpecial: true
    }
  ];

  // Combine regular vouchers with membership vouchers
  const allAvailableVouchers = [...membershipVouchers, ...availableVouchers];

  const handlePurchaseVoucher = async (voucher: Voucher) => {
    // Handle VIP 799k voucher specially
    if (voucher.id === "VIP799K") {
      if (voucher.cost > ranTokens) {
        // If not enough RAN tokens, offer payment option
        toast({
          title: "Không đủ RAN Token",
          description: `Bạn cần ${voucher.cost.toLocaleString()} RAN Token. Bạn có thể mua voucher này bằng tiền mặt với giá ${voucher.sellPriceVnd?.toLocaleString()} VNĐ`,
          variant: "destructive"
        });
        await handleMembershipVoucherPurchase(voucher);
        return;
      }
      
      // Generate VIP code with phone number
      const vipCode = `VIP799K${userPhone}`;
      const voucherWithCode = {
        ...voucher,
        id: vipCode,
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN'), // 1 year validity
        purchaseDate: new Date().toLocaleDateString('vi-VN'),
        condition: `Mã voucher: ${vipCode}`
      };

      setMyVouchers(prev => [voucherWithCode, ...prev]);
      onVoucherPurchased(voucher.cost);

      toast({
        title: "Đổi voucher VIP thành công!",
        description: `Mã voucher của bạn: ${vipCode}`,
      });
      return;
    }

    // Handle other membership vouchers
    if (voucher.isMembership) {
      await handleMembershipVoucherPurchase(voucher);
      return;
    }

    if (voucher.cost > ranTokens) {
      toast({
        title: "Không đủ điểm",
        description: `Bạn cần ${voucher.cost.toLocaleString()} RAN Token để đổi voucher này`,
        variant: "destructive"
      });
      return;
    }

    if (voucher.cost === 0) {
      toast({
        title: "Voucher đặc biệt",
        description: "Voucher sinh nhật sẽ tự động kích hoạt vào ngày sinh của bạn",
      });
      return;
    }

    const voucherWithCode = {
      ...voucher,
      id: `${voucher.id}-${Date.now()}`,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN'),
      purchaseDate: new Date().toLocaleDateString('vi-VN')
    };

    setMyVouchers(prev => [voucherWithCode, ...prev]);
    onVoucherPurchased(voucher.cost);

    toast({
      title: "Đổi voucher thành công!",
      description: `Bạn đã nhận voucher "${voucher.title}"`,
    });
  };

  const handleMembershipVoucherPurchase = async (voucher: Voucher) => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await fetch('https://mrbupzghoxuzntenmazv.supabase.co/functions/v1/voucher-purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voucherId: voucher.id,
          userPhone: userPhone
        })
      });

      const data = await response.json();

      if (data.success) {
        setPaymentModal({
          isOpen: true,
          paymentIntent: data.paymentIntent,
          voucher: data.voucher
        });
        sonnerToast.success("Đã tạo yêu cầu thanh toán! Vui lòng chuyển khoản để hoàn tất.");
      } else {
        sonnerToast.error("Không thể tạo yêu cầu thanh toán. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error('Purchase error:', error);
      sonnerToast.error("Lỗi khi tạo yêu cầu thanh toán. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (rewardRan: number) => {
    // Update the parent component with the new RAN balance
    // The actual balance will be updated from the backend
    sonnerToast.success(`Chúc mừng! Bạn đã nhận ${rewardRan.toLocaleString()} RAN.`);
    
    // Trigger a refresh of the user's balance
    if (onVoucherPurchased) {
      // This is a bit of a hack - we're using negative cost to indicate RAN was added
      onVoucherPurchased(-rewardRan);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'discount':
        return "💰";
      case 'free':
        return "🎁";
      case 'combo':
        return "🍽️";
      case 'birthday':
        return "🎂";
      case 'membership':
        return "👑";
      default:
        return "🎫";
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'discount':
        return "Giảm giá";
      case 'free':
        return "Miễn phí";
      case 'combo':
        return "Combo";
      case 'birthday':
        return "Sinh nhật";
      case 'membership':
        return "Hội viên";
      default:
        return "Khác";
    }
  };

  const categories = ['membership', 'discount', 'free', 'combo', 'birthday'];

  return (
    <Card className="card-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-primary" />
          Kho Voucher
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="available" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="available">Có thể đổi</TabsTrigger>
            <TabsTrigger value="my-vouchers">
              Voucher của tôi ({myVouchers.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="available" className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {categories.map(category => (
                <Badge key={category} variant="outline">
                  {getCategoryIcon(category)} {getCategoryName(category)}
                </Badge>
              ))}
            </div>
            
            <div className="grid gap-4">
              {allAvailableVouchers.map((voucher) => (
                <div key={voucher.id} className={`p-4 border rounded-lg ${voucher.isSpecial ? 'bg-gradient-subtle border-primary/20' : 'bg-card'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{getCategoryIcon(voucher.category)}</span>
                      <div>
                        <h4 className="font-semibold flex items-center gap-2">
                          {voucher.title}
                          {voucher.isSpecial && <Star className="h-4 w-4 text-warning fill-warning" />}
                        </h4>
                        <p className="text-sm text-muted-foreground">{voucher.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      {voucher.id === "VIP799K" ? (
                        <>
                          <Badge variant="outline" className="text-xs">
                            {voucher.cost.toLocaleString()} RAN
                          </Badge>
                          <Badge variant="default" className="text-xs">
                            {voucher.sellPriceVnd?.toLocaleString()} VNĐ
                          </Badge>
                        </>
                      ) : (
                        <Badge variant={voucher.isMembership ? "default" : voucher.cost === 0 ? "secondary" : "outline"}>
                          {voucher.isMembership ? `${voucher.sellPriceVnd?.toLocaleString()} VNĐ` : 
                           voucher.cost === 0 ? "Miễn phí" : `${voucher.cost.toLocaleString()} RAN`}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Gift className="h-4 w-4 text-primary" />
                      <span>Giá trị: {voucher.value}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{voucher.condition}</span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handlePurchaseVoucher(voucher)}
                    disabled={(voucher.cost > ranTokens && voucher.cost > 0 && !voucher.isMembership && voucher.id !== "VIP799K") || loading}
                    className="w-full"
                    variant={voucher.isMembership ? "default" : voucher.cost === 0 ? "secondary" : "default"}
                  >
                    {loading && voucher.isMembership ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Đang xử lý...
                      </>
                    ) : voucher.id === "VIP799K" ? (
                      voucher.cost <= ranTokens ? (
                        <>
                          👑 Đổi bằng RAN Token
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Mua bằng tiền mặt
                        </>
                      )
                    ) : voucher.isMembership ? (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Đổi ngay
                      </>
                    ) : voucher.cost === 0 ? "Kích hoạt tự động" : 
                     voucher.cost > ranTokens ? "Không đủ điểm" : "Đổi ngay"}
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="my-vouchers" className="space-y-4">
            {myVouchers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Gift className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Bạn chưa có voucher nào</p>
                <p className="text-sm">Đổi điểm để nhận voucher ưu đãi!</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {myVouchers.map((voucher) => (
                  <div key={voucher.id} className="p-4 border rounded-lg bg-success/5 border-success/20">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{getCategoryIcon(voucher.category)}</span>
                        <div>
                          <h4 className="font-semibold">{voucher.title}</h4>
                          <p className="text-sm text-muted-foreground">{voucher.description}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-success/10 text-success">
                        Có thể dùng
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Gift className="h-4 w-4 text-success" />
                        <span>Giá trị: {voucher.value}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Hết hạn: {voucher.validUntil}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>Mã: {voucher.id}</span>
                      </div>
                    </div>
                    
                    <Button variant="outline" className="w-full">
                      Sử dụng tại quầy
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Payment Modal */}
        <MBPaymentModal
          isOpen={paymentModal.isOpen}
          onClose={() => setPaymentModal({ isOpen: false, paymentIntent: null, voucher: null })}
          paymentIntent={paymentModal.paymentIntent}
          voucher={paymentModal.voucher}
          userPhone={userPhone}
          onSuccess={handlePaymentSuccess}
        />
      </CardContent>
    </Card>
  );
};