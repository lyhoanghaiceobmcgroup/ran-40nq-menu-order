import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Facebook, Instagram, MessageCircle, Heart } from "lucide-react";
export const Footer = () => {
  return <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center">
                <span className="text-primary font-bold text-sm">R</span>
              </div>
              <span className="text-xl font-bold">
                Ran<span className="text-accent">Menu</span>
              </span>
            </div>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Hệ thống menu điện tử hiện đại với tích hợp loyalty program, 
              mang đến trải nghiệm ẩm thực đẳng cấp cho khách hàng.
            </p>
            <div className="flex space-x-3">
              <Button size="sm" variant="ghost" className="text-primary-foreground/80 hover:text-accent">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" className="text-primary-foreground/80 hover:text-accent">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" className="text-primary-foreground/80 hover:text-accent">
                <MessageCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Tính Năng */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-accent">Tính Năng</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  Menu Điện Tử
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  Theo Dõi Đơn Hàng
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  Hệ Thống Ran Token
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  Phân Hạng Thành Viên
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  Gợi Ý AI
                </a>
              </li>
            </ul>
          </div>

          {/* Hỗ Trợ */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-accent">Hỗ Trợ</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  Hướng Dẫn Sử Dụng
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  Câu Hỏi Thường Gặp
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  Chính Sách Bảo Mật
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  Điều Khoản Sử Dụng
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  Liên Hệ
                </a>
              </li>
            </ul>
          </div>

          {/* Liên Hệ */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-accent">Liên Hệ</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-accent flex-shrink-0" />
                <span className="text-primary-foreground/80">056 981 0000</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-accent flex-shrink-0" />
                <span className="text-primary-foreground/80">ranmixology@gmail.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-primary-foreground/80">
                  RAN 40 Ngô Quyền, Cửa Nam, Hà Nội
                </span>
              </div>
            </div>

            <div className="pt-4">
              <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                <MessageCircle className="h-4 w-4 mr-2" />
                Chat Hỗ Trợ
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-primary-foreground/20 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-primary-foreground/60 text-sm">© 2025 RanMenu. Tất cả quyền được bảo lưu.</p>
            <p className="text-primary-foreground/60 text-sm flex items-center mt-2 md:mt-0">
              Thuộc hệ thống chuỗi RAN MIXOLOGY
            </p>
          </div>
        </div>
      </div>
    </footer>;
};