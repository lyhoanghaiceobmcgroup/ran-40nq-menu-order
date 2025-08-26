import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Menu as MenuIcon, 
  X, 
  Coins, 
  Gift,
  LogOut
} from "lucide-react";

interface HeaderProps {
  isLoggedIn: boolean;
  userName?: string;
  ranTokens?: number;
  onLogin: () => void;
  onLogout: () => void;
}

export const Header = ({ isLoggedIn, userName, ranTokens = 0, onLogin, onLogout }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-white/10">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg premium-gradient flex items-center justify-center">
              <span className="text-white font-bold text-xs sm:text-sm">R</span>
            </div>
            <span className="text-lg sm:text-xl font-bold text-foreground">
              Ran<span className="text-primary">Menu</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="/about" className="text-foreground hover:text-primary transition-colors">
              Về RAN
            </a>
            {isLoggedIn && (
              <a href="/member" className="text-foreground hover:text-primary transition-colors">
                Thành Viên
              </a>
            )}
          </nav>

          {/* User Section */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {isLoggedIn ? (
              <div className="flex items-center space-x-2 sm:space-x-4">
                {/* Ran Tokens - Responsive */}
                <div className="flex items-center space-x-1 sm:space-x-2 bg-accent/20 px-2 sm:px-3 py-1 rounded-full">
                  <Coins className="h-3 w-3 sm:h-4 sm:w-4 text-accent" />
                  <span className="text-xs sm:text-sm font-semibold text-foreground">
                    {ranTokens > 999 ? `${Math.floor(ranTokens/1000)}k` : ranTokens.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground hidden sm:inline">Ran</span>
                </div>

                {/* User Info - Hidden on very small screens */}
                <div className="hidden sm:flex items-center space-x-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-foreground max-w-16 sm:max-w-none truncate">
                    {userName}
                  </span>
                </div>

                {/* Logout Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogout}
                  className="text-muted-foreground hover:text-foreground p-1 sm:p-2"
                >
                  <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            ) : (
              <Button
                onClick={onLogin}
                size="sm"
                className="premium-gradient text-white font-medium text-xs sm:text-sm px-3 sm:px-4"
              >
                <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Đăng Nhập</span>
                <span className="sm:hidden">Login</span>
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-1"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-4 w-4 sm:h-5 sm:w-5" /> : <MenuIcon className="h-4 w-4 sm:h-5 sm:w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-white/10 py-3 sm:py-4 bg-background/95 backdrop-blur-sm">
            <nav className="flex flex-col space-y-3 sm:space-y-4">
              <a 
                href="/about" 
                className="text-foreground hover:text-primary transition-colors py-2 text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                Về RAN
              </a>
              {isLoggedIn && (
                <a 
                  href="/member" 
                  className="text-foreground hover:text-primary transition-colors py-2 text-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Thành Viên
                </a>
              )}
              
              {isLoggedIn && (
                <div className="pt-3 border-t border-border">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">{userName}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    <Coins className="h-3 w-3 mr-1" />
                    {ranTokens.toLocaleString()} Ran
                  </Badge>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};