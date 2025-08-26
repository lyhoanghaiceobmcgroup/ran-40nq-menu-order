import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Edit, Camera } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface MemberProfileProps {
  userName: string;
  userPhone: string;
  memberData: any;
  onUpdateProfile: (data: any) => void;
}

export const MemberProfile = ({ userName, userPhone, memberData, onUpdateProfile }: MemberProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: userName,
    phone: userPhone,
    email: memberData.email || "",
    birthDate: memberData.birthDate || "",
  });

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Kim Cương": return "diamond";
      case "Vàng": return "gold";
      case "Bạc": return "silver";
      default: return "bronze";
    }
  };

  const handleSave = () => {
    const updatedData = {
      ...memberData,
      email: formData.email,
      birthDate: formData.birthDate,
    };
    
    onUpdateProfile(updatedData);
    setIsEditing(false);
    
    toast({
      title: "Cập nhật thành công",
      description: "Thông tin cá nhân đã được cập nhật",
    });
  };

  return (
    <Card className="card-shadow">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-3">
          <Avatar className="h-16 w-16">
            <AvatarImage src={memberData.avatar} />
            <AvatarFallback className="bg-primary/10 text-primary text-xl">
              {userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-xl font-semibold">{userName}</h3>
            <Badge variant="secondary" className={`tier-${getTierColor(memberData.tier)}`}>
              Hạng {memberData.tier}
            </Badge>
          </div>
        </CardTitle>
        <Button
          variant="outline"
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2"
        >
          <Edit className="h-4 w-4" />
          {isEditing ? "Hủy" : "Chỉnh sửa"}
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Họ tên</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <Label htmlFor="birthDate">Ngày sinh</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1">
                Lưu thay đổi
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Hủy
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Số điện thoại</Label>
              <p className="font-medium">{userPhone}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <p className="font-medium">{memberData.email || "Chưa cập nhật"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Ngày sinh</Label>
              <p className="font-medium">
                {memberData.birthDate ? new Date(memberData.birthDate).toLocaleDateString('vi-VN') : "Chưa cập nhật"}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Ngày tham gia</Label>
              <p className="font-medium">
                {new Date().toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-2 pt-4 border-t">
          <Camera className="h-4 w-4 text-muted-foreground" />
          <Button variant="ghost" size="sm">
            Thay đổi ảnh đại diện
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};