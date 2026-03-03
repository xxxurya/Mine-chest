import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { loginUser as apiLoginUser, logoutUser as apiLogoutUser, getCurrentUser as apiGetCurrentUser } from "../api";

/**
 * User interface representing an authenticated user
 */
interface User {
  id: string;
  username: string;
  role: string;
}

/**
 * Auth context type definition
 */
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  // Role-based access helpers
  hasRole: (roles: string | string[]) => boolean;
  isAdmin: () => boolean;
  isManager: () => boolean;
  isOwner: () => boolean;
  canAccess: (allowedRoles: string[]) => boolean;
}

// Create context with undefined default
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component that wraps the application
 * Provides authentication state and methods to all child components
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("authToken");
      
      if (storedToken) {
        setToken(storedToken);
        try {
          const userData = await apiGetCurrentUser();
          setUser(userData);
        } catch (error) {
          // Token invalid or expired
          localStorage.removeItem("authToken");
          localStorage.removeItem("userRole");
          setToken(null);
          setUser(null);
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  /**
   * Login function - authenticates user and stores token
   * @param username - User's username
   * @param password - User's password
   */
  const login = async (username: string, password: string) => {
    const data = await apiLoginUser(username, password);
    
    if (data.token) {
      localStorage.setItem("authToken", data.token);
      setToken(data.token);
      
      // Fetch user data after login
      const userData = await apiGetCurrentUser();
      setUser(userData);
      localStorage.setItem("userRole", userData.role);
    }
  };

  /**
   * Logout function - clears auth state and localStorage
   */
  const logout = () => {
    apiLogoutUser();
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    setToken(null);
    setUser(null);
  };

  /**
   * Refresh user data from server
   */
  const refreshUser = async () => {
    try {
      const userData = await apiGetCurrentUser();
      setUser(userData);
      localStorage.setItem("userRole", userData.role);
    } catch (error) {
      console.error("Failed to refresh user:", error);
      // If refresh fails, logout user
      logout();
    }
  };

  /**
   * Check if user has a specific role or any of the specified roles
   * @param roles - Single role or array of roles to check
   * @returns boolean - true if user has any of the specified roles
   */
  const hasRole = useCallback((roles: string | string[]): boolean => {
    if (!user) return false;
    
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  }, [user]);

  /**
   * Check if user is admin
   * @returns boolean - true if user role is ADMIN
   */
  const isAdmin = useCallback((): boolean => {
    return user?.role === "ADMIN";
  }, [user]);

  /**
   * Check if user is manager
   * @returns boolean - true if user role is MANAGER
   */
  const isManager = useCallback((): boolean => {
    return user?.role === "MANAGER";
  }, [user]);

  /**
   * Check if user is owner
   * @returns boolean - true if user role is OWNER
   */
  const isOwner = useCallback((): boolean => {
    return user?.role === "OWNER";
  }, [user]);

  /**
   * Check if user can access a route based on allowed roles
   * @param allowedRoles - Array of roles that are allowed to access
   * @returns boolean - true if user can access
   */
  const canAccess = useCallback((allowedRoles: string[]): boolean => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  }, [user]);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
    refreshUser,
    hasRole,
    isAdmin,
    isManager,
    isOwner,
    canAccess,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use auth context
 * @throws Error if used outside AuthProvider
 * @returns AuthContextType
 * 
 * @example
 * const { user, login, logout, isAdmin } = useAuth();
 * 
 * if (isAdmin()) {
 *   // Show admin-only content
 * }
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
};

export default AuthContext;
