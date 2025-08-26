import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Smartphone, 
  Clock, 
  Gift, 
  Shield, 
  Zap, 
  Users,
  Star,
  Bell,
  CreditCard
} from "lucide-react";
import qrScanImage from "@/assets/qr-scan.jpg";
import rewardsImage from "@/assets/rewards.jpg";

export const Features = () => {
  const features = [
    {
      icon: Smartphone,
      title: "Menu Điện Tử Thông Minh",
      description: "Giao diện đẹp mắt, dễ sử dụng với hình ảnh món ăn chất lượng cao"
    },
    {
      icon: Clock,
      title: "Theo Dõi Đơn Hàng Realtime",
      description: "Cập nhật trạng thái món từ bếp đến bàn trong thời gian thực"
    },
    {
      icon: Gift,
      title: "Hệ Thống Ran Token",
      description: "Nhận 10% giá trị hóa đơn thành điểm thưởng để đổi ưu đãi"
    },
    {
      icon: Shield,
      title: "Kiểm Soát Truy Cập",
      description: "Chỉ cho phép khách đã đăng ký mới có thể xem menu và gọi món"
    },
    {
      icon: Zap,
      title: "Thông Báo Tức Thì",
      description: "Nhận thông báo qua Zalo, Telegram khi món ăn sẵn sàng"
    },
    {
      icon: Users,
      title: "Phân Hạng Thành Viên",
      description: "Hệ thống VIP từ Đồng đến Kim Cương với quyền lợi riêng"
    },
    {
      icon: Star,
      title: "Gợi Ý AI Thông Minh",
      description: "Đề xuất món ăn phù hợp dựa trên sở thích và lịch sử"
    },
    {
      icon: Bell,
      title: "Quản Lý Thay Đổi",
      description: "Hủy/đổi món dễ dàng với thông báo nhân viên tức thì"
    },
    {
      icon: CreditCard,
      title: "Thanh Toán Linh Hoạt",
      description: "Hỗ trợ nhiều hình thức thanh toán, tích hợp với POS"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 premium-gradient bg-clip-text text-transparent">
            Tính Năng Đột Phá
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hệ thống F&B toàn diện với công nghệ hiện đại, mang đến trải nghiệm ẩm thực đẳng cấp
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="hover-float border-border bg-card/50 backdrop-blur-sm"
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl text-foreground">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-foreground">
                Quy Trình Đặt Món Thông Minh
              </h3>
              <p className="text-muted-foreground text-lg">
                Từ việc quét QR code đến nhận món ăn, mọi bước đều được tối ưu hóa để mang lại trải nghiệm tuyệt vời nhất.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full premium-gradient flex items-center justify-center text-white font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Quét QR & Đăng Ký</h4>
                  <p className="text-muted-foreground">Quét mã QR tại bàn và đăng ký thông tin nhanh chóng</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full premium-gradient flex items-center justify-center text-white font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Duyệt Menu & Gọi Món</h4>
                  <p className="text-muted-foreground">Xem menu với hình ảnh đẹp và gọi món theo sở thích</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full premium-gradient flex items-center justify-center text-white font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Theo Dõi & Nhận Điểm</h4>
                  <p className="text-muted-foreground">Theo dõi tiến độ món ăn và nhận Ran Token sau khi hoàn thành</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <img 
              src={qrScanImage} 
              alt="QR Code Scanning" 
              className="rounded-2xl shadow-2xl hover-float"
            />
          </div>
        </div>

        {/* Rewards Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-20">
          <div className="relative lg:order-1">
            <img 
              src={rewardsImage} 
              alt="Rewards System" 
              className="rounded-2xl shadow-2xl hover-float"
            />
          </div>
          
          <div className="space-y-6 lg:order-2">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-foreground">
                Hệ Thống Thưởng Ran Token
              </h3>
              <p className="text-muted-foreground text-lg">
                Tích lũy điểm thưởng với mỗi giao dịch và tận hưởng những ưu đãi độc quyền dành riêng cho thành viên.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 border border-accent/20 rounded-lg bg-accent/5">
                <h4 className="font-semibold text-foreground mb-2">🥉 Hạng Đồng</h4>
                <p className="text-muted-foreground text-sm">&lt; 5 lượt/tháng • Ưu đãi cơ bản</p>
              </div>
              
              <div className="p-4 border border-accent/30 rounded-lg bg-accent/10">
                <h4 className="font-semibold text-foreground mb-2">🥈 Hạng Bạc</h4>
                <p className="text-muted-foreground text-sm">5-10 lượt/tháng • Giảm giá đặc biệt</p>
              </div>
              
              <div className="p-4 border border-accent/40 rounded-lg bg-accent/15">
                <h4 className="font-semibold text-foreground mb-2">🥇 Hạng Vàng</h4>
                <p className="text-muted-foreground text-sm">10-20 lượt/tháng • Ưu tiên bàn đẹp</p>
              </div>
              
              <div className="p-4 border border-accent rounded-lg bg-accent/20">
                <h4 className="font-semibold text-foreground mb-2">💎 Hạng Kim Cương</h4>
                <p className="text-muted-foreground text-sm">&gt; 20 lượt/tháng • Quyền lợi VIP độc quyền</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};