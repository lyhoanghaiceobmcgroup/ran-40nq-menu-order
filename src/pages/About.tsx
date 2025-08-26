import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { Features } from "@/components/Features";
import { MapPin, Clock, Phone, ExternalLink, Coffee, Leaf, Zap, Heart, Award, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import aboutCafeInterior from "@/assets/about-cafe-interior.jpg";
import aboutTeaBrewing from "@/assets/about-tea-brewing.jpg";
import aboutCoffeeArt from "@/assets/about-coffee-art.jpg";
export default function About() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [ranTokens, setRanTokens] = useState(0);
  useEffect(() => {
    const data = localStorage.getItem('user_data');
    if (data) {
      try {
        const u = JSON.parse(data);
        setIsLoggedIn(!!u.name);
        setUserName(u.name || "");
        setUserPhone(u.phone || "");
        setRanTokens(u.tokens || 0);
      } catch {}
    }
  }, []);
  const handleLogin = () => {
    navigate('/');
  };
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName("");
    setUserPhone("");
    setRanTokens(0);
    localStorage.removeItem('user_data');
    toast({
      title: "Đăng xuất thành công",
      description: "Hẹn gặp lại bạn lần sau!"
    });
    navigate('/');
  };
  const handleOrderMenu = () => {
    if (userName && userPhone) {
      const tableNumber = Math.floor(Math.random() * 20) + 1;
      navigate(`/menu?table=${tableNumber}&user=${encodeURIComponent(userName)}&phone=${encodeURIComponent(userPhone)}`);
    } else {
      navigate('/');
    }
  };
  const ranValues = [{
    letter: "R",
    title: "Refined",
    description: "Chắt lọc giá trị trong từng món uống, từng chi tiết phục vụ."
  }, {
    letter: "A",
    title: "Authentic",
    description: "Đậm chất riêng, mang bản sắc của gu Việt hiện đại."
  }, {
    letter: "N",
    title: "New-age",
    description: "Tích hợp công nghệ, trải nghiệm digital và tiện ích thông minh."
  }];
  const menuHighlights = [{
    icon: Coffee,
    title: "Cà phê rang xay",
    description: "Signature, espresso, latte, café trứng"
  }, {
    icon: Leaf,
    title: "Trà thủ công",
    description: "Trà hoa, trà trái cây, cold brew"
  }, {
    icon: Award,
    title: "Đồ uống theo mùa",
    description: "RAN Seasonal, Detox & Lifestyle drinks"
  }];
  const spaceFeatures = [{
    icon: Zap,
    title: "Thiết kế tối giản",
    description: "Phong cách Nhật – Bắc Âu, ánh sáng trầm ấm"
  }, {
    icon: Users,
    title: "Không gian linh hoạt",
    description: "Bàn làm việc cá nhân & góc họp nhóm"
  }, {
    icon: Heart,
    title: "Kết nối công nghệ",
    description: "Wifi tốc độ cao – QR menu – Loyalty App"
  }];
  return <div className="min-h-screen bg-background pt-14 sm:pt-16">
      <Header isLoggedIn={isLoggedIn} userName={userName} ranTokens={ranTokens} onLogin={handleLogin} onLogout={handleLogout} />

      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img src={aboutCafeInterior} alt="RAN Cafe Interior" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
        </div>
        
        <div className="relative container mx-auto px-3 sm:px-4 text-center text-white">
          <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white drop-shadow-lg">RAN</h1>
              <p className="text-lg sm:text-xl md:text-2xl font-medium text-amber-200">
                TRẠM DỪNG VỊ GIÁC
              </p>
              <Badge variant="outline" className="text-xs sm:text-sm border-white/30 text-white bg-white/10 backdrop-blur-sm">
                Tea – Coffee – Digital Lifestyle
              </Badge>
            </div>
            
            <p className="text-sm sm:text-lg leading-relaxed text-gray-100">
              RAN – Trạm dừng vị giác là nơi hội tụ tinh thần thưởng thức, sự chỉn chu trong từng giọt trà, 
              từng lớp foam café, cùng trải nghiệm công nghệ hiện đại trong từng cú chạm.
            </p>
            
            <p className="text-sm sm:text-lg leading-relaxed text-gray-100">
              Tại RAN, chúng tôi không chỉ phục vụ đồ uống, mà còn truyền cảm hứng về lối sống tinh tế – 
              kết nối – và thẩm mỹ.
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
              <Button className="premium-gradient text-white w-full sm:w-auto" onClick={handleOrderMenu}>
                Order & Menu
              </Button>
              <Link to="/" className="w-full sm:w-auto">
                <Button variant="outline" className="bg-white/10 border-white/30 text-white backdrop-blur-sm hover:bg-white/20 w-full">
                  Trang chủ
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* RAN Values */}
      <section className="py-12 sm:py-16 bg-muted/20">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">RAN là gì?</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {ranValues.map((value, index) => <Card key={index} className="text-center border-border bg-card/50 backdrop-blur-sm hover-float">
                <CardHeader className="pb-3">
                  <div className="mx-auto mb-3 sm:mb-4 w-14 h-14 sm:w-16 sm:h-16 rounded-full premium-gradient flex items-center justify-center">
                    <span className="text-xl sm:text-2xl font-bold text-white">{value.letter}</span>
                  </div>
                  <CardTitle className="text-lg sm:text-xl">{value.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm sm:text-base text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Menu & Space */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Sản phẩm & không gian</h2>
            <p className="text-sm sm:text-lg text-muted-foreground max-w-3xl mx-auto">
              RAN được thiết kế như một hệ sinh thái vị giác thông minh – nơi mọi người tìm đến để thư giãn, 
              làm việc, gặp gỡ hoặc đơn giản là "dừng lại một nhịp" giữa dòng đời bận rộn.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 mb-12 sm:mb-16">
            {/* Menu Section */}
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                🍵 MENU ĐẶC SẮC
              </h3>
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                {menuHighlights.map((item, index) => <Card key={index} className="border-border bg-card/30">
                    <CardContent className="p-3 sm:p-4 flex items-start gap-3 sm:gap-4">
                      <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                        <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm sm:text-base text-foreground">{item.title}</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </CardContent>
                  </Card>)}
              </div>
              <div className="relative rounded-lg overflow-hidden shadow-lg">
                <img src={aboutTeaBrewing} alt="Premium Tea Brewing" className="w-full h-40 sm:h-48 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 text-white">
                  <p className="text-xs sm:text-sm font-medium">Nghệ thuật pha trà thủ công</p>
                </div>
              </div>
            </div>

            {/* Space Section */}
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                🛋️ KHÔNG GIAN & PHONG CÁCH
              </h3>
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                {spaceFeatures.map((item, index) => <Card key={index} className="border-border bg-card/30">
                    <CardContent className="p-3 sm:p-4 flex items-start gap-3 sm:gap-4">
                      <div className="p-2 rounded-lg bg-accent/20 flex-shrink-0">
                        <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-accent-foreground" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm sm:text-base text-foreground">{item.title}</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </CardContent>
                  </Card>)}
              </div>
              <div className="relative rounded-lg overflow-hidden shadow-lg">
                <img src={aboutCoffeeArt} alt="Premium Coffee Art" className="w-full h-40 sm:h-48 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 text-white">
                  <p className="text-xs sm:text-sm font-medium">Latte art chuyên nghiệp</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location & Contact */}
      <section className="py-12 sm:py-16 bg-muted/20">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Khám phá hệ sinh thái RAN</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {/* Main Location */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  Địa chỉ chính
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <p className="font-semibold text-sm sm:text-base text-foreground">
                    ❤️ RAN – Trạm dừng vị giác
                  </p>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    📍 40 Ngô Quyền, Hà Nội
                  </p>
                </div>
                
                <div className="flex items-center gap-2 text-sm sm:text-base text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>🕘 Mở cửa: 7:00 – 23:00 hàng ngày</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm sm:text-base text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>📞 Hotline: 056 981 0000</span>
                </div>
                
                <p className="text-xs sm:text-sm text-muted-foreground">
                  📲 QR menu / gọi đồ ngay tại bàn – tích điểm thành viên
                </p>
              </CardContent>
            </Card>

            {/* Online Links */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <ExternalLink className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  Kết nối trực tuyến
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-foreground mb-1">
                      ✨ Trang chủ chính thức:
                    </p>
                    <Button variant="outline" size="sm" className="w-full justify-start text-xs sm:text-sm">
                      👉 www.ranmixology.com
                    </Button>
                  </div>
                  
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-foreground mb-1">
                      🏢 Chuỗi cửa hàng & thương hiệu:
                    </p>
                    <Button variant="outline" size="sm" className="w-full justify-start text-xs sm:text-sm">
                      👉 www.ranmixology.com/thuonghieu
                    </Button>
                  </div>
                </div>
                
                <div className="pt-3 sm:pt-4 border-t border-border">
                  <p className="text-xs sm:text-sm text-center text-muted-foreground">
                    ✅ Trải nghiệm RAN – Không chỉ là đồ uống,<br />
                    mà là một hành trình vị giác số hóa!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-6 sm:mt-8">
            <p className="text-sm sm:text-base text-muted-foreground mb-4">
              Hãy đăng ký tài khoản để tích lũy Ran Token – đổi ưu đãi – và đón nhận các trải nghiệm 
              cá nhân hóa tại hệ thống RAN toàn quốc.
            </p>
            <Link to="/">
              <Button className="premium-gradient text-white">
                🎯 Đăng ký ngay
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <Features />
    </div>;
}