import { forwardRef } from "react";
import { DrinkCard } from "./DrinkCard";

interface DrinkSectionProps {
  category: {
    id: string;
    name: string;
    description: string;
    drinks: Array<{
      id: string;
      name: string;
      description: string;
      ingredients: string;
      volume: string;
      prepTime: number;
      price: number;
      image: string;
    }>;
  };
  onAddToCart: (drink: any, ice: string, sugar: string) => void;
}

export const DrinkSection = forwardRef<HTMLDivElement, DrinkSectionProps>(
  ({ category, onAddToCart }, ref) => {
    return (
      <section ref={ref} className="py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {category.name}
          </h2>
          <p className="text-muted-foreground">
            {category.description}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {category.drinks.map((drink) => (
            <DrinkCard
              key={drink.id}
              drink={drink}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </section>
    );
  }
);