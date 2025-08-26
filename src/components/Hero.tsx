import { Button } from "@/components/ui/button";
import { QrCode, Sparkles, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";
interface HeroProps {
  onGetStarted: () => void;
  isLoggedIn?: boolean;
}
export const Hero = ({
  onGetStarted,
  isLoggedIn = false
}: HeroProps) => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{
        backgroundImage: `url(${heroImage})`
      }}>
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-3 sm:px-4 max-w-4xl mx-auto">
        <div className="slide-up">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-accent mr-2 sm:mr-3" />
            <span className="text-accent font-semibold text-sm sm:text-lg">RAN Mixology Menu Điện Tử</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
            Trải Nghiệm Ẩm Thực
            <span className="block gold-gradient bg-clip-text text-transparent">
              Đẳng Cấp Mới
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 text-gray-200 max-w-2xl mx-auto leading-relaxed">
            Quét QR, gọi món thông minh và tích lũy điểm thưởng.
          </p>
        </div>

        <div className="scale-in space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-6 sm:mb-8">
            <Button 
              onClick={onGetStarted} 
              size="lg" 
              className="premium-gradient text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg hover-float border-none w-full sm:w-auto"
            >
              <QrCode className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              {isLoggedIn ? "Order Menu" : "Đăng nhập & Order"}
            </Button>
            
            <Link to="/about" className="w-full sm:w-auto">
              <Button 
                variant="outline" 
                size="lg" 
                className="bg-white/10 border-white/30 text-white backdrop-blur-sm hover:bg-white/20 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg hover-float w-full"
              >
                <Trophy className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Tìm Hiểu Thêm
              </Button>
            </Link>

            {isLoggedIn && (
              <Link to="/member" className="w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="bg-white/10 border-white/30 text-white backdrop-blur-sm hover:bg-white/20 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg hover-float w-full"
                >
                  <Trophy className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Thành Viên
                </Button>
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto mt-8 sm:mt-12">
            <div className="glass-effect rounded-xl p-4 sm:p-6 text-center hover-float">
              <QrCode className="h-10 w-10 sm:h-12 sm:w-12 text-accent mx-auto mb-3 sm:mb-4" />
              <h3 className="font-semibold text-base sm:text-lg mb-2">Quét & Gọi Món</h3>
              <p className="text-gray-300 text-xs sm:text-sm">Quét QR tại bàn để truy cập menu và gọi món ngay lập tức</p>
            </div>
            
            <div className="glass-effect rounded-xl p-4 sm:p-6 text-center hover-float">
              <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 text-accent mx-auto mb-3 sm:mb-4" />
              <h3 className="font-semibold text-base sm:text-lg mb-2">Theo Dõi Realtime</h3>
              <p className="text-gray-300 text-xs sm:text-sm">Theo dõi trạng thái món ăn từ bếp đến bàn trong thời gian thực</p>
            </div>
            
            <div className="glass-effect rounded-xl p-4 sm:p-6 text-center hover-float">
              <Trophy className="h-10 w-10 sm:h-12 sm:w-12 text-accent mx-auto mb-3 sm:mb-4" />
              <h3 className="font-semibold text-base sm:text-lg mb-2">Tích Điểm Ran</h3>
              <p className="text-gray-300 text-xs sm:text-sm">Nhận 10% hóa đơn thành Ran Token để đổi ưu đãi hấp dẫn</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};