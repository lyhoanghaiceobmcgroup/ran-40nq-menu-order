import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import bannerSlide1 from "@/assets/banner-slide-1.jpg";
import bannerSlide2 from "@/assets/banner-slide-2.jpg";
import bannerSlide3 from "@/assets/banner-slide-3.jpg";

const slides = [
  {
    id: 1,
    image: bannerSlide1,
    title: "Trà & Cà Phê Đặc Sản",
    subtitle: "Hương vị Việt hiện đại",
    description: "Từ café sữa đá truyền thống đến trà trái cây sáng tạo, mỗi ly đều mang đậm bản sắc RAN"
  },
  {
    id: 2,
    image: bannerSlide2,
    title: "Nghệ Thuật Pha Chế",
    subtitle: "Chất lượng premium",
    description: "Barista chuyên nghiệp với kỹ thuật latte art tinh tế, tạo nên những tác phẩm vị giác độc đáo"
  },
  {
    id: 3,
    image: bannerSlide3,
    title: "Thức Uống Theo Mùa",
    subtitle: "Tươi mới mỗi ngày",
    description: "Smoothie trái cây tươi và các đồ uống healthy, bổ sung năng lượng cho cuộc sống năng động"
  }
];

export const FBannerCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 premium-gradient bg-clip-text text-transparent">
            F&B Đặc Sắc RAN
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Khám phá hành trình vị giác với thực đơn đa dạng từ truyền thống đến hiện đại
          </p>
        </div>

        <div className="relative max-w-6xl mx-auto">
          {/* Main Carousel */}
          <div className="relative overflow-hidden rounded-2xl shadow-2xl">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map((slide) => (
                <div key={slide.id} className="w-full flex-shrink-0 relative">
                  <div className="aspect-[16/9] relative">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
                    
                    {/* Content Overlay */}
                    <div className="absolute inset-0 flex items-center">
                      <div className="container mx-auto px-4">
                        <div className="max-w-2xl text-white space-y-4">
                          <h3 className="text-4xl md:text-5xl font-bold">
                            {slide.title}
                          </h3>
                          <p className="text-xl md:text-2xl font-medium text-amber-200">
                            {slide.subtitle}
                          </p>
                          <p className="text-lg text-gray-200 leading-relaxed">
                            {slide.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <Button
              variant="outline"
              size="icon"
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center space-x-2 mt-6">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'bg-primary scale-125'
                    : 'bg-muted hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};