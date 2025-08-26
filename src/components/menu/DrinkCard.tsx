import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Droplets, Plus } from "lucide-react";

// Import drink images
import ranSpecialMixology from "@/assets/drinks/ran-special-mixology.jpg";
import goldenSunset from "@/assets/drinks/golden-sunset.jpg";
import espresso from "@/assets/drinks/espresso.jpg";
import cafeSuaDa from "@/assets/drinks/cafe-sua-da.jpg";
import traLai from "@/assets/drinks/tra-lai.jpg";
import matchaLatte from "@/assets/drinks/matcha-latte.jpg";
import traChanhLeo from "@/assets/drinks/tra-chanh-leo.jpg";
import smoothieXoai from "@/assets/drinks/smoothie-xoai.jpg";

const imageMap: { [key: string]: string } = {
  "ran-special-mixology": ranSpecialMixology,
  "golden-sunset": goldenSunset,
  "espresso": espresso,
  "cafe-sua-da": cafeSuaDa,
  "tra-lai": traLai,
  "matcha-latte": matchaLatte,
  "tra-chanh-leo": traChanhLeo,
  "smoothie-xoai": smoothieXoai,
};

interface DrinkCardProps {
  drink: {
    id: string;
    name: string;
    description: string;
    ingredients: string;
    volume: string;
    prepTime: number;
    price: number;
    image: string;
  };
  onAddToCart: (drink: any, ice: string, sugar: string) => void;
}

export const DrinkCard = ({ drink, onAddToCart }: DrinkCardProps) => {
  const [ice, setIce] = useState("vừa");
  const [sugar, setSugar] = useState("vừa");

  const iceOptions = ["ít", "vừa", "nhiều"];
  const sugarOptions = ["ít", "vừa", "nhiều"];

  const handleAddToCart = () => {
    onAddToCart(drink, ice, sugar);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <Card className="hover-float overflow-hidden group">
      <div className="aspect-[4/3] relative overflow-hidden">
        <img
          src={imageMap[drink.image] || espresso}
          alt={drink.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJoc2woMzIgMjAlIDg4JSkiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9ImhzbCgyOCAyMCUgNDUlKSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkjDrG5oIMSRw7NsIMOibg0KICA8L3RleHQ+PC9zdmc+";
          }}
        />
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="bg-background/90 text-foreground">
            <Clock className="w-3 h-3 mr-1" />
            {drink.prepTime}s
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {drink.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-2">
            {drink.description}
          </p>
          <p className="text-xs text-muted-foreground mb-1">
            <strong>Thành phần:</strong> {drink.ingredients}
          </p>
          <p className="text-xs text-muted-foreground">
            <strong>Thể tích:</strong> {drink.volume}
          </p>
        </div>

        {/* Ice Selection */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Đá lạnh:</span>
          </div>
          <div className="flex gap-2">
            {iceOptions.map((option) => (
              <button
                key={option}
                onClick={() => setIce(option)}
                className={`
                  px-3 py-1 rounded-full text-xs font-medium transition-all
                  ${ice === option
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }
                `}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Sugar Selection */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Plus className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Đường ngọt:</span>
          </div>
          <div className="flex gap-2">
            {sugarOptions.map((option) => (
              <button
                key={option}
                onClick={() => setSugar(option)}
                className={`
                  px-3 py-1 rounded-full text-xs font-medium transition-all
                  ${sugar === option
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }
                `}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Price and Add Button */}
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-primary">
            {formatPrice(drink.price)}
          </div>
          <Button 
            onClick={handleAddToCart}
            className="premium-gradient text-primary-foreground hover:opacity-90"
          >
            Gọi món
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};