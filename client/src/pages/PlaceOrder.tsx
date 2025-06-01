import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users,
  ArrowLeft,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

type Caterer = {
  id: number;
  businessName: string;
  minPlate: number;
  maxPlate: number;
};

type Menu = {
  id: number;
  name: string;
  mealType: string;
  pricePerPlate: number;
  description?: string;
  items: string[];
  isVegetarian: boolean;
};

// Schema for the order form
const orderFormSchema = z.object({
  eventType: z.string().min(1, "Event type is required"),
  noOfPlates: z.coerce.number()
    .min(10, "Minimum plate count must be at least 10")
    .refine(val => val >= 50, "Minimum plate count must be at least 50"),
  eventDate: z.string().min(1, "Event date is required"),
  eventTime: z.string().min(1, "Event time is required"),
  address: z.string().min(10, "Full address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  specialInstructions: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

const PlaceOrder = () => {
  const { catererId, menuId } = useParams();
  const catId = catererId ? parseInt(catererId) : 0;
  const mId = menuId ? parseInt(menuId) : 0;
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isConfirming, setIsConfirming] = useState(false);
  
  // Format date for the date input min value (today)
  const today = new Date();
  const formattedToday = today.toISOString().split('T')[0];

  // Get caterer and menu details
  const { data: catererData, isLoading: isLoadingCaterer } = useQuery<Caterer>({
    queryKey: [`/api/caterers/${catId}`],
  });

  const { data: menuData, isLoading: isLoadingMenu } = useQuery<Menu>({
    queryKey: [`/api/caterers/${catId}/menus/${mId}`],
  });

  // Initialize form with the default values
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      eventType: "",
      noOfPlates: 100,
      eventDate: formattedToday,
      eventTime: "12:00",
      address: user?.address || "",
      city: user?.city || "",
      state: user?.state || "",
      specialInstructions: "",
    },
  });

  // Watch the number of plates for price calculation
  const plates = form.watch("noOfPlates");
  
  // Calculate total price
  const calculateTotal = () => {
    if (!menuData) return 0;
    return plates * menuData.pricePerPlate;
  };

  // Place order mutation
  const placeMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Order placed successfully!",
        description: "Your order has been confirmed. You can track it in your dashboard.",
      });
      
      // Invalidate orders query to refresh user dashboard
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      
      // Navigate to user dashboard
      navigate("/dashboard");
    },
    onError: (error) => {
      setIsConfirming(false);
      
      let errorMessage = "Failed to place order. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Order failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });

  const onSubmit = (values: OrderFormValues) => {
    // Show confirmation step
    setIsConfirming(true);
  };

  const confirmOrder = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to place an order",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    const values = form.getValues();
    
    const orderData = {
      catererId: catId,
      menuId: mId,
      eventType: values.eventType,
      noOfPlates: values.noOfPlates,
      totalPrice: calculateTotal(),
      eventDate: new Date(values.eventDate).toISOString(),
      eventTime: values.eventTime,
      address: values.address,
      city: values.city,
      state: values.state,
      specialInstructions: values.specialInstructions,
    };

    placeMutation.mutate(orderData);
  };

  const goBack = () => {
    if (isConfirming) {
      setIsConfirming(false);
    } else {
      navigate(`/caterer/${catId}`);
    }
  };

  // Format meal type for display
  const formatMealType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Login Required</CardTitle>
            <CardDescription>
              You need to be logged in to place an order
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <AlertCircle className="h-16 w-16 text-primary mb-4" />
            <p className="text-center mb-6">
              Please login or create an account to continue with your order
            </p>
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
              <Button 
                className="bg-primary text-white hover:bg-primary/90"
                onClick={() => navigate("/register")}
              >
                Register
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        className="mb-4 pl-0"
        onClick={goBack}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {isConfirming ? "Back to Order Form" : "Back to Caterer"}
      </Button>
      
      <h1 className="text-3xl font-bold font-poppins mb-6 dark:text-white">
        {isConfirming ? "Confirm Your Order" : "Place Your Order"}
      </h1>

      {(isLoadingCaterer || isLoadingMenu) ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Skeleton className="h-12 w-1/3 mb-4" />
            <Skeleton className="h-64 w-full mb-4" />
            <Skeleton className="h-12 w-full" />
          </div>
          <div>
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      ) : isConfirming ? (
        // Order confirmation view
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>
                  Please review your order details before confirming
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg dark:text-white">Menu Details</h3>
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">Caterer:</span>
                    <span className="font-medium dark:text-white">{catererData?.businessName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">Menu:</span>
                    <span className="font-medium dark:text-white">{menuData?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">Meal Type:</span>
                    <span className="font-medium dark:text-white">{menuData ? formatMealType(menuData.mealType) : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">Price Per Plate:</span>
                    <span className="font-medium dark:text-white">₹{menuData?.pricePerPlate}</span>
                  </div>
                </div>
                
                <Separator />

                <div className="space-y-3">
                  <h3 className="font-semibold text-lg dark:text-white">Event Details</h3>
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">Event Type:</span>
                    <span className="font-medium dark:text-white">
                      {form.getValues().eventType.charAt(0).toUpperCase() + form.getValues().eventType.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">Number of Plates:</span>
                    <span className="font-medium dark:text-white">{form.getValues().noOfPlates}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">Event Date:</span>
                    <span className="font-medium dark:text-white">
                      {new Date(form.getValues().eventDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">Event Time:</span>
                    <span className="font-medium dark:text-white">{form.getValues().eventTime}</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg dark:text-white">Delivery Details</h3>
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">Address:</span>
                    <span className="font-medium dark:text-white text-right">{form.getValues().address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">City:</span>
                    <span className="font-medium dark:text-white">{form.getValues().city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">State:</span>
                    <span className="font-medium dark:text-white">{form.getValues().state}</span>
                  </div>
                </div>
                
                {form.getValues().specialInstructions && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg dark:text-white">Special Instructions</h3>
                      <p className="text-neutral-700 dark:text-neutral-300">
                        {form.getValues().specialInstructions}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-lg">
                  <span className="text-neutral-600 dark:text-neutral-400">Subtotal:</span>
                  <span className="font-medium dark:text-white">₹{calculateTotal()}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-neutral-600 dark:text-neutral-400">Delivery Fee:</span>
                  <span className="font-medium dark:text-white">₹0</span>
                </div>
                <Separator />
                <div className="flex justify-between text-xl">
                  <span className="font-semibold dark:text-white">Total:</span>
                  <span className="font-bold text-primary">₹{calculateTotal()}</span>
                </div>
                
                <div className="mt-6">
                  <Button 
                    className="w-full bg-primary text-white hover:bg-primary/90 h-12 text-lg"
                    onClick={confirmOrder}
                    disabled={placeMutation.isPending}
                  >
                    {placeMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-5 w-5" />
                        Confirm & Pay ₹{calculateTotal()}
                      </>
                    )}
                  </Button>
                  
                  <p className="text-sm text-center mt-4 text-neutral-500 dark:text-neutral-400">
                    By confirming, you agree to our terms and conditions
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        // Order form view
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
                <CardDescription>
                  Fill in the details for your catering order
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="eventType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Event Type</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select event type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="wedding">Wedding</SelectItem>
                                  <SelectItem value="corporate">Corporate</SelectItem>
                                  <SelectItem value="pooja">Traditional Pooja</SelectItem>
                                  <SelectItem value="party">Private Party</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="noOfPlates"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Number of Plates</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min={catererData?.minPlate || 50}
                                  max={catererData?.maxPlate || 1000}
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Min: {catererData?.minPlate || 50}, Max: {catererData?.maxPlate || 1000}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="eventDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Event Date</FormLabel>
                              <FormControl>
                                <Input 
                                  type="date" 
                                  min={formattedToday}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="eventTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Event Time</FormLabel>
                              <FormControl>
                                <Input 
                                  type="time" 
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg dark:text-white">Delivery Address</h3>
                      
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Address</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter complete address including building name, street, etc."
                                className="min-h-[80px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter city" 
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter state" 
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="specialInstructions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Special Instructions (Optional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Any specific requirements or dietary preferences"
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Include details about dietary restrictions, allergies, or specific requirements
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-primary text-white hover:bg-primary/90"
                    >
                      Review Order
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="font-medium text-lg dark:text-white mb-2">
                    {menuData?.name}
                  </div>
                  <div className="flex items-center text-neutral-700 dark:text-neutral-300 text-sm">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{catererData?.businessName}</span>
                  </div>
                  <div className="flex items-center text-neutral-700 dark:text-neutral-300 text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{menuData ? formatMealType(menuData.mealType) : ''}</span>
                  </div>
                  {menuData?.isVegetarian && (
                    <div className="flex items-center text-green-600 text-sm">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span>Pure Vegetarian</span>
                    </div>
                  )}
                </div>

                <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-neutral-700 dark:text-neutral-300">Price per plate:</span>
                    <span className="font-medium dark:text-white">₹{menuData?.pricePerPlate}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-neutral-700 dark:text-neutral-300">Number of plates:</span>
                    <span className="font-medium dark:text-white">{plates}</span>
                  </div>
                  <div className="flex justify-between mt-4 text-lg">
                    <span className="font-semibold dark:text-white">Total:</span>
                    <span className="font-bold text-primary">₹{calculateTotal()}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium dark:text-white">Items Included:</h3>
                  <ul className="text-sm space-y-1 text-neutral-700 dark:text-neutral-300">
                    {menuData?.items.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-4 w-4 mr-2 shrink-0 mt-0.5 text-green-600" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaceOrder;
