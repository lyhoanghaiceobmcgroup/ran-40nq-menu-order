interface MenuNavigationProps {
  categories: Array<{
    id: string;
    name: string;
    description: string;
  }>;
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
}

export const MenuNavigation = ({ categories, activeSection, onSectionClick }: MenuNavigationProps) => {
  return (
    <div className="sticky top-[73px] z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex overflow-x-auto scrollbar-hide py-3 gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onSectionClick(category.id)}
              className={`
                flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium
                transition-all duration-300 whitespace-nowrap
                ${activeSection === category.id
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'bg-secondary/50 text-secondary-foreground hover:bg-secondary'
                }
              `}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};