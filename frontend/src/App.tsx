import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useMemo } from "react";
import Index from "./pages/Index";
import Products from "./pages/Products";
import StockMovements from "./pages/StockMovements";
import PurchaseOrders from "./pages/PurchaseOrders";
import Suppliers from "./pages/Suppliers";
import Warehouses from "./pages/Warehouses";
import Reports from "./pages/Reports";
import SettingsPage from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyTasks from "./pages/MyTasks";
import AdminApprovals from "./pages/AdminApprovals";
import HistoryViewer from "./pages/HistoryViewer";
import CreateTask from "./pages/CreateTask";
import { AuthProvider, useAuth } from "./hooks/AuthContext";

const queryClient = new QueryClient();

// Role type definition
type Role = "ADMIN" | "MANAGER" | "WORKER" | "OWNER" | "CLIENT";

/**
 * Protected Route Component
 * Requires JWT token for authentication
 * Redirects to /login if not authenticated
 */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Show loading state while checking auth
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

/**
 * Role-Based Route Component
 * Requires specific role(s) for access
 * Redirects to home if user doesn't have required role
 */
const RoleBasedRoute = ({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode; 
  allowedRoles: Role[];
}) => {
  const { canAccess, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!canAccess(allowedRoles)) {
    // Redirect to home if user doesn't have required role
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected Routes - Require Authentication */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Index />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["OWNER", "MANAGER", "CLIENT"]}>
              <Products />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/stock-movements"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["OWNER", "MANAGER", "WORKER"]}>
              <StockMovements />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/purchase-orders"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["OWNER", "MANAGER", "CLIENT"]}>
              <PurchaseOrders />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/suppliers"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["OWNER", "MANAGER"]}>
              <Suppliers />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/warehouses"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["OWNER", "MANAGER"]}>
              <Warehouses />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["OWNER", "MANAGER"]}>
              <Reports />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-tasks"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["OWNER", "MANAGER", "WORKER"]}>
              <MyTasks />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/approvals"
        element={
          <ProtectedRoute>
            {/* Only Admin can access /approvals route */}
            <RoleBasedRoute allowedRoles={["ADMIN"]}>
              <AdminApprovals />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["OWNER", "MANAGER"]}>
              <HistoryViewer />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-task"
        element={
          <ProtectedRoute>
            {/* Only Manager can access /create-task route */}
            <RoleBasedRoute allowedRoles={["MANAGER"]}>
              <CreateTask />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      
      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
