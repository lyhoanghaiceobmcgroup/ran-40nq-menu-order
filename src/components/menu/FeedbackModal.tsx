import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userPhone: string;
}

export const FeedbackModal = ({ isOpen, onClose, userName, userPhone }: FeedbackModalProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [phone, setPhone] = useState(userPhone);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Vui lòng đánh giá",
        description: "Hãy chọn số sao đánh giá trước khi gửi",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    try {
      const feedbackData = {
        user_id: userPhone,
        name: userName,
        star_rating: rating,
        feedback_text: feedback,
        phone: phone,
        submitted_at: new Date().toISOString(),
        auto_location: "40 Ngô Quyền, Hà Nội"
      };

      // Store feedback in localStorage for demo
      const existingFeedback = JSON.parse(localStorage.getItem('feedback_data') || '[]');
      existingFeedback.push(feedbackData);
      localStorage.setItem('feedback_data', JSON.stringify(existingFeedback));

      toast({
        title: "Cảm ơn bạn đã đánh giá! ⭐",
        description: "Ran sẽ liên hệ phản hồi trong thời gian sớm nhất",
      });

      onClose();
    } catch (error) {
      toast({
        title: "Lỗi gửi đánh giá",
        description: "Vui lòng thử lại sau",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      return (
        <button
          key={starValue}
          type="button"
          className={`p-1 transition-all duration-200 ${
            starValue <= (hoveredRating || rating)
              ? "text-yellow-400 scale-110"
              : "text-muted-foreground hover:text-yellow-300"
          }`}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
          onClick={() => setRating(starValue)}
        >
          <Star 
            className={`w-8 h-8 ${
              starValue <= (hoveredRating || rating) ? "fill-current" : ""
            }`} 
          />
        </button>
      );
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold flex items-center justify-between">
            <span className="premium-gradient bg-clip-text text-transparent">
              ✨ Cảm ơn bạn đã ghé thăm RAN!
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-center">
            <p className="text-lg font-medium text-foreground mb-2">
              🌟 Trạm dừng vị giác 40 Ngô Quyền, Hà Nội
            </p>
            <p className="text-muted-foreground mb-4">
              Bạn đánh giá trải nghiệm hôm nay như thế nào?
            </p>
            
            <div className="flex justify-center space-x-1 mb-2">
              {renderStars()}
            </div>
            
            {rating > 0 && (
              <p className="text-sm text-muted-foreground">
                {rating === 1 && "Rất không hài lòng"}
                {rating === 2 && "Không hài lòng"}
                {rating === 3 && "Bình thường"}
                {rating === 4 && "Hài lòng"}
                {rating === 5 && "Rất hài lòng"}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                ✍️ Góp ý của bạn cho chúng tôi (không bắt buộc):
              </label>
              <Textarea
                placeholder="Chia sẻ cảm nhận về món ăn, phục vụ, không gian..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="min-h-[80px] resize-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                📱 Ran rất trân trọng và mong muốn phản hồi lại đánh giá:
              </label>
              <Input
                type="tel"
                placeholder="+84 | 0933xxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleSkip}
              className="flex-1"
            >
              Bỏ qua
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0}
              className="flex-1 premium-gradient text-white"
            >
              {isSubmitting ? "Đang gửi..." : "✅ GỬI ĐÁNH GIÁ"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};