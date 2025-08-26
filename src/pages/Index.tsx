
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { FBannerCarousel } from "@/components/FBannerCarousel";
import { Footer } from "@/components/Footer";
import { RegistrationModal } from "@/components/RegistrationModal";
import { sendUserLoginToTelegram } from "@/services/telegramService";

const Index = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [ranTokens, setRanTokens] = useState(0);
  const [showRegistration, setShowRegistration] = useState(false);

  const handleLogin = () => {
    setShowRegistration(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName("");
    setUserPhone("");
    setRanTokens(0);
    // Clear localStorage
    localStorage.removeItem('user_data');
    toast({
      title: "Đăng xuất thành công",
      description: "Hẹn gặp lại bạn lần sau!",
    });
  };

  const handleRegister = async (name: string, phone: string) => {
    setIsLoggedIn(true);
    setUserName(name);
    setUserPhone(phone);
    setRanTokens(500); // Welcome bonus
    setShowRegistration(false);
    
    // Save user data to localStorage
    const userData = {
      name,
      phone,
      tokens: 500,
      registeredAt: new Date().toISOString()
    };
    localStorage.setItem('user_data', JSON.stringify(userData));
    
    toast({
      title: "Chào mừng đến với RanMenu!",
      description: `Xin chào ${name}! Bạn nhận được 500 Ran Token chào mừng.`,
    });
    
    // Auto redirect to menu after successful registration
    setTimeout(() => {
      const tableNumber = Math.floor(Math.random() * 20) + 1;
      navigate(`/menu?table=${tableNumber}&user=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}`);
    }, 2000); // Wait 2 seconds to show the welcome message
  };

  const handleGetStarted = async () => {
    if (!isLoggedIn) {
      toast({
        title: "Vui lòng đăng ký",
        description: "Bạn cần đăng ký để truy cập menu",
        variant: "destructive"
      });
      setShowRegistration(true);
    } else {
      // Send login info to Telegram for existing users
      try {
        await sendUserLoginToTelegram({
          name: userName,
          phone: userPhone,
          registeredAt: new Date().toISOString()
        });
      } catch (error) {
        console.error('Failed to send login info to Telegram:', error);
      }
      
      // Generate random table number and navigate
      const tableNumber = Math.floor(Math.random() * 20) + 1;
      navigate(`/menu?table=${tableNumber}&user=${encodeURIComponent(userName)}&phone=${encodeURIComponent(userPhone)}`);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-14 sm:pt-16">
      <Header
        isLoggedIn={isLoggedIn}
        userName={userName}
        ranTokens={ranTokens}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
      
      <Hero isLoggedIn={isLoggedIn} onGetStarted={handleGetStarted} />
      <FBannerCarousel />
      <Footer />

      <RegistrationModal
        isOpen={showRegistration}
        onClose={() => setShowRegistration(false)}
        onRegister={handleRegister}
      />
    </div>
  );
};

export default Index;
