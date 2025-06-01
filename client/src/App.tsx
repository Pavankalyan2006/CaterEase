import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import CatererRegister from "@/pages/CatererRegister";
import Browse from "@/pages/Browse";
import CatererProfile from "@/pages/CatererProfile";
import PlaceOrder from "@/pages/PlaceOrder";
import UserDashboard from "@/pages/UserDashboard";
import CatererDashboard from "@/pages/CatererDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import { AuthProvider } from "@/contexts/AuthContext";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/caterer-register" component={CatererRegister} />
          <Route path="/browse" component={Browse} />
          <Route path="/caterer/:id" component={CatererProfile} />
          <Route path="/place-order/:catererId/:menuId" component={PlaceOrder} />
          <Route path="/dashboard" component={UserDashboard} />
          <Route path="/caterer-dashboard" component={CatererDashboard} />
          <Route path="/admin" component={AdminDashboard} />
          <Route component={NotFound} />
        </Switch>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
