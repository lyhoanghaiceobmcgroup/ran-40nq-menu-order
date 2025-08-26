import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";

interface CartButtonProps {
  itemCount: number;
  onCheckout: () => void;
}

export const CartButton = ({ itemCount, onCheckout }: CartButtonProps) => {
  if (itemCount === 0) return null;

  return (
    <Button
      onClick={onCheckout}
      className="relative premium-gradient text-primary-foreground hover:opacity-90"
      size="sm"
    >
      <ShoppingCart className="w-4 h-4 mr-2" />
      Giỏ hàng
      {itemCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
        >
          {itemCount}
        </Badge>
      )}
    </Button>
  );
};