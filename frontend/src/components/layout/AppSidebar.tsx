import { useState, useMemo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  ShoppingCart,
  Truck,
  Warehouse,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ListTodo,
  CheckCircle,
  History,
  LogOut,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getUserRole, logoutUser, checkAuth } from "../../api";

// Role-based navigation items
const navItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/", roles: [] },
  { title: "Create Task", icon: PlusCircle, path: "/create-task", roles: ["MANAGER"] },
  { title: "My Tasks", icon: ListTodo, path: "/my-tasks", roles: ["OWNER", "MANAGER", "WORKER"] },
  { title: "Products", icon: Package, path: "/products", roles: ["OWNER", "MANAGER", "CLIENT"] },
  { title: "Stock Movements", icon: ArrowLeftRight, path: "/stock-movements", roles: ["OWNER", "MANAGER", "WORKER"] },
  { title: "Purchase Orders", icon: ShoppingCart, path: "/purchase-orders", roles: ["OWNER", "MANAGER", "CLIENT"] },
  { title: "Suppliers", icon: Truck, path: "/suppliers", roles: ["OWNER", "MANAGER"] },
  { title: "Warehouses", icon: Warehouse, path: "/warehouses", roles: ["OWNER", "MANAGER"] },
  { title: "Reports", icon: BarChart3, path: "/reports", roles: ["OWNER", "MANAGER"] },
  { title: "Approvals", icon: CheckCircle, path: "/admin-approvals", roles: ["ADMIN"] },
  { title: "History", icon: History, path: "/history", roles: ["OWNER", "MANAGER"] },
  { title: "Settings", icon: Settings, path: "/settings", roles: [] },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get user role from JWT token
  const userRole = useMemo(() => getUserRole(), [location.pathname]);
  
  // Check if user is authenticated
  const isAuthenticated = useMemo(() => checkAuth(), [location.pathname]);

  // Filter navigation items based on user role
  const filteredNavItems = useMemo(() => {
    // If no user role (not logged in), show only public items (empty roles array)
    if (!userRole) {
      return navItems.filter((item) => item.roles.length === 0);
    }
    
    // Filter items based on user role
    return navItems.filter((item) => {
      // If no roles specified, visible to all authenticated users
      if (item.roles.length === 0) return true;
      // Check if user's role is in the allowed roles
      return item.roles.includes(userRole);
    });
  }, [userRole]);

  // Handle logout
  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <aside
      className={cn(
        "h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 ease-in-out sticky top-0 z-30",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <Package className="w-4.5 h-4.5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-bold text-base text-sidebar-foreground whitespace-nowrap">
              InvenTrack
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto scrollbar-thin">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span className="whitespace-nowrap">{item.title}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User Role Indicator (when not collapsed) */}
      {!collapsed && userRole && (
        <div className="px-3 py-2 border-t border-sidebar-border">
          <span className="text-xs text-sidebar-foreground/60">
            Role: {userRole}
          </span>
        </div>
      )}

      {/* Logout Button */}
      {isAuthenticated && (
        <div className="p-2 border-t border-sidebar-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
          >
            <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
            {!collapsed && <span className="whitespace-nowrap">Logout</span>}
          </button>
        </div>
      )}

      {/* Collapse toggle */}
      <div className="p-2 border-t border-sidebar-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
