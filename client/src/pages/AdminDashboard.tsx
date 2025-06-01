import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminDashboard = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  // Redirect if not logged in or not an admin
  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to access the dashboard",
        variant: "destructive",
      });
      navigate("/login");
    } else if (user.role !== "admin") {
      toast({
        title: "Access denied",
        description: "Only administrators can access this dashboard",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [user, navigate, toast]);

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Users Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Manage platform users.</p>
            <p className="text-sm text-muted-foreground mt-4">Coming soon...</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Caterers Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Approve and manage caterers.</p>
            <p className="text-sm text-muted-foreground mt-4">Coming soon...</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Platform Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">View platform usage statistics.</p>
            <p className="text-sm text-muted-foreground mt-4">Coming soon...</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-10">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">No recent activities to display.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;