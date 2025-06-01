import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  MapPin, 
  Star, 
  Users, 
  Clock,
  Phone,
  Mail,
  Calendar,
  ChevronRight,
  ArrowLeft,
  Utensils
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Caterer } from "@/contexts/AuthContext";

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

type CatererDetails = {
  caterer: Caterer;
  menus: Menu[];
  reviews: Review[];
};

const CatererProfile = () => {
  const { id } = useParams();
  const caterId = id ? parseInt(id) : 0;
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("menus");

  const { data, isLoading, error } = useQuery<CatererDetails>({
    queryKey: [`/api/caterers/${caterId}`],
  });

  if (error) {
    toast({
      title: "Error loading caterer details",
      description: "Please try again later",
      variant: "destructive",
    });
  }

  // Get initials from business name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Format meal type for display
  const formatMealType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        className="mb-4 pl-0"
        onClick={() => navigate("/browse")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Browse
      </Button>

      {isLoading || !data ? (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Skeleton className="h-48 w-48 rounded-full" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-10 w-1/2" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <div className="flex gap-4">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </div>
          
          <Skeleton className="h-12 w-full" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Caterer Profile Header */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="flex-shrink-0">
              <Avatar className="h-48 w-48 border-4 border-white shadow-lg">
                <AvatarFallback className="bg-primary text-white text-5xl">
                  {getInitials(data.caterer.businessName)}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3">
                <h1 className="text-3xl font-bold font-poppins dark:text-white">
                  {data.caterer.businessName}
                </h1>
                {data.caterer.rating && (
                  <div className="flex items-center text-white px-3 py-1 rounded-lg bg-success">
                    <Star className="mr-1 h-5 w-5" />
                    <span className="font-semibold">{data.caterer.rating.toFixed(1)}</span>
                    <span className="text-sm ml-1">({data.caterer.reviewCount} reviews)</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-3 mb-4">
                <div className="flex items-center text-neutral-700 dark:text-neutral-300">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{data.caterer.location}, {data.caterer.city}, {data.caterer.state}</span>
                </div>
                <div className="flex items-center text-neutral-700 dark:text-neutral-300">
                  <Users className="h-4 w-4 mr-1" />
                  <span>Serves {data.caterer.minPlate} - {data.caterer.maxPlate} plates</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {data.caterer.eventTypes?.map((type, idx) => (
                  <Badge key={idx} variant="secondary">
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Badge>
                ))}
              </div>
              
              <div className="mb-6">
                <p className="text-neutral-800 dark:text-neutral-200">
                  {data.caterer.description || "Specializing in providing high-quality catering services for events of all sizes."}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button className="bg-primary text-white hover:bg-primary/90">
                  <Phone className="mr-2 h-4 w-4" />
                  Contact Caterer
                </Button>
                <Button variant="outline">
                  <Mail className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </div>
            </div>
          </div>
          
          {/* Tabs for Menus and Reviews */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="menus">Menus</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            
            {/* Menus Tab */}
            <TabsContent value="menus" className="pt-6">
              {data.menus.length === 0 ? (
                <div className="text-center py-12">
                  <Utensils className="mx-auto h-12 w-12 text-neutral-400 mb-3" />
                  <h3 className="text-xl font-semibold mb-2 dark:text-white">No menus available</h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    This caterer hasn't added any menus yet
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.menus.map((menu) => (
                    <Card key={menu.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="bg-neutral-100 dark:bg-neutral-800 p-4 border-b">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-semibold font-poppins text-lg dark:text-white">{menu.name}</h3>
                          {menu.isVegetarian && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              Veg
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center text-sm text-neutral-700 dark:text-neutral-300">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{formatMealType(menu.mealType)}</span>
                        </div>
                      </div>
                      
                      <CardContent className="p-4">
                        {menu.description && (
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">{menu.description}</p>
                        )}
                        
                        <div className="mb-4">
                          <h4 className="font-medium mb-2 text-neutral-800 dark:text-neutral-200">Items Included:</h4>
                          <ul className="text-sm space-y-1 text-neutral-700 dark:text-neutral-300">
                            {menu.items.map((item, index) => (
                              <li key={index} className="flex items-start">
                                <ChevronRight className="h-4 w-4 mr-1 shrink-0 mt-0.5" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="flex justify-between items-center mb-4">
                          <div className="text-xl font-semibold text-primary">
                            ₹{menu.pricePerPlate}
                            <span className="text-sm font-normal text-neutral-600 dark:text-neutral-400"> per plate</span>
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full bg-primary text-white hover:bg-primary/90"
                          onClick={() => navigate(`/place-order/${data.caterer.id}/${menu.id}`)}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          Book This Menu
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            {/* Reviews Tab */}
            <TabsContent value="reviews" className="pt-6">
              {data.reviews.length === 0 ? (
                <div className="text-center py-12">
                  <Star className="mx-auto h-12 w-12 text-neutral-400 mb-3" />
                  <h3 className="text-xl font-semibold mb-2 dark:text-white">No reviews yet</h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    This caterer doesn't have any reviews yet
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-primary/10 p-4 rounded-xl text-center">
                      <div className="text-4xl font-bold text-primary">
                        {data.caterer.rating?.toFixed(1) || "N/A"}
                      </div>
                      <div className="text-sm text-neutral-600 dark:text-neutral-400">
                        out of 5
                      </div>
                    </div>
                    
                    <div>
                      <p className="font-medium dark:text-white">
                        Based on {data.reviews.length} {data.reviews.length === 1 ? 'review' : 'reviews'}
                      </p>
                      <div className="flex mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`h-5 w-5 ${
                              star <= (data.caterer.rating || 0) 
                                ? "text-yellow-400 fill-yellow-400" 
                                : "text-neutral-300"
                            }`} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {data.reviews.map((review) => (
                    <Card key={review.id} className="mb-4">
                      <CardContent className="pt-6">
                        <div className="flex justify-between mb-4">
                          <div className="flex items-center">
                            <Avatar className="h-10 w-10 mr-3">
                              <AvatarFallback className="bg-secondary text-white">
                                {review.userName?.slice(0, 2).toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium dark:text-white">
                                {review.userName || "Anonymous User"}
                              </p>
                              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center">
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
                        
                        {review.comment && (
                          <p className="text-neutral-700 dark:text-neutral-300">
                            {review.comment}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default CatererProfile;
