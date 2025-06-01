import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Package, 
  Star, 
  ChevronRight,
  Utensils,
  Building,
  Mail,
  Phone,
  CreditCard,
  X,
  Users,
  FileText,
  Truck,
  Check,
  ArrowRight,
  Eye,
  Loader2
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

type Order = {
  id: number;
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
  catererName?: string;
  menuName?: string;
};

type OrderWithDetails = Order & {
  caterer?: {
    id: number;
    businessName: string;
    location: string;
    city: string;
    state: string;
    minPlate: number;
    maxPlate: number;
    rating?: number;
  };
  menu?: {
    id: number;
    name: string;
    mealType: string;
    pricePerPlate: number;
    items: string[];
    isVegetarian: boolean;
  };
  userName?: string;
};

type Review = {
  id: number;
  userId: number;
  catererId: number;
  orderId: number;
  rating: number;
  comment?: string;
  createdAt: string;
};

const UserDashboard = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to access the dashboard",
        variant: "destructive",
      });
      navigate("/login");
    }
  }, [user, navigate, toast]);

  // Fetch user orders
  const { 
    data: orders = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: !!user,
  });

  // Fetch specific order details
  const {
    data: orderDetails,
    isLoading: isLoadingDetails,
    refetch: refetchDetails
  } = useQuery<OrderWithDetails>({
    queryKey: [`/api/orders/${selectedOrder?.id}`],
    enabled: !!selectedOrder,
  });

  // Handle order selection for viewing details
  const handleViewOrder = async (order: Order) => {
    setSelectedOrder(order);
  };

  // Close order details modal
  const closeDetails = () => {
    setSelectedOrder(null);
  };

  // Open review dialog
  const openReviewDialog = (order: OrderWithDetails) => {
    setSelectedOrder(order);
    setReviewOpen(true);
    setReviewRating(5);
    setReviewComment("");
  };

  // Submit review
  const submitReview = async () => {
    if (!selectedOrder) return;
    
    setIsSubmittingReview(true);
    
    try {
      await apiRequest("POST", `/api/orders/${selectedOrder.id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment
      });
      
      setReviewOpen(false);
      
      toast({
        title: "Review submitted successfully",
        description: "Thank you for your feedback!",
      });
      
      // Refetch orders to update status
      refetch();
      
    } catch (error) {
      toast({
        title: "Failed to submit review",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

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

  const canReview = (order: Order) => {
    return order.status === "delivered";
  };

  // Filter orders based on active tab
  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.eventDate);
    const today = new Date();
    
    if (activeTab === "upcoming") {
      return orderDate >= today && order.status !== "cancelled";
    } else if (activeTab === "past") {
      return orderDate < today || order.status === "delivered" || order.status === "cancelled";
    }
    
    return true;
  });

  if (error) {
    toast({
      title: "Error fetching orders",
      description: "Please try again later",
      variant: "destructive",
    });
  }

  // Show loading or no user state
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
              <p className="text-neutral-600 dark:text-neutral-400">Loading user information...</p>
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
          <h1 className="text-3xl font-bold font-poppins mb-2 dark:text-white">My Dashboard</h1>
          <p className="text-neutral-600 dark:text-neutral-300">
            Manage your orders and track their status
          </p>
        </div>
        <Button 
          className="mt-4 md:mt-0 bg-primary text-white hover:bg-primary/90"
          onClick={() => navigate("/browse")}
        >
          <Utensils className="mr-2 h-4 w-4" />
          Browse Caterers
        </Button>
      </div>

      {/* User Profile Card */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="h-20 w-20 border-4 border-white shadow-md">
              <AvatarFallback className="bg-primary text-white text-2xl font-bold">
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-2xl font-semibold dark:text-white">{user.name}</h2>
              <div className="flex flex-col md:flex-row gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                <div className="flex items-center justify-center md:justify-start">
                  <Mail className="h-4 w-4 mr-1" />
                  <span>{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center justify-center md:justify-start">
                    <Phone className="h-4 w-4 mr-1" />
                    <span>{user.phone}</span>
                  </div>
                )}
                {user.city && user.state && (
                  <div className="flex items-center justify-center md:justify-start">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{user.city}, {user.state}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Section */}
      <Card>
        <CardHeader>
          <CardTitle>My Orders</CardTitle>
          <CardDescription>
            View and manage your catering orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs 
            defaultValue="upcoming" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="upcoming">Upcoming Orders</TabsTrigger>
              <TabsTrigger value="past">Past Orders</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming" className="space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
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
                  <Calendar className="mx-auto h-12 w-12 text-neutral-400 mb-3" />
                  <h3 className="text-xl font-semibold mb-2 dark:text-white">No upcoming orders</h3>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                    You don't have any upcoming catering orders
                  </p>
                  <Button 
                    onClick={() => navigate("/browse")} 
                    className="bg-primary text-white hover:bg-primary/90"
                  >
                    Browse Caterers
                  </Button>
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
                                {order.catererName} - {order.menuName}
                              </h3>
                              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                Order #{order.id} • {formatEventType(order.eventType)} • {order.noOfPlates} plates
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
                              <CreditCard className="h-4 w-4 mr-2" />
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
            </TabsContent>
            
            <TabsContent value="past" className="space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
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
                  <FileText className="mx-auto h-12 w-12 text-neutral-400 mb-3" />
                  <h3 className="text-xl font-semibold mb-2 dark:text-white">No past orders</h3>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                    You don't have any past catering orders
                  </p>
                  <Button 
                    onClick={() => navigate("/browse")} 
                    className="bg-primary text-white hover:bg-primary/90"
                  >
                    Browse Caterers
                  </Button>
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
                                {order.catererName} - {order.menuName}
                              </h3>
                              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                Order #{order.id} • {formatEventType(order.eventType)} • {order.noOfPlates} plates
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
                              <CreditCard className="h-4 w-4 mr-2" />
                              <span>₹{order.totalPrice}</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              className="text-primary border-primary hover:bg-primary hover:text-white"
                              onClick={() => handleViewOrder(order)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Button>
                            
                            {canReview(order) && (
                              <Button 
                                className="bg-primary text-white hover:bg-primary/90"
                                onClick={() => openReviewDialog(order as OrderWithDetails)}
                              >
                                <Star className="mr-2 h-4 w-4" />
                                Add Review
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={closeDetails}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order #{selectedOrder?.id} - Placed on {selectedOrder ? formatDate(selectedOrder.createdAt) : ''}
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingDetails || !orderDetails ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-6 w-1/2 mb-2" />
              <Skeleton className="h-4 w-full mb-6" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Skeleton className="h-6 w-1/3 mb-2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-6 w-1/3 mb-2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold dark:text-white mb-2">Caterer Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start">
                        <Building className="h-4 w-4 mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium dark:text-white">{orderDetails.caterer?.businessName}</p>
                          <p className="text-neutral-600 dark:text-neutral-400">
                            {orderDetails.caterer?.location}, {orderDetails.caterer?.city}, {orderDetails.caterer?.state}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold dark:text-white mb-2">Menu Details</h3>
                    <div className="space-y-2 text-sm">
                      <p className="font-medium dark:text-white">{orderDetails.menu?.name}</p>
                      <p className="text-neutral-600 dark:text-neutral-400">
                        Price per plate: ₹{orderDetails.menu?.pricePerPlate}
                      </p>
                      <div className="mt-2">
                        <p className="font-medium dark:text-white mb-1">Items:</p>
                        <ul className="text-neutral-600 dark:text-neutral-400 space-y-1">
                          {orderDetails.menu?.items.map((item, index) => (
                            <li key={index} className="flex items-start">
                              <ChevronRight className="h-4 w-4 mr-1 shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold dark:text-white mb-2">Event Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <p className="text-neutral-600 dark:text-neutral-400">
                          {formatDate(orderDetails.eventDate)}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <p className="text-neutral-600 dark:text-neutral-400">
                          {formatTime(orderDetails.eventTime)}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        <p className="text-neutral-600 dark:text-neutral-400">
                          {orderDetails.noOfPlates} plates
                        </p>
                      </div>
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 mr-2 mt-0.5" />
                        <div>
                          <p className="text-neutral-600 dark:text-neutral-400">
                            {orderDetails.address}
                          </p>
                          <p className="text-neutral-600 dark:text-neutral-400">
                            {orderDetails.city}, {orderDetails.state}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold dark:text-white mb-2">Order Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <p className="text-neutral-600 dark:text-neutral-400">
                          Status:
                        </p>
                        <div>
                          {getStatusBadge(orderDetails.status)}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-neutral-600 dark:text-neutral-400">
                          Price per plate:
                        </p>
                        <p className="font-medium dark:text-white">
                          ₹{orderDetails.menu?.pricePerPlate}
                        </p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-neutral-600 dark:text-neutral-400">
                          Number of plates:
                        </p>
                        <p className="font-medium dark:text-white">
                          {orderDetails.noOfPlates}
                        </p>
                      </div>
                      <div className="flex justify-between border-t pt-2 mt-2">
                        <p className="font-semibold dark:text-white">
                          Total:
                        </p>
                        <p className="font-bold text-primary">
                          ₹{orderDetails.totalPrice}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {orderDetails.specialInstructions && (
                <div className="mt-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <h3 className="font-semibold dark:text-white mb-2">Special Instructions</h3>
                  <p className="text-neutral-700 dark:text-neutral-300 text-sm">
                    {orderDetails.specialInstructions}
                  </p>
                </div>
              )}
              
              <div className="mt-4">
                <div className="flex items-center space-x-2">
                  <Truck className="h-5 w-5 text-neutral-500" />
                  <h3 className="font-semibold dark:text-white">Order Status Timeline</h3>
                </div>
                
                <div className="mt-3 space-y-4">
                  <div className="relative flex">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary z-10">
                      <Check className="w-5 h-5" />
                    </div>
                    <div className="ml-4">
                      <h4 className="font-medium dark:text-white">Order Placed</h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {formatDate(orderDetails.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  {orderDetails.status !== "pending" && (
                    <div className="relative flex">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary z-10">
                        <Check className="w-5 h-5" />
                      </div>
                      <div className="ml-4">
                        <h4 className="font-medium dark:text-white">Order Confirmed</h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          Caterer has confirmed your order
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {["preparing", "ready", "delivered"].includes(orderDetails.status) && (
                    <div className="relative flex">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary z-10">
                        <Check className="w-5 h-5" />
                      </div>
                      <div className="ml-4">
                        <h4 className="font-medium dark:text-white">Preparation Started</h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          Caterer is preparing your order
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {["ready", "delivered"].includes(orderDetails.status) && (
                    <div className="relative flex">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary z-10">
                        <Check className="w-5 h-5" />
                      </div>
                      <div className="ml-4">
                        <h4 className="font-medium dark:text-white">Order Ready</h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          Your order is ready and will be delivered on time
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {orderDetails.status === "delivered" && (
                    <div className="relative flex">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-600 dark:bg-green-900 z-10">
                        <Check className="w-5 h-5" />
                      </div>
                      <div className="ml-4">
                        <h4 className="font-medium dark:text-white">Order Delivered</h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          Your order has been successfully delivered
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {orderDetails.status === "cancelled" && (
                    <div className="relative flex">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 text-red-600 dark:bg-red-900 z-10">
                        <X className="w-5 h-5" />
                      </div>
                      <div className="ml-4">
                        <h4 className="font-medium dark:text-white">Order Cancelled</h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          This order has been cancelled
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
          
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
            <Button
              variant="outline"
              onClick={closeDetails}
            >
              Close
            </Button>
            
            {orderDetails && canReview(orderDetails) && (
              <Button 
                className="bg-primary text-white hover:bg-primary/90 mb-2 sm:mb-0"
                onClick={() => openReviewDialog(orderDetails)}
              >
                <Star className="mr-2 h-4 w-4" />
                Add Review
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Review Your Order</DialogTitle>
            <DialogDescription>
              Share your experience with {selectedOrder?.catererName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="mb-6">
              <p className="text-sm font-medium mb-2 dark:text-white">Rating</p>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="focus:outline-none"
                    onClick={() => setReviewRating(star)}
                  >
                    <Star 
                      className={`h-8 w-8 ${
                        star <= reviewRating 
                          ? "text-yellow-400 fill-yellow-400" 
                          : "text-neutral-300"
                      }`} 
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block dark:text-white">
                Your Comments (Optional)
              </label>
              <Textarea
                placeholder="Share your experience with the caterer..."
                className="resize-none"
                rows={4}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReviewOpen(false)}
              disabled={isSubmittingReview}
            >
              Cancel
            </Button>
            <Button
              className="bg-primary text-white hover:bg-primary/90"
              onClick={submitReview}
              disabled={isSubmittingReview}
            >
              {isSubmittingReview ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Submit Review
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserDashboard;
