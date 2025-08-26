import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { MenuNavigation } from "@/components/menu/MenuNavigation";
import { DrinkSection } from "@/components/menu/DrinkSection";
import { CartModal } from "@/components/menu/CartModal";
import { OrderTimeline } from "@/components/menu/OrderTimeline";
import { CartButton } from "@/components/menu/CartButton";
import { FeedbackModal } from "@/components/menu/FeedbackModal";

// Mock drink data
const drinkCategories = [
  {
    id: "signature",
    name: "Signature Drinks",
    description: "Đặc sản quán – pha chế độc quyền",
    drinks: [
      {
        id: "ran-special",
        name: "Ran Special Mixology",
        description: "Hương vị độc quyền với 5 tầng hương vị",
        ingredients: "Whiskey, Mật ong, Chanh leo, Thảo mộc",
        volume: "350ml",
        prepTime: 180,
        price: 180000,
        image: "ran-special-mixology"
      },
      {
        id: "golden-sunset",
        name: "Golden Sunset",
        description: "Cocktail hoàng hôn với màu sắc lấp lánh",
        ingredients: "Rum, Cam tươi, Grenadine, Bạc hà",
        volume: "320ml",
        prepTime: 150,
        price: 160000,
        image: "golden-sunset"
      }
    ]
  },
  {
    id: "coffee",
    name: "Cà phê",
    description: "Cà phê truyền thống & hiện đại",
    drinks: [
      {
        id: "espresso",
        name: "Espresso Ý",
        description: "Cà phê nguyên chất, đậm đà",
        ingredients: "Cà phê Arabica rang vừa",
        volume: "30ml",
        prepTime: 60,
        price: 45000,
        image: "espresso"
      },
      {
        id: "cappuccino",
        name: "Cappuccino",
        description: "Cà phê sữa bọt mịn truyền thống",
        ingredients: "Espresso, sữa tươi, bọt sữa",
        volume: "180ml",
        prepTime: 120,
        price: 65000,
        image: "cafe-sua-da"
      }
    ]
  },
  {
    id: "tea",
    name: "Trà",
    description: "Trà hoa, trà trái cây, trà lạnh",
    drinks: [
      {
        id: "jasmine-tea",
        name: "Trà Hoa Nhài",
        description: "Hương thơm dịu nhẹ, thanh mát",
        ingredients: "Trà xanh, hoa nhài tươi",
        volume: "300ml",
        prepTime: 90,
        price: 55000,
        image: "tra-lai"
      }
    ]
  },
  {
    id: "milk",
    name: "Sữa / Milk Based",
    description: "Matcha, Socola, Latte",
    drinks: [
      {
        id: "matcha-latte",
        name: "Matcha Latte",
        description: "Bột trà xanh Nhật Bản cao cấp",
        ingredients: "Matcha nguyên chất, sữa tươi, kem",
        volume: "350ml",
        prepTime: 120,
        price: 75000,
        image: "matcha-latte"
      }
    ]
  },
  {
    id: "juice",
    name: "Nước ép",
    description: "Hoa quả nguyên chất",
    drinks: [
      {
        id: "orange-juice",
        name: "Nước Cam Tươi",
        description: "Cam Sành Hòa Bình tươi ngon",
        ingredients: "Cam tươi 100%",
        volume: "400ml",
        prepTime: 60,
        price: 50000,
        image: "tra-chanh-leo"
      }
    ]
  },
  {
    id: "seasonal",
    name: "Đặc biệt theo mùa",
    description: "Giới hạn – theo mùa, trend",
    drinks: [
      {
        id: "winter-special",
        name: "Winter Spice",
        description: "Ấm áp mùa đông với gia vị",
        ingredients: "Quế, gừng, mật ong, sữa nóng",
        volume: "350ml",
        prepTime: 150,
        price: 85000,
        image: "smoothie-xoai"
      }
    ]
  }
];

export interface CartItem {
  id: string;
  name: string;
  price: number;
  ice: string;
  sugar: string;
  quantity: number;
  prepTime: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed';
  paymentMethod: 'cash' | 'transfer';
  createdAt: Date;
  estimatedTime: number;
}

const Menu = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const tableNumber = searchParams.get('table') || '1';
  const userName = searchParams.get('user') || 'Khách hàng';
  const userPhone = searchParams.get('phone') || '';

  const [activeSection, setActiveSection] = useState("signature");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  // Check if user is properly authenticated
  useEffect(() => {
    if (!userName || userName === 'Khách hàng' || !userPhone) {
      toast({
        title: "Truy cập không hợp lệ",
        description: "Vui lòng đăng ký từ trang chủ để truy cập menu",
        variant: "destructive"
      });
      // Redirect back to home after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);
      return;
    }

    // Check localStorage for user data
    const userData = localStorage.getItem('user_data');
    if (!userData) {
      toast({
        title: "Phiên đã hết hạn",
        description: "Vui lòng đăng ký lại",
        variant: "destructive"
      });
      setTimeout(() => {
        navigate('/');
      }, 2000);
      return;
    }
  }, [userName, userPhone, navigate]);

  // Handle scroll to update active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = Object.entries(sectionRefs.current);
      let currentSection = activeSection;

      for (const [id, element] of sections) {
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 200) {
            currentSection = id;
            break;
          }
        }
      }

      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSection]);

  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current[sectionId];
    if (element) {
      const offset = 120; // Account for sticky header
      const elementPosition = element.offsetTop - offset;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  const addToCart = (drink: any, ice: string, sugar: string) => {
    const existingItem = cart.find(
      item => item.id === drink.id && item.ice === ice && item.sugar === sugar
    );

    if (existingItem) {
      setCart(cart.map(item =>
        item.id === drink.id && item.ice === ice && item.sugar === sugar
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      const newItem: CartItem = {
        id: drink.id,
        name: drink.name,
        price: drink.price,
        ice,
        sugar,
        quantity: 1,
        prepTime: drink.prepTime
      };
      setCart([...cart, newItem]);
    }

    // Use sonner toast for cart notifications - shorter, less intrusive
    sonnerToast.success("Đã thêm vào giỏ", {
      description: `${drink.name} - ${ice} đá, ${sugar} đường`,
      duration: 2000, // 2 seconds instead of default 5
      position: "bottom-right", // Position in corner to not block cart
    });
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const updateCartQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }
    
    setCart(cart.map((item, i) => 
      i === index ? { ...item, quantity } : item
    ));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalTime = () => {
    return Math.max(...cart.map(item => item.prepTime), 240); // Minimum 4 minutes
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({
        title: "Giỏ hàng trống",
        description: "Vui lòng chọn món trước khi thanh toán",
        variant: "destructive"
      });
      return;
    }
    setShowCart(true);
  };

  const handleBackToMenu = () => {
    setShowCart(false);
  };


  const handleLogout = () => {
    setShowFeedback(true);
  };

  const handleFeedbackClose = () => {
    setShowFeedback(false);
    // Navigate to home after feedback modal closes
    navigate('/');
  };

  // Add beforeunload event listener for feedback
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Bạn có muốn để lại đánh giá trước khi rời trang?';
      setShowFeedback(true);
      return 'Bạn có muốn để lại đánh giá trước khi rời trang?';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  if (!userName || userName === 'Khách hàng' || !userPhone) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Đang kiểm tra thông tin...</p>
          <p className="text-sm text-muted-foreground mt-2">Nếu bạn chưa đăng ký, sẽ tự động chuyển về trang chủ</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">RanMenu</h1>
              <p className="text-sm text-muted-foreground">
                Bàn {tableNumber} • {userName}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleLogout}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Đăng xuất
              </button>
              <button
                onClick={() => navigate('/member')}
                className="px-3 py-1.5 text-sm bg-primary/10 text-primary hover:bg-primary/20 rounded-md transition-colors"
              >
                👤 Thông tin tài khoản
              </button>
              <button
                onClick={() => navigate('/about')}
                className="px-3 py-1.5 text-sm bg-secondary/10 text-secondary-foreground hover:bg-secondary/20 rounded-md transition-colors"
              >
                ℹ️ Tìm hiểu thêm
              </button>
              <CartButton 
                itemCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
                onCheckout={handleCheckout}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <MenuNavigation 
        categories={drinkCategories}
        activeSection={activeSection}
        onSectionClick={scrollToSection}
      />

      {/* Menu Content */}
      <div className="container mx-auto px-4 pb-20">
        {drinkCategories.map((category) => (
          <DrinkSection
            key={category.id}
            category={category}
            onAddToCart={addToCart}
            ref={(el) => { sectionRefs.current[category.id] = el; }}
          />
        ))}
      </div>

      {/* Cart Modal */}
      <CartModal
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        cart={cart}
        onRemoveItem={removeFromCart}
        onUpdateQuantity={updateCartQuantity}
        onBackToMenu={handleBackToMenu}
        userPhone={userPhone}
        userName={userName}
        tableNumber={tableNumber}
      />

      {/* Order Timeline */}
      {currentOrder && (
        <OrderTimeline
          order={currentOrder}
          onOrderUpdate={setCurrentOrder}
        />
      )}

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedback}
        onClose={handleFeedbackClose}
        userName={userName}
        userPhone={userPhone}
      />
    </div>
  );
};

export default Menu;
