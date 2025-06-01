import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import MobileMenu from "@/components/MobileMenu";
import { Menu, X, LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location, navigate] = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was an error logging out",
        variant: "destructive",
      });
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="sticky top-0 bg-white shadow-sm z-50 dark:bg-neutral-900 dark:text-white">
      <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <span className="text-primary text-3xl mr-2">🍽️</span>
          <Link href="/">
            <h1 className="font-poppins font-bold text-2xl text-primary cursor-pointer">
              CaterEase
            </h1>
          </Link>
        </div>

        {/* Nav Links - Desktop */}
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/" className={`hover:text-primary transition-colors font-medium ${location === "/" ? "text-primary" : ""}`}>
            Home
          </Link>
          <Link href="/browse" className={`hover:text-primary transition-colors font-medium ${location === "/browse" ? "text-primary" : ""}`}>
            Browse Caterers
          </Link>
          {user && user.role === "user" && (
            <Link href="/dashboard" className={`hover:text-primary transition-colors font-medium ${location === "/dashboard" ? "text-primary" : ""}`}>
              My Orders
            </Link>
          )}
          {user && user.role === "caterer" && (
            <Link href="/caterer-dashboard" className={`hover:text-primary transition-colors font-medium ${location === "/caterer-dashboard" ? "text-primary" : ""}`}>
              Caterer Dashboard
            </Link>
          )}
          {user && user.role === "admin" && (
            <Link href="/admin" className={`hover:text-primary transition-colors font-medium ${location === "/admin" ? "text-primary" : ""}`}>
              Admin Dashboard
            </Link>
          )}
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-4">
          {user ? (
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                    <User className="mr-2 h-4 w-4" /> {user.name}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {user.role === "user" && (
                    <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                      My Orders
                    </DropdownMenuItem>
                  )}
                  {user.role === "caterer" && (
                    <DropdownMenuItem onClick={() => navigate("/caterer-dashboard")}>
                      Caterer Dashboard
                    </DropdownMenuItem>
                  )}
                  {user.role === "admin" && (
                    <DropdownMenuItem onClick={() => navigate("/admin")}>
                      Admin Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <>
              <Link href="/login">
                <Button
                  variant="outline"
                  className="hidden md:block border-primary text-primary hover:bg-primary hover:text-white"
                >
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="hidden md:block bg-primary text-white hover:bg-primary/90">
                  Sign Up
                </Button>
              </Link>
            </>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu isOpen={isMenuOpen} onClose={toggleMenu} />
    </header>
  );
};

export default Navbar;
