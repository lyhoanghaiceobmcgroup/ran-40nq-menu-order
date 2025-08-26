import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Phone, User } from "lucide-react";
import { sendUserRegistrationToTelegram } from "@/services/telegramService";
import { toast } from "@/hooks/use-toast";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (name: string, phone: string) => void;
}

export const RegistrationModal = ({ isOpen, onClose, onRegister }: RegistrationModalProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !accepted) return;
    
    setLoading(true);
    
    try {
      // Send registration data to Telegram
      const registrationData = {
        name,
        phone,
        registeredAt: new Date().toISOString()
      };
      
      const telegramSuccess = await sendUserRegistrationToTelegram(registrationData);
      
      if (!telegramSuccess) {
        toast({
          title: "Cảnh báo",
          description: "Không thể gửi thông tin đến hệ thống. Vui lòng thử lại.",
          variant: "destructive"
        });
      }
      
      // Continue with registration regardless of Telegram status
      onRegister(name, phone);
      onClose();
      
      // Reset form
      setName("");
      setPhone("");
      setAccepted(false);
      
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra trong quá trình đăng ký. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold premium-gradient bg-clip-text text-transparent">
            Chào mừng đến với Menu Điện Tử
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">Họ và tên</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Nhập họ tên của bạn"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 border-border focus:ring-accent"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-foreground">Số điện thoại</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0xxx xxx xxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10 border-border focus:ring-accent"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked as boolean)}
            />
            <Label
              htmlFor="terms"
              className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Tôi đồng ý với{" "}
              <span className="text-primary underline cursor-pointer">
                điều khoản sử dụng
              </span>
            </Label>
          </div>

          <Button
            type="submit"
            disabled={!name || !phone || !accepted || loading}
            className="w-full premium-gradient text-primary-foreground font-semibold py-3 hover:opacity-90 transition-opacity"
          >
            {loading ? "Đang đăng ký..." : "Bắt đầu gọi món"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};