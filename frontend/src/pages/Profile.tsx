import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, User, Shield, Mail, Calendar, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getAuthToken, decodeJWT, getUserRole } from "@/services/api";

interface UserDetails {
  id: number;
  username: string;
  role: string;
  created_at?: string;
}

const Profile = () => {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form fields (for future editing functionality)
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get user ID from JWT token
      const token = getAuthToken();
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      const decoded = decodeJWT(token);
      if (!decoded || !decoded.id) {
        throw new Error("Invalid token payload");
      }
      
      const userId = decoded.id;
      
      // Fetch user details from API
      const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to fetch user details" }));
        throw new Error(errorData.error || "Failed to fetch user details");
      }

      const data = await response.json();
      setUserDetails(data);
      setUsername(data.username || "");
      setRole(data.role || "");
      
      toast({
        title: "Profile loaded",
        description: "Your profile has been loaded successfully.",
        variant: "default",
      });
    } catch (err: any) {
      const errorMessage = err.message || "Failed to load profile";
      setError(errorMessage);
      
      toast({
        title: "Error loading profile",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames: Record<string, string> = {
      "OWNER": "Owner",
      "MANAGER": "Manager",
      "WORKER": "Worker",
      "CLIENT": "Client",
      "ADMIN": "Admin",
    };
    return roleNames[role] || role;
  };

  const getRoleColor = (role: string) => {
    const roleColors: Record<string, string> = {
      "OWNER": "bg-purple-100 text-purple-800 border-purple-200",
      "MANAGER": "bg-blue-100 text-blue-800 border-blue-200",
      "WORKER": "bg-green-100 text-green-800 border-green-200",
      "CLIENT": "bg-orange-100 text-orange-800 border-orange-200",
      "ADMIN": "bg-red-100 text-red-800 border-red-200",
    };
    return roleColors[role] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-xl font-bold text-foreground">Profile</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            View and manage your account information
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Information
            </CardTitle>
            <CardDescription>
              Your personal account details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* User ID */}
            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">User ID</p>
                <p className="text-lg font-semibold">#{userDetails?.id}</p>
              </div>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Username
              </Label>
              {isEditing ? (
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                />
              ) : (
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium">{userDetails?.username || "N/A"}</p>
                </div>
              )}
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Role
              </Label>
              <div className="p-3 bg-muted rounded-md">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(userDetails?.role || "")}`}>
                  {getRoleDisplayName(userDetails?.role || "")}
                </span>
              </div>
            </div>

            {/* Created At */}
            {userDetails?.created_at && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Member Since
                </Label>
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium">
                    {new Date(userDetails.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              {isEditing ? (
                <>
                  <Button onClick={() => setIsEditing(false)} variant="outline">
                    Cancel
                  </Button>
                  <Button disabled>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  Edit Profile
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Security Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>
              Manage your account security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Password</p>
                <p className="text-sm text-muted-foreground">Last changed: Never</p>
              </div>
              <Button variant="outline" size="sm" disabled>
                Change Password
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">Not enabled</p>
              </div>
              <Button variant="outline" size="sm" disabled>
                Enable 2FA
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
