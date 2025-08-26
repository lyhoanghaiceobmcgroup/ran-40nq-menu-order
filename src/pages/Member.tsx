import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { MemberProfile } from "@/components/member/MemberProfile";
import { PointBalance } from "@/components/member/PointBalance";
import { BillUpload } from "@/components/member/BillUpload";
import { VoucherStore } from "@/components/member/VoucherStore";
import { WalletHistory } from "@/components/member/WalletHistory";
import { MemberTier } from "@/components/member/MemberTier";
import AddRanTokens from "@/components/AddRanTokens";

const Member = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [ranTokens, setRanTokens] = useState(0);
  const [memberData, setMemberData] = useState({
    avatar: "",
    birthDate: "",
    email: "",
    totalSpent: 0,
    tier: "Đồng",
    monthlySpent: 0,
    pointsExpiringSoon: 0,
    expiryDate: "",
  });

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user_data');
    if (!userData) {
      toast({
        title: "Vui lòng đăng nhập",
        description: "Bạn cần đăng nhập để truy cập trang thành viên",
        variant: "destructive"
      });
      navigate('/');
      return;
    }

    const user = JSON.parse(userData);
    setIsLoggedIn(true);
    setUserName(user.name);
    setUserPhone(user.phone);
    setRanTokens(user.tokens || 0);

    // Load member data from localStorage or set defaults
    const memberInfo = localStorage.getItem('member_data');
    if (memberInfo) {
      setMemberData(JSON.parse(memberInfo));
    }
  }, [navigate]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName("");
    setUserPhone("");
    setRanTokens(0);
    localStorage.removeItem('user_data');
    localStorage.removeItem('member_data');
    toast({
      title: "Đăng xuất thành công",
      description: "Hẹn gặp lại bạn lần sau!",
    });
    navigate('/');
  };

  const updateRanTokens = (newTokens: number) => {
    setRanTokens(newTokens);
    // Update localStorage
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const user = JSON.parse(userData);
      user.tokens = newTokens;
      localStorage.setItem('user_data', JSON.stringify(user));
    }
  };

  const updateMemberData = (newData: any) => {
    setMemberData(newData);
    localStorage.setItem('member_data', JSON.stringify(newData));
  };

  const goToMenu = () => {
    const tableNumber = Math.floor(Math.random() * 20) + 1;
    navigate(`/menu?table=${tableNumber}&user=${encodeURIComponent(userName)}&phone=${encodeURIComponent(userPhone)}`);
  };

  if (!isLoggedIn) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Đang kiểm tra đăng nhập...</h2>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        isLoggedIn={isLoggedIn}
        userName={userName}
        ranTokens={ranTokens}
        onLogin={() => {}}
        onLogout={handleLogout}
      />
      
      <main className="container mx-auto px-3 sm:px-4 pt-16 sm:pt-20 pb-8 space-y-6 sm:space-y-8">
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-2">Trang Thành Viên</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Quản lý điểm thưởng và ưu đãi của bạn</p>
        </div>

        <div className="flex flex-row gap-3 justify-center items-center mb-8">
          <Link to="/" className="flex-1 sm:flex-none">
            <Button variant="outline" size="sm" className="w-full sm:w-auto min-w-[120px]">
              ← Trang chủ
            </Button>
          </Link>
          <Button 
            onClick={goToMenu} 
            className="premium-gradient text-white flex-1 sm:flex-none min-w-[140px]" 
            size="sm"
          >
            Order & Menu
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
            <MemberProfile
              userName={userName}
              userPhone={userPhone}
              memberData={memberData}
              onUpdateProfile={updateMemberData}
            />
            
            <BillUpload
              onPointsAdded={(points) => updateRanTokens(ranTokens + points)}
            />
            
            <VoucherStore
              ranTokens={ranTokens}
              onVoucherPurchased={(cost) => updateRanTokens(ranTokens - cost)}
              userPhone={userPhone}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            <PointBalance
              ranTokens={ranTokens}
              memberData={memberData}
            />
            
            <AddRanTokens />
            
            <MemberTier
              memberData={memberData}
              onTierUpdate={updateMemberData}
            />
            
            <WalletHistory userPhone={userPhone} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Member;