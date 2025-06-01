import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

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

const catererRegisterSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must not exceed 50 characters"),
  email: z.string()
    .email("Please enter a valid email address"),
  name: z.string()
    .min(2, "Name must be at least 2 characters"),
  phone: z.string()
    .min(10, "Phone number must be at least 10 digits"),
  address: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  password: z.string()
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
    .min(1, "Please confirm your password"),
  businessName: z.string()
    .min(3, "Business name must be at least 3 characters"),
  description: z.string()
    .min(20, "Description must be at least 20 characters"),
  location: z.string()
    .min(5, "Location must be at least 5 characters"),
  minPlate: z.coerce.number()
    .min(10, "Minimum plate count must be at least 10"),
  maxPlate: z.coerce.number()
    .min(50, "Maximum plate count must be at least 50"),
  eventTypes: z.array(z.string())
    .min(1, "Please select at least one event type"),
  specialties: z.array(z.string())
    .min(1, "Please select at least one specialty"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
}).refine((data) => data.maxPlate > data.minPlate, {
  message: "Maximum plate count must be greater than minimum plate count",
  path: ["maxPlate"],
});

type CatererRegisterFormValues = z.infer<typeof catererRegisterSchema>;

const CatererRegister = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { registerCaterer } = useAuth();
  const [, navigate] = useLocation();

  const form = useForm<CatererRegisterFormValues>({
    resolver: zodResolver(catererRegisterSchema),
    defaultValues: {
      username: "",
      email: "",
      name: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      password: "",
      confirmPassword: "",
      businessName: "",
      description: "",
      location: "",
      minPlate: 50,
      maxPlate: 500,
      eventTypes: [],
      specialties: [],
    },
  });

  const onSubmit = async (values: CatererRegisterFormValues) => {
    setIsLoading(true);
    
    try {
      await registerCaterer(values);
      
      toast({
        title: "Registration successful",
        description: "Welcome to CaterEase! You can now manage your catering business.",
      });
      
      navigate("/caterer-dashboard");
    } catch (error) {
      let errorMessage = "Registration failed. Please try again.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 flex justify-center">
      <Card className="w-full max-w-3xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Register as a Caterer</CardTitle>
          <CardDescription className="text-center">
            Join our platform to showcase your catering services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter username" 
                            {...field} 
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="Enter email address" 
                            {...field} 
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Person</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter contact person name" 
                            {...field} 
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter phone number" 
                            {...field} 
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Create a password" 
                            {...field} 
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Confirm password" 
                            {...field} 
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Business Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Business Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter business name" 
                            {...field} 
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Business Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your catering business" 
                            className="min-h-[100px]"
                            {...field} 
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormDescription>
                          Include details about your specialties, experience, and unique services.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Business Address</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter business address" 
                            {...field} 
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Service Area</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="E.g., South Mumbai" 
                            {...field} 
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormDescription>
                          Area where you primarily offer catering services
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="City" 
                              {...field} 
                              disabled={isLoading}
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
                              placeholder="State" 
                              {...field} 
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Service Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="minPlate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Plate Count</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="10"
                            {...field} 
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormDescription>
                          Minimum number of plates you accept per order
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="maxPlate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Plate Count</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="50"
                            {...field} 
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormDescription>
                          Maximum number of plates you can handle per order
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="eventTypes"
                    render={() => (
                      <FormItem className="col-span-2">
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
                              control={form.control}
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
                                        disabled={isLoading}
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
                    control={form.control}
                    name="specialties"
                    render={() => (
                      <FormItem className="col-span-2">
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
                              control={form.control}
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
                                        disabled={isLoading}
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
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-primary text-white hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Register as a Caterer"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Login
            </Link>
          </div>
          <div className="text-center text-sm">
            Looking to order food?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Register as a user
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CatererRegister;
