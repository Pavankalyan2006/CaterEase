import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
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
      onClose();
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was an error logging out",
        variant: "destructive",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="md:hidden bg-white dark:bg-neutral-900 shadow-lg">
      <div className="container mx-auto px-4 py-3 flex flex-col space-y-4">
        <Link href="/">
          <a
            className={`hover:text-primary transition-colors font-medium py-2 border-b border-neutral-200 dark:border-neutral-700 ${
              location === "/" ? "text-primary" : ""
            }`}
            onClick={onClose}
          >
            Home
          </a>
        </Link>
        <Link href="/browse">
          <a
            className={`hover:text-primary transition-colors font-medium py-2 border-b border-neutral-200 dark:border-neutral-700 ${
              location === "/browse" ? "text-primary" : ""
            }`}
            onClick={onClose}
          >
            Browse Caterers
          </a>
        </Link>
        {user && user.role === "user" && (
          <Link href="/dashboard">
            <a
              className={`hover:text-primary transition-colors font-medium py-2 border-b border-neutral-200 dark:border-neutral-700 ${
                location === "/dashboard" ? "text-primary" : ""
              }`}
              onClick={onClose}
            >
              My Orders
            </a>
          </Link>
        )}
        {user && user.role === "caterer" && (
          <Link href="/caterer-dashboard">
            <a
              className={`hover:text-primary transition-colors font-medium py-2 border-b border-neutral-200 dark:border-neutral-700 ${
                location === "/caterer-dashboard" ? "text-primary" : ""
              }`}
              onClick={onClose}
            >
              Caterer Dashboard
            </a>
          </Link>
        )}
        {user && user.role === "admin" && (
          <Link href="/admin">
            <a
              className={`hover:text-primary transition-colors font-medium py-2 border-b border-neutral-200 dark:border-neutral-700 ${
                location === "/admin" ? "text-primary" : ""
              }`}
              onClick={onClose}
            >
              Admin Dashboard
            </a>
          </Link>
        )}
        <div className="flex space-x-4 pt-2">
          {user ? (
            <Button
              className="flex-1 bg-primary text-white hover:bg-primary/90"
              onClick={handleLogout}
            >
              Logout
            </Button>
          ) : (
            <>
              <Link href="/login">
                <Button
                  variant="outline"
                  className="flex-1 border-primary text-primary hover:bg-primary hover:text-white"
                  onClick={onClose}
                >
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  className="flex-1 bg-primary text-white hover:bg-primary/90"
                  onClick={onClose}
                >
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
