import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Package, 
  Star, 
  ChevronRight,
  Edit,
  Trash,
  Utensils,
  Building,
  Users,
  FileText,
  Phone,
  Mail,
  Plus,
  Eye,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  Loader2,
  BarChart3,
  DollarSign,
  ShoppingBag,
  ArrowUp,
  ArrowDown,
  Filter
} from "lucide-react";
import { Caterer } from "@/contexts/AuthContext";

// Types
type Order = {
  id: number;
  userId: number;
  catererId: number;
  menuId: number;
  eventType: string;
  noOfPlates: number;
  totalPrice: number;
  eventDate: string;
  eventTime: string;
  address: string;
  city: string;
  state: string;
  specialInstructions?: string;
  status: string;
  createdAt: string;
  userName?: string;
};

type Menu = {
  id: number;
  catererId: number;
  name: string;
  mealType: string;
  pricePerPlate: number;
  description?: string;
  items: string[];
  isVegetarian: boolean;
  isSpecial: boolean;
};

type Review = {
  id: number;
  userId: number;
  catererId: number;
  orderId: number;
  rating: number;
  comment?: string;
  createdAt: string;
  userName?: string;
};

// Dashboard Stats
type DashboardStats = {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  averageRating: number;
  reviewCount: number;
};

// Form Schemas
const menuFormSchema = z.object({
  name: z.string().min(3, "Menu name must be at least 3 characters"),
  mealType: z.string().min(1, "Meal type is required"),
  pricePerPlate: z.coerce.number()
    .min(50, "Price per plate must be at least ₹50")
    .max(10000, "Price per plate must not exceed ₹10,000"),
  description: z.string().optional(),
  items: z.array(z.string())
    .min(1, "Menu must have at least 1 item"),
  isVegetarian: z.boolean().default(false),
  isSpecial: z.boolean().default(false),
});

type MenuFormValues = z.infer<typeof menuFormSchema>;

const profileFormSchema = z.object({
  businessName: z.string().min(3, "Business name must be at least 3 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  location: z.string().min(5, "Location must be at least 5 characters"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  minPlate: z.coerce.number()
    .min(10, "Minimum plate count must be at least 10"),
  maxPlate: z.coerce.number()
    .min(50, "Maximum plate count must be at least 50"),
  eventTypes: z.array(z.string())
    .min(1, "Please select at least one event type"),
  specialties: z.array(z.string())
    .min(1, "Please select at least one specialty"),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Event types for multi-select
const eventTypes = [
  { id: "wedding", label: "Wedding" },
  { id: "corporate", label: "Corporate" },
  { id: "pooja", label: "Traditional Pooja" },
  { id: "party", label: "Private Party" },
  { id: "other", label: "Other" },
];

// Cuisine specialties for multi-select
const specialtiesList = [
  { id: "northIndian", label: "North Indian" },
  { id: "southIndian", label: "South Indian" },
  { id: "chinese", label: "Chinese" },
  { id: "continental", label: "Continental" },
  { id: "italian", label: "Italian" },
  { id: "mughlai", label: "Mughlai" },
  { id: "punjabi", label: "Punjabi" },
  { id: "street", label: "Street Food" },
  { id: "desserts", label: "Desserts & Sweets" },
];

const mealTypes = [
  { id: "breakfast", label: "Breakfast" },
  { id: "lunch", label: "Lunch" },
  { id: "dinner", label: "Dinner" },
  { id: "snacks", label: "Snacks" },
  { id: "full_day", label: "Full Day" },
];

const CatererDashboard = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, caterer } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [menuFormOpen, setMenuFormOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [profileFormOpen, setProfileFormOpen] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [orderDateFilter, setOrderDateFilter] = useState("upcoming");
  const [confirmDeleteMenu, setConfirmDeleteMenu] = useState<number | null>(null);
  
  // Create a ref to store menu items for the form
  const [menuItems, setMenuItems] = useState<string[]>([]);
  const [newMenuItem, setNewMenuItem] = useState("");

  // Redirect if not logged in or not a caterer
  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to access the dashboard",
        variant: "destructive",
      });
      navigate("/login");
    } else if (user.role !== "caterer") {
      toast({
        title: "Access denied",
        description: "Only caterers can access this dashboard",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [user, navigate, toast]);

  // Menu form
  const menuForm = useForm<MenuFormValues>({
    resolver: zodResolver(menuFormSchema),
    defaultValues: {
      name: "",
      mealType: "",
      pricePerPlate: 250,
      description: "",
      items: [],
      isVegetarian: false,
      isSpecial: false,
    }
  });

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      businessName: caterer?.businessName || "",
      description: caterer?.description || "",
      location: caterer?.location || "",
      city: caterer?.city || "",
      state: caterer?.state || "",
      minPlate: caterer?.minPlate || 50,
      maxPlate: caterer?.maxPlate || 500,
      eventTypes: caterer?.eventTypes || [],
      specialties: caterer?.specialties || [],
    }
  });

  // Set profile form values when caterer data changes
  useEffect(() => {
    if (caterer) {
      profileForm.reset({
        businessName: caterer.businessName,
        description: caterer.description || "",
        location: caterer.location,
        city: caterer.city,
        state: caterer.state,
        minPlate: caterer.minPlate,
        maxPlate: caterer.maxPlate,
        eventTypes: caterer.eventTypes || [],
        specialties: caterer.specialties || [],
      });
    }
  }, [caterer, profileForm]);

  // Fetch caterer orders
  const { 
    data: orders = [], 
    isLoading: isLoadingOrders, 
    error: ordersError,
    refetch: refetchOrders
  } = useQuery<Order[]>({
    queryKey: ["/api/caterers/orders"],
    enabled: !!user && user.role === "caterer",
  });

  // Fetch caterer menus
  const { 
    data: menus = [], 
    isLoading: isLoadingMenus, 
    error: menusError,
    refetch: refetchMenus
  } = useQuery<Menu[]>({
    queryKey: [`/api/caterers/${caterer?.id}/menus`],
    enabled: !!caterer,
  });

  // Fetch caterer reviews
  const { 
    data: reviews = [], 
    isLoading: isLoadingReviews, 
    error: reviewsError
  } = useQuery<Review[]>({
    queryKey: [`/api/caterers/${caterer?.id}/reviews`],
    enabled: !!caterer,
  });

  // Add menu mutation
  const addMenuMutation = useMutation({
    mutationFn: async (data: MenuFormValues) => {
      const response = await apiRequest("POST", "/api/caterers/menus", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Menu added successfully",
        description: "Your new menu has been added to your profile",
      });
      
      // Reset form and close dialog
      menuForm.reset();
      setMenuItems([]);
      setMenuFormOpen(false);
      
      // Refetch menus
      refetchMenus();
    },
    onError: (error) => {
      toast({
        title: "Failed to add menu",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    }
  });

  // Update menu mutation
  const updateMenuMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: MenuFormValues }) => {
      const response = await apiRequest("PUT", `/api/caterers/menus/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Menu updated successfully",
        description: "Your menu has been updated",
      });
      
      // Reset form and close dialog
      menuForm.reset();
      setSelectedMenu(null);
      setMenuItems([]);
      setMenuFormOpen(false);
      
      // Refetch menus
      refetchMenus();
    },
    onError: (error) => {
      toast({
        title: "Failed to update menu",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    }
  });

  // Delete menu mutation
  const deleteMenuMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/caterers/menus/${id}`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Menu deleted successfully",
        description: "Your menu has been removed",
      });
      
      // Reset state
      setConfirmDeleteMenu(null);
      
      // Refetch menus
      refetchMenus();
    },
    onError: (error) => {
      toast({
        title: "Failed to delete menu",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    }
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const response = await apiRequest("PUT", "/api/caterers/profile", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile updated successfully",
        description: "Your profile information has been updated",
      });
      
      setProfileFormOpen(false);
      
      // Refresh the page to update the caterer data
      window.location.reload();
    },
    onError: (error) => {
      toast({
        title: "Failed to update profile",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    }
  });

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const response = await apiRequest("PUT", `/api/orders/${id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Order status updated",
        description: "The order status has been updated successfully",
      });
      
      // Close order details and refetch orders
      setSelectedOrder(null);
      refetchOrders();
    },
    onError: (error) => {
      toast({
        title: "Failed to update order status",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    }
  });

  // Handle order selection for viewing details
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
  };

  // Close order details
  const closeOrderDetails = () => {
    setSelectedOrder(null);
  };

  // Open menu form for adding new menu
  const openAddMenuForm = () => {
    menuForm.reset({
      name: "",
      mealType: "",
      pricePerPlate: 250,
      description: "",
      items: [],
      isVegetarian: false,
      isSpecial: false,
    });
    setMenuItems([]);
    setSelectedMenu(null);
    setMenuFormOpen(true);
  };

  // Open menu form for editing existing menu
  const openEditMenuForm = (menu: Menu) => {
    menuForm.reset({
      name: menu.name,
      mealType: menu.mealType,
      pricePerPlate: menu.pricePerPlate,
      description: menu.description || "",
      items: menu.items,
      isVegetarian: menu.isVegetarian,
      isSpecial: menu.isSpecial,
    });
    setMenuItems(menu.items);
    setSelectedMenu(menu);
    setMenuFormOpen(true);
  };

  // Open profile form
  const openProfileForm = () => {
    profileForm.reset({
      businessName: caterer?.businessName || "",
      description: caterer?.description || "",
      location: caterer?.location || "",
      city: caterer?.city || "",
      state: caterer?.state || "",
      minPlate: caterer?.minPlate || 50,
      maxPlate: caterer?.maxPlate || 500,
      eventTypes: caterer?.eventTypes || [],
      specialties: caterer?.specialties || [],
    });
    setProfileFormOpen(true);
  };

  // Handle adding a menu item
  const addMenuItem = () => {
    if (newMenuItem.trim()) {
      setMenuItems([...menuItems, newMenuItem.trim()]);
      setNewMenuItem("");
      
      // Update form value
      menuForm.setValue("items", [...menuItems, newMenuItem.trim()]);
    }
  };

  // Handle removing a menu item
  const removeMenuItem = (index: number) => {
    const updatedItems = [...menuItems];
    updatedItems.splice(index, 1);
    setMenuItems(updatedItems);
    
    // Update form value
    menuForm.setValue("items", updatedItems);
  };

  // Handle menu form submission
  const onMenuSubmit = (values: MenuFormValues) => {
    // Update items with current menuItems state
    values.items = menuItems;
    
    if (selectedMenu) {
      // Update existing menu
      updateMenuMutation.mutate({ id: selectedMenu.id, data: values });
    } else {
      // Add new menu
      addMenuMutation.mutate(values);
    }
  };

  // Handle profile form submission
  const onProfileSubmit = (values: ProfileFormValues) => {
    updateProfileMutation.mutate(values);
  };

  // Update order status
  const updateOrderStatus = (status: string) => {
    if (!selectedOrder) return;
    
    updateOrderStatusMutation.mutate({ id: selectedOrder.id, status });
  };

  // Calculate dashboard stats
  const calculateStats = (): DashboardStats => {
    if (isLoadingOrders || isLoadingReviews) {
      return {
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalRevenue: 0,
        averageRating: 0,
        reviewCount: 0
      };
    }
    
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => 
      ["pending", "confirmed", "preparing", "ready"].includes(order.status)
    ).length;
    const completedOrders = orders.filter(order => order.status === "delivered").length;
    const totalRevenue = orders
      .filter(order => order.status !== "cancelled")
      .reduce((sum, order) => sum + order.totalPrice, 0);
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
    
    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
      averageRating,
      reviewCount: reviews.length
    };
  };

  // Filter orders based on status and date
  const filteredOrders = orders.filter(order => {
    // Filter by status
    if (orderStatusFilter !== "all" && order.status !== orderStatusFilter) {
      return false;
    }
    
    // Filter by date
    const orderDate = new Date(order.eventDate);
    const today = new Date();
    
    if (orderDateFilter === "upcoming" && orderDate < today) {
      return false;
    } else if (orderDateFilter === "past" && orderDate >= today) {
      return false;
    }
    
    return true;
  });

  // Utility functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>;
      case "confirmed":
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Confirmed</Badge>;
      case "preparing":
        return <Badge variant="outline" className="text-orange-600 border-orange-600">Preparing</Badge>;
      case "ready":
        return <Badge variant="outline" className="text-green-600 border-green-600">Ready</Badge>;
      case "delivered":
        return <Badge className="bg-green-600">Delivered</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatEventType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const formatMealType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Calculate dashboard stats
  const stats = calculateStats();

  if (!user || !caterer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
              <p className="text-neutral-600 dark:text-neutral-400">Loading dashboard information...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-poppins mb-2 dark:text-white">Caterer Dashboard</h1>
          <p className="text-neutral-600 dark:text-neutral-300">
            Manage your catering business, menus, and orders
          </p>
        </div>
        <Button 
          className="mt-4 md:mt-0 bg-primary text-white hover:bg-primary/90"
          onClick={openProfileForm}
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
      </div>

      {/* Caterer Profile Card */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="h-20 w-20 border-4 border-white shadow-md">
              <AvatarFallback className="bg-primary text-white text-2xl font-bold">
                {caterer.businessName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2 text-center md:text-left flex-1">
              <h2 className="text-2xl font-semibold dark:text-white">{caterer.businessName}</h2>
              {caterer.rating && (
                <div className="flex items-center justify-center md:justify-start">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`h-5 w-5 ${
                          star <= (caterer.rating || 0) 
                            ? "text-yellow-400 fill-yellow-400" 
                            : "text-neutral-300"
                        }`} 
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-neutral-600 dark:text-neutral-400">
                    {caterer.rating.toFixed(1)} ({caterer.reviewCount} reviews)
                  </span>
                </div>
              )}
              <div className="flex flex-col md:flex-row gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                <div className="flex items-center justify-center md:justify-start">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{caterer.location}, {caterer.city}, {caterer.state}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start">
                  <Users className="h-4 w-4 mr-1" />
                  <span>Capacity: {caterer.minPlate} - {caterer.maxPlate} plates</span>
                </div>
              </div>
              {caterer.description && (
                <p className="text-neutral-700 dark:text-neutral-300 mt-2 max-w-3xl">
                  {caterer.description}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Content */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="menus">Menus</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Orders Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Orders</p>
                    <h3 className="text-2xl font-bold mt-1 dark:text-white">{stats.totalOrders}</h3>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                    <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pending Orders Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Pending Orders</p>
                    <h3 className="text-2xl font-bold mt-1 dark:text-white">{stats.pendingOrders}</h3>
                  </div>
                  <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-full">
                    <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Revenue Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Revenue</p>
                    <h3 className="text-2xl font-bold mt-1 dark:text-white">₹{stats.totalRevenue.toLocaleString()}</h3>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                    <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Average Rating Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Average Rating</p>
                    <div className="flex items-center mt-1">
                      <h3 className="text-2xl font-bold dark:text-white">{stats.averageRating.toFixed(1)}/5</h3>
                      <span className="text-sm text-neutral-500 dark:text-neutral-400 ml-2">({stats.reviewCount})</span>
                    </div>
                  </div>
                  <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
                    <Star className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders & Reviews */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>
                  Your most recent order requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingOrders ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="w-full h-14" />
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-10 w-10 mx-auto text-neutral-400 mb-3" />
                    <p className="text-neutral-600 dark:text-neutral-400">No orders yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                        <div>
                          <p className="font-medium dark:text-white">Order #{order.id}</p>
                          <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{formatDate(order.eventDate)}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          {getStatusBadge(order.status)}
                          <span className="text-sm mt-1 text-neutral-600 dark:text-neutral-400">
                            ₹{order.totalPrice}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button 
                  variant="ghost" 
                  className="ml-auto"
                  onClick={() => setActiveTab("orders")}
                >
                  View All
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>

            {/* Recent Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Reviews</CardTitle>
                <CardDescription>
                  What customers are saying about you
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingReviews ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="w-full h-14" />
                    ))}
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-8">
                    <Star className="h-10 w-10 mx-auto text-neutral-400 mb-3" />
                    <p className="text-neutral-600 dark:text-neutral-400">No reviews yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.slice(0, 5).map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-0">
                        <div className="flex justify-between mb-2">
                          <p className="font-medium dark:text-white">{review.userName || "Anonymous User"}</p>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star} 
                                className={`h-4 w-4 ${
                                  star <= review.rating 
                                    ? "text-yellow-400 fill-yellow-400" 
                                    : "text-neutral-300"
                                }`} 
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {review.comment || "No comment provided"}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manage Orders</CardTitle>
              <CardDescription>
                View and update the status of your customer orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="preparing">Preparing</SelectItem>
                      <SelectItem value="ready">Ready</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={orderDateFilter} onValueChange={setOrderDateFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Dates</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="past">Past</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-400">
                  <Filter className="mr-2 h-4 w-4" />
                  <span>{filteredOrders.length} orders found</span>
                </div>
              </div>

              {isLoadingOrders ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <Card key={i} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="p-6">
                          <Skeleton className="h-6 w-1/3 mb-4" />
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="mx-auto h-12 w-12 text-neutral-400 mb-3" />
                  <h3 className="text-xl font-semibold mb-2 dark:text-white">No orders found</h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Try changing your filters or check back later
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <Card key={order.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <CardContent className="p-0">
                        <div className="p-6">
                          <div className="flex flex-col md:flex-row justify-between mb-4 gap-3">
                            <div>
                              <h3 className="text-lg font-semibold dark:text-white mb-1">
                                Order #{order.id} - {order.userName || "Customer"}
                              </h3>
                              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                {formatEventType(order.eventType)} • {order.noOfPlates} plates
                              </p>
                            </div>
                            <div className="flex items-start md:items-center">
                              {getStatusBadge(order.status)}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm mb-4">
                            <div className="flex items-center text-neutral-700 dark:text-neutral-300">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>{formatDate(order.eventDate)}</span>
                            </div>
                            <div className="flex items-center text-neutral-700 dark:text-neutral-300">
                              <Clock className="h-4 w-4 mr-2" />
                              <span>{formatTime(order.eventTime)}</span>
                            </div>
                            <div className="flex items-center text-neutral-700 dark:text-neutral-300">
                              <MapPin className="h-4 w-4 mr-2" />
                              <span>{order.city}, {order.state}</span>
                            </div>
                            <div className="flex items-center text-neutral-700 dark:text-neutral-300">
                              <DollarSign className="h-4 w-4 mr-2" />
                              <span>₹{order.totalPrice}</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-end">
                            <Button 
                              variant="outline" 
                              className="text-primary border-primary hover:bg-primary hover:text-white"
                              onClick={() => handleViewOrder(order)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Menus Tab */}
        <TabsContent value="menus" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <CardTitle>Manage Menus</CardTitle>
                <CardDescription>
                  Create and manage menus for different events
                </CardDescription>
              </div>
              <Button 
                className="mt-4 sm:mt-0 bg-primary text-white hover:bg-primary/90"
                onClick={openAddMenuForm}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Menu
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingMenus ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => (
                    <Card key={i} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="p-6">
                          <Skeleton className="h-6 w-1/2 mb-4" />
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-4 w-full mb-4" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : menus.length === 0 ? (
                <div className="text-center py-12">
                  <Utensils className="mx-auto h-12 w-12 text-neutral-400 mb-3" />
                  <h3 className="text-xl font-semibold mb-2 dark:text-white">No menus yet</h3>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                    Create your first menu to start accepting orders
                  </p>
                  <Button 
                    onClick={openAddMenuForm} 
                    className="bg-primary text-white hover:bg-primary/90"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Menu
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {menus.map((menu) => (
                    <Card key={menu.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="bg-neutral-100 dark:bg-neutral-800 p-4 border-b">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-semibold font-poppins text-lg dark:text-white">{menu.name}</h3>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Menu Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => openEditMenuForm(menu)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Menu
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => setConfirmDeleteMenu(menu.id)}
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete Menu
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="flex items-center text-sm text-neutral-700 dark:text-neutral-300">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>{formatMealType(menu.mealType)}</span>
                          {menu.isVegetarian && (
                            <Badge className="ml-2 bg-green-600">Veg</Badge>
                          )}
                          {menu.isSpecial && (
                            <Badge className="ml-2 bg-yellow-600">Special</Badge>
                          )}
                        </div>
                      </div>
                      
                      <CardContent className="p-4">
                        {menu.description && (
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">{menu.description}</p>
                        )}
                        
                        <div className="mb-4">
                          <h4 className="font-medium mb-2 text-neutral-800 dark:text-neutral-200">Items:</h4>
                          <ul className="text-sm space-y-1 text-neutral-700 dark:text-neutral-300">
                            {menu.items.map((item, index) => (
                              <li key={index} className="flex items-start">
                                <ChevronRight className="h-4 w-4 mr-1 shrink-0 mt-0.5" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="text-xl font-semibold text-primary">
                            ₹{menu.pricePerPlate.toLocaleString()}
                            <span className="text-sm font-normal text-neutral-600 dark:text-neutral-400"> per plate</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={closeOrderDetails}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order #{selectedOrder?.id} - {selectedOrder?.userName || "Customer"}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold dark:text-white mb-2">Event Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        <p className="text-neutral-600 dark:text-neutral-400">
                          {formatEventType(selectedOrder.eventType)} - {selectedOrder.noOfPlates} plates
                        </p>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <p className="text-neutral-600 dark:text-neutral-400">
                          {formatDate(selectedOrder.eventDate)}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <p className="text-neutral-600 dark:text-neutral-400">
                          {formatTime(selectedOrder.eventTime)}
                        </p>
                      </div>
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 mr-2 mt-0.5" />
                        <div>
                          <p className="text-neutral-600 dark:text-neutral-400">
                            {selectedOrder.address}
                          </p>
                          <p className="text-neutral-600 dark:text-neutral-400">
                            {selectedOrder.city}, {selectedOrder.state}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {selectedOrder.specialInstructions && (
                    <div>
                      <h3 className="text-lg font-semibold dark:text-white mb-2">Special Instructions</h3>
                      <p className="text-neutral-600 dark:text-neutral-400 text-sm bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg">
                        {selectedOrder.specialInstructions}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold dark:text-white mb-2">Order Details</h3>
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <p className="text-neutral-600 dark:text-neutral-400">Status:</p>
                        <div>{getStatusBadge(selectedOrder.status)}</div>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-neutral-600 dark:text-neutral-400">Menu ID:</p>
                        <p className="font-medium dark:text-white">{selectedOrder.menuId}</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-neutral-600 dark:text-neutral-400">Number of plates:</p>
                        <p className="font-medium dark:text-white">{selectedOrder.noOfPlates}</p>
                      </div>
                      <div className="flex justify-between border-t pt-2 mt-2">
                        <p className="font-semibold dark:text-white">Total:</p>
                        <p className="font-bold text-primary">₹{selectedOrder.totalPrice}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold dark:text-white mb-2">Update Status</h3>
                    <div className="space-y-3">
                      {selectedOrder.status === "pending" && (
                        <div className="grid grid-cols-2 gap-2">
                          <Button 
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => updateOrderStatus("confirmed")}
                            disabled={updateOrderStatusMutation.isPending}
                          >
                            Confirm Order
                          </Button>
                          <Button 
                            variant="destructive"
                            onClick={() => updateOrderStatus("cancelled")}
                            disabled={updateOrderStatusMutation.isPending}
                          >
                            Cancel Order
                          </Button>
                        </div>
                      )}
                      
                      {selectedOrder.status === "confirmed" && (
                        <Button 
                          className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                          onClick={() => updateOrderStatus("preparing")}
                          disabled={updateOrderStatusMutation.isPending}
                        >
                          Start Preparation
                        </Button>
                      )}
                      
                      {selectedOrder.status === "preparing" && (
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => updateOrderStatus("ready")}
                          disabled={updateOrderStatusMutation.isPending}
                        >
                          Mark as Ready
                        </Button>
                      )}
                      
                      {selectedOrder.status === "ready" && (
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => updateOrderStatus("delivered")}
                          disabled={updateOrderStatusMutation.isPending}
                        >
                          Mark as Delivered
                        </Button>
                      )}
                      
                      {updateOrderStatusMutation.isPending && (
                        <div className="flex items-center justify-center text-sm text-neutral-600 dark:text-neutral-400">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating status...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Menu Form Dialog */}
      <Dialog open={menuFormOpen} onOpenChange={setMenuFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedMenu ? "Edit Menu" : "Add New Menu"}</DialogTitle>
            <DialogDescription>
              {selectedMenu 
                ? "Update your menu information" 
                : "Create a new menu to offer to your customers"}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...menuForm}>
            <form onSubmit={menuForm.handleSubmit(onMenuSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={menuForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Menu Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Premium Wedding Package" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={menuForm.control}
                  name="mealType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meal Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select meal type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mealTypes.map(type => (
                            <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={menuForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your menu" 
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Highlight the specialties and unique features of this menu
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={menuForm.control}
                name="pricePerPlate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price Per Plate (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" min={50} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-3">
                <FormField
                  control={menuForm.control}
                  name="items"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Menu Items</FormLabel>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Add an item (e.g. Paneer Butter Masala)" 
                          value={newMenuItem}
                          onChange={(e) => setNewMenuItem(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addMenuItem();
                            }
                          }}
                        />
                        <Button 
                          type="button" 
                          onClick={addMenuItem}
                          variant="secondary"
                        >
                          Add
                        </Button>
                      </div>
                      <FormDescription>
                        Add all the dishes included in this menu
                      </FormDescription>
                      <FormMessage />
                      
                      <div className="mt-3 space-y-2">
                        {menuItems.length === 0 ? (
                          <p className="text-sm text-neutral-500">No items added yet</p>
                        ) : (
                          menuItems.map((item, index) => (
                            <div key={index} className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-800 p-2 rounded-md">
                              <span className="text-sm">{item}</span>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => removeMenuItem(index)}
                                className="h-7 w-7"
                              >
                                <Trash className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex flex-col space-y-3">
                <FormField
                  control={menuForm.control}
                  name="isVegetarian"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Vegetarian Menu</FormLabel>
                        <FormDescription>
                          This menu contains only vegetarian items
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={menuForm.control}
                  name="isSpecial"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Special Menu</FormLabel>
                        <FormDescription>
                          Mark this as a special or featured menu
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setMenuFormOpen(false)}
                  disabled={addMenuMutation.isPending || updateMenuMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-primary text-white hover:bg-primary/90"
                  disabled={addMenuMutation.isPending || updateMenuMutation.isPending}
                >
                  {(addMenuMutation.isPending || updateMenuMutation.isPending) ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {selectedMenu ? "Updating..." : "Saving..."}
                    </>
                  ) : (
                    <>
                      {selectedMenu ? "Update Menu" : "Save Menu"}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={profileFormOpen} onOpenChange={setProfileFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Caterer Profile</DialogTitle>
            <DialogDescription>
              Update your business information
            </DialogDescription>
          </DialogHeader>
          
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
              <FormField
                control={profileForm.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your catering business name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={profileForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your catering business" 
                        className="resize-none min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Tell customers about your specialties, experience, and unique services
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={profileForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Area</FormLabel>
                      <FormControl>
                        <Input placeholder="Primary service area" {...field} />
                      </FormControl>
                      <FormDescription>
                        Where you primarily offer catering services
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={profileForm.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="City" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="State" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={profileForm.control}
                  name="minPlate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Plate Count</FormLabel>
                      <FormControl>
                        <Input type="number" min={10} {...field} />
                      </FormControl>
                      <FormDescription>
                        Minimum number of plates per order
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={profileForm.control}
                  name="maxPlate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Plate Count</FormLabel>
                      <FormControl>
                        <Input type="number" min={50} {...field} />
                      </FormControl>
                      <FormDescription>
                        Maximum number of plates you can handle
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={profileForm.control}
                name="eventTypes"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Event Types</FormLabel>
                      <FormDescription>
                        Select the types of events you cater for
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {eventTypes.map((type) => (
                        <FormField
                          key={type.id}
                          control={profileForm.control}
                          name="eventTypes"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={type.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(type.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, type.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== type.id
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {type.label}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={profileForm.control}
                name="specialties"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Cuisine Specialties</FormLabel>
                      <FormDescription>
                        Select the cuisines you specialize in
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {specialtiesList.map((specialty) => (
                        <FormField
                          key={specialty.id}
                          control={profileForm.control}
                          name="specialties"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={specialty.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(specialty.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, specialty.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== specialty.id
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {specialty.label}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setProfileFormOpen(false)}
                  disabled={updateProfileMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-primary text-white hover:bg-primary/90"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating Profile...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Menu Confirmation Dialog */}
      <Dialog 
        open={confirmDeleteMenu !== null} 
        onOpenChange={(open) => !open && setConfirmDeleteMenu(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Menu Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this menu? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setConfirmDeleteMenu(null)}
              disabled={deleteMenuMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => confirmDeleteMenu && deleteMenuMutation.mutate(confirmDeleteMenu)}
              disabled={deleteMenuMutation.isPending}
            >
              {deleteMenuMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Menu"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CatererDashboard;
