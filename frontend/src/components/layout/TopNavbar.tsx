import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, ChevronDown, User, LogOut, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/AuthContext";
import { toast } from "@/hooks/use-toast";

const warehouseOptions = ["All Warehouses", "Mumbai Central", "Delhi NCR", "Bangalore Hub", "Chennai Port"];

export function TopNavbar() {
  const [selectedWarehouse, setSelectedWarehouse] = useState("All Warehouses");
  const { user, logout, isAdmin, isManager, isOwner } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
      variant: "default",
    });
    navigate("/login");
  };

  // Get display role
  const getRoleDisplay = () => {
    if (!user) return "Guest";
    if (isAdmin()) return "Admin";
    if (isManager()) return "Manager";
    if (isOwner()) return "Owner";
    return user.role;
  };

  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search products, SKUs, orders..."
          className="pl-9 h-9 bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/30"
        />
      </div>

      <div className="flex items-center gap-2 ml-4">
        {/* Warehouse Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-foreground rounded-lg hover:bg-secondary transition-colors">
            <span className="hidden sm:inline">{selectedWarehouse}</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {warehouseOptions.map((wh) => (
              <DropdownMenuItem key={wh} onClick={() => setSelectedWarehouse(wh)}>
                {wh}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
          <Bell className="w-[18px] h-[18px] text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
        </button>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-secondary transition-colors">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-foreground leading-none">
                {user?.username || "Guest"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {getRoleDisplay()}
              </p>
            </div>
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
