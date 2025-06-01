import React from "react";
import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  MapPin,
  Utensils,
  Star,
  X
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

// Define Caterer type
// Define Caterer type
interface Caterer {
  id: string;
  username: string;
  email: string;
  name: string;
  phone: string;
  address?: string;
  city: string;
  state: string;
  businessName: string;
  description: string;
  location: string;
  minPlate: number;
  maxPlate: number;
  eventTypes: string[];
  specialties: string[];
  image: string;
  rating?: number;
}

// Mock caterer data with improved image URLs
const mockCaterers: Caterer[] = [
  {
    id: "1",
    username: "biryanihaven",
    email: "contact@biryanihaven.com",
    name: "Rahul Gupta",
    phone: "9123456789",
    address: "12 MG Road, Bandra",
    city: "Mumbai",
    state: "Maharashtra",
    businessName: "Biryani Haven",
    description: "Masters of Hyderabadi biryani and Mughlai delicacies, perfect for grand weddings and corporate events.",
    location: "Bandra",
    minPlate: 50,
    maxPlate: 1000,
    eventTypes: ["wedding", "corporate", "party"],
    specialties: ["mughlai", "northIndian", "desserts"],
    // More specific to Hyderabadi Biryani & Mughlai
    image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aHlkZXJhYmFkaSUyMGJpcnlhbml8ZW58MHx8MHx8fDA%3D&w=1000&q=80",
    rating: 4.9,
  },
  {
    id: "2",
    username: "southindianfeast",
    email: "info@southindianfeast.com",
    name: "Lakshmi Iyer",
    phone: "9845671234",
    address: "45 Anna Salai",
    city: "Chennai",
    state: "Tamil Nadu",
    businessName: "South Indian Feast",
    description: "Authentic South Indian vegetarian catering, specializing in crispy dosas and idlis for poojas and weddings.",
    location: "T. Nagar",
    minPlate: 20,
    maxPlate: 300,
    eventTypes: ["pooja", "wedding", "other"],
    specialties: ["southIndian", "desserts"],
    // Image showing Dosa & Idli or a festive South Indian spread
    image: "https://media.istockphoto.com/id/1055400680/photo/buffet-table-of-reception-with-cold-snacks-meat-and-cakes.jpg?s=612x612&w=0&k=20&c=reiN8Ico8Bmdrt6dhtt7l-86yMEy98u7JFIgs-Yr0Eo=",
    rating: 4.7,
  },
  {
    id: "3",
    username: "punjabigrill",
    email: "punjabigrill@gmail.com",
    name: "Gurpreet Singh",
    phone: "9876543210",
    address: "78 Connaught Place",
    city: "New Delhi",
    state: "Delhi",
    businessName: "Punjabi Grill",
    description: "Rich Punjabi cuisine with butter chicken and naan, ideal for vibrant weddings and parties.",
    location: "Connaught Place",
    minPlate: 100,
    maxPlate: 800,
    eventTypes: ["wedding", "party"],
    specialties: ["punjabi", "northIndian", "desserts"],
    // Classic Butter Chicken and Naan shot
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8YnV0dGVyJTIwY2hpY2tlbiUyMG5hYW58ZW58MHx8MHx8fDA%3D&w=1000&q=80",
    rating: 4.8,
  },
  {
    id: "4",
    username: "streetfoodco",
    email: "streetfoodco@outlook.com",
    name: "Vikram Patel",
    phone: "9001234567",
    address: "23 Brigade Road",
    city: "Bengaluru",
    state: "Karnataka",
    businessName: "Street Food Co.",
    description: "Authentic Indian street food like pani puri and pav bhaji, perfect for casual parties and events.",
    location: "MG Road",
    minPlate: 30,
    maxPlate: 500,
    eventTypes: ["party", "corporate", "other"],
    specialties: ["street", "northIndian"],
    // Vibrant Pani Puri or Pav Bhaji stall/setup
    image: "https://media.istockphoto.com/id/1270501017/photo/wedding-table-setting-in-the-restaurant-wed-banquet.jpg?s=612x612&w=0&k=20&c=XJqknSCbIZdTBz3LzfpeytCvr6QFohcsUyfP2o1CjOk=",
    rating: 4.5,
  },
  {
    id: "5",
    username: "royalmughlai",
    email: "royalmughlai@yahoo.com",
    name: "Asif Khan",
    phone: "9223344556",
    address: "56 Park Street",
    city: "Kolkata",
    state: "West Bengal",
    businessName: "Royal Mughlai",
    description: "Exquisite Mughlai cuisine with succulent kebabs and kormas for weddings and corporate gatherings.",
    location: "Park Street",
    minPlate: 80,
    maxPlate: 600,
    eventTypes: ["wedding", "corporate"],
    specialties: ["mughlai", "northIndian"],
    // Assortment of Mughlai kebabs or a rich korma
    image: "https://media.istockphoto.com/id/179232123/photo/cheese-buffet.jpg?s=612x612&w=0&k=20&c=bioxFyHqxFJmS2OFmVzl8zcW6BfLGXca05J3qgldqe8=",
    rating: 4.6,
  },
  {
    id: "6",
    username: "sweetsofindia",
    email: "contact@sweetsofindia.com",
    name: "Neha Desai",
    phone: "9112233445",
    address: "89 Sarojini Nagar",
    city: "Lucknow", // Lucknow is famous for sweets
    state: "Uttar Pradesh",
    businessName: "Sweets of India",
    description: "Traditional Indian sweets like jalebi and gulab jamun for poojas, weddings, and festivals.",
    location: "Hazratganj",
    minPlate: 10,
    maxPlate: 200,
    eventTypes: ["pooja", "wedding", "other"],
    specialties: ["desserts"],
    // Colorful assortment of Indian sweets, jalebi or gulab jamun focused
    image: "https://media.istockphoto.com/id/506676268/photo/turkish-breakfast.jpg?s=612x612&w=0&k=20&c=GRrDRRXmVTSlVPXEUpolCpUo-W2ilqfjabmhj5T5t7I=",
    rating: 4.4,
  },
  {
    id: "7",
    username: "northindianspice",
    email: "northindianspice@gmail.com",
    name: "Rohit Mehra",
    phone: "9334455667",
    address: "34 Civil Lines",
    city: "Jaipur",
    state: "Rajasthan",
    businessName: "North Indian Spice",
    description: "Rajasthani and North Indian dishes, including dal baati churma, for weddings and corporate events.",
    location: "C Scheme",
    minPlate: 60,
    maxPlate: 700,
    eventTypes: ["wedding", "corporate", "party"],
    specialties: ["northIndian", "punjabi"], // Rajasthani specialty too
    // Dal Baati Churma or a Rajasthani Thali
    image: "https://media.istockphoto.com/id/1390981450/photo/appetizer-tray.jpg?s=612x612&w=0&k=20&c=Fbb494zKcfwF5vL17U3V0K52hHB8_a1IuY24cio_fXo=", // Kept this as it's good for Rajasthani
    rating: 4.7,
  },
  {
    id: "8",
    username: "southindianbites",
    email: "southindianbites@outlook.com",
    name: "Meena Rao",
    phone: "9445566778",
    address: "67 Banjara Hills",
    city: "Hyderabad", // Hyderabad has Andhra influence
    state: "Telangana",
    businessName: "South Indian Bites",
    description: "Andhra-style South Indian vegetarian catering for poojas and weddings, with spicy curries and rice.",
    location: "Banjara Hills",
    minPlate: 25,
    maxPlate: 400,
    eventTypes: ["pooja", "wedding"],
    specialties: ["southIndian", "desserts"], // Andhra specialty
    // Andhra meal with banana leaf, spicy curries
    image: "https://media.istockphoto.com/id/911408320/photo/restaurant-table-filled-with-various-healthy-dishes.jpg?s=612x612&w=0&k=20&c=NpFjlp8MZZ5KDWYjxb0W1FxfBIA4VxUMkGjbxcaiutg=",
    rating: 4.3,
  },
  {
    id: "9",
    username: "festiveflavors",
    email: "festiveflavors@gmail.com",
    name: "Arjun Sharma",
    phone: "9556677889",
    address: "101 Ashok Nagar",
    city: "Ahmedabad",
    state: "Gujarat",
    businessName: "Festive Flavors",
    description: "Gujarati and North Indian catering with vibrant thalis for weddings and festive parties.",
    location: "Navrangpura",
    minPlate: 100,
    maxPlate: 1200,
    eventTypes: ["wedding", "party", "other"],
    specialties: ["northIndian", "street", "desserts"], // Gujarati specialty
    // Vibrant Gujarati Thali
    image: "https://media.istockphoto.com/id/1062407750/photo/outdoor-fancy-banquet.jpg?s=612x612&w=0&k=20&c=5Q0hdupj17-BIkMqpOlxWcUkHZlNfivzvdAYldNG7TU=", // Kept this as it's good for Gujarati
    rating: 4.9,
  },
  {
    id: "10",
    username: "tastytreats",
    email: "tastytreats@yahoo.com",
    name: "Kavita Nair",
    phone: "9667788990",
    address: "45 Marine Drive",
    city: "Kochi",
    state: "Kerala",
    businessName: "Tasty Treats",
    description: "Kerala-style catering with seafood and vegetarian dishes for weddings and poojas.",
    location: "Fort Kochi",
    minPlate: 15,
    maxPlate: 250,
    eventTypes: ["pooja", "wedding", "party"],
    specialties: ["southIndian", "desserts"], // Kerala specialty
    // Kerala Sadhya or specific Kerala seafood like fish moilee
    image: "https://media.istockphoto.com/id/493762666/photo/catering-buffet-style-with-different-light-snack.jpg?s=612x612&w=0&k=20&c=MboDHO0WMh1EGXzfufpKYTea3A7Bp86aWtZMAnf4aYg=",
    rating: 4.5,
  },
  {
    id: "11",
    username: "mughlaidelights",
    email: "mughlaidelights@outlook.com",
    name: "Zainab Khan",
    phone: "9778899001",
    address: "23 Fraser Road",
    city: "Patna",
    state: "Bihar",
    businessName: "Mughlai Delights",
    description: "Luxurious Mughlai and North Indian catering for weddings and corporate events, with rich biryanis.",
    location: "Fraser Road",
    minPlate: 70,
    maxPlate: 600,
    eventTypes: ["wedding", "corporate"],
    specialties: ["mughlai", "northIndian", "desserts"],
    // Rich Mughlai spread, possibly different biryani or korma focus
    image: "https://media.istockphoto.com/id/179232123/photo/cheese-buffet.jpg?s=612x612&w=0&k=20&c=bioxFyHqxFJmS2OFmVzl8zcW6BfLGXca05J3qgldqe8=", // General mughlai platter
    rating: 4.6,
  },
  {
    id: "12",
    username: "spiceofpunjab",
    email: "spiceofpunjab@gmail.com",
    name: "Amarjeet Kaur",
    phone: "9889900112",
    address: "56 Mall Road",
    city: "Amritsar",
    state: "Punjab",
    businessName: "Spice of Punjab",
    description: "Authentic Punjabi cuisine with tandoori dishes and lassi for weddings and parties.",
    location: "Golden Temple Area",
    minPlate: 40,
    maxPlate: 500,
    eventTypes: ["wedding", "party"],
    specialties: ["punjabi", "northIndian"],
    // Tandoori platter and perhaps a glass of Lassi
    image: "https://images.unsplash.com/photo-1671393027109-cc86930539c3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGZvb2QlMjBiYXF1ZXQlMjBpbWFnZXN8ZW58MHx8MHx8fDA%3D",
    rating: 4.7,
  },
  {
    id: "13",
    username: "gujaratieats",
    email: "gujaratieats@yahoo.com",
    name: "Nilesh Patel",
    phone: "9990011223",
    address: "78 Vastrapur",
    city: "Surat",
    state: "Gujarat",
    businessName: "Gujarati Eats",
    description: "Traditional Gujarati thalis and snacks for weddings, poojas, and community events.",
    location: "Vesu",
    minPlate: 30,
    maxPlate: 400,
    eventTypes: ["pooja", "wedding", "other"],
    specialties: ["northIndian", "desserts"], // Gujarati specialty
    // Gujarati snacks like Dhokla, Fafda or another Thali variant
    image: "https://media.istockphoto.com/id/1428185352/photo/traditional-banquet.webp?a=1&b=1&s=612x612&w=0&k=20&c=f7k2yYNEiDmKRNf5tl8V8TDm93IxGXWlwZIXkwcue20=",
    rating: 4.4,
  },
  {
    id: "14",
    username: "bengalibites",
    email: "bengalibites@outlook.com",
    name: "Ananya Das",
    phone: "9771122334",
    address: "34 Salt Lake",
    city: "Kolkata",
    state: "West Bengal",
    businessName: "Bengali Bites",
    description: "Authentic Bengali cuisine with fish curries and sweets for poojas and weddings.",
    location: "Salt Lake",
    minPlate: 20,
    maxPlate: 300,
    eventTypes: ["pooja", "wedding"],
    specialties: ["desserts", "northIndian"], // Bengali specialty
    // Bengali fish curry (like Shorshe Ilish) or Mishti Doi/Rasgulla
    image: "https://images.unsplash.com/photo-1590657140810-25898a847305?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGZvb2QlMjBiYXF1ZXQlMjBpbWFnZXN8ZW58MHx8MHx8fDA%3D",
    rating: 4.5,
  },
  {
    id: "15",
    username: "rajwadaflavors",
    email: "rajwadaflavors@gmail.com",
    name: "Vijay Singh",
    phone: "9662233445",
    address: "45 Sindhi Camp",
    city: "Udaipur",
    state: "Rajasthan",
    businessName: "Rajwada Flavors",
    description: "Royal Rajasthani cuisine with laal maas and ghevar for weddings and corporate events.",
    location: "City Palace Area",
    minPlate: 50,
    maxPlate: 600,
    eventTypes: ["wedding", "corporate", "party"],
    specialties: ["northIndian", "desserts"], // Rajasthani specialty
    // Laal Maas dish or Ghevar (Rajasthani sweet)
    image: "https://plus.unsplash.com/premium_photo-1678051041395-a2d68e1c9d9c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8Zm9vZCUyMGJhcXVldCUyMGltYWdlc3xlbnwwfHwwfHx8MA%3D%3D" ,// More specific Laal Maas if available on Unsplash, otherwise use general Rajasthani
    rating: 4.8,
  },
  {
    id: "16",
    username: "coastalcurries",
    email: "coastalcurries@yahoo.com",
    name: "Suresh Menon",
    phone: "9553344556",
    address: "67 Panjim Road",
    city: "Panaji",
    state: "Goa",
    businessName: "Coastal Curries",
    description: "Goan and South Indian seafood catering for beach parties and weddings.",
    location: "Calangute",
    minPlate: 25,
    maxPlate: 350,
    eventTypes: ["wedding", "party", "other"],
    specialties: ["southIndian", "desserts"], // Goan specialty
    // Goan fish curry rice or a seafood platter
    image: "https://newvinducaterershyd.com/img/services/catering-services.jpg",
    rating: 4.6,
  },
];

// The rest of your component code would go here
// ...

const Browse = () => {
  const [searchParams] = useLocation();
  const query = new URLSearchParams(searchParams);
  const initialLocation = query.get("location") || "";
  const initialEventType = query.get("eventType") || "";

  const [location, setLocation] = useState(initialLocation);
  const [eventType, setEventType] = useState(initialEventType);
  const [sortBy, setSortBy] = useState("");
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Simulate API fetch with mock data
  const { data: allCaterers, isLoading, error } = useQuery<Caterer[]>({
    queryKey: ["/api/caterers"],
    queryFn: async () => mockCaterers,
  });

  // Create filtered caterers
  const [filteredCaterers, setFilteredCaterers] = useState<Caterer[]>([]);

  useEffect(() => {
    if (allCaterers) {
      let filtered = [...allCaterers];

      // Apply location filter if provided
      if (location) {
        filtered = filtered.filter(caterer =>
          caterer.location.toLowerCase().includes(location.toLowerCase()) ||
          caterer.city.toLowerCase().includes(location.toLowerCase()) ||
          caterer.state.toLowerCase().includes(location.toLowerCase())
        );
      }

      // Apply event type filter if provided
      if (eventType) {
        filtered = filtered.filter(caterer =>
          caterer.eventTypes?.includes(eventType)
        );
      }

      // Apply sorting
      if (sortBy === "rating-high") {
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      } else if (sortBy === "rating-low") {
        filtered.sort((a, b) => (a.rating || 0) - (b.rating || 0));
      }

      setFilteredCaterers(filtered);
    }
  }, [allCaterers, location, eventType, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // Update URL with search params
    let params = new URLSearchParams();
    if (location) params.append("location", location);
    if (eventType) params.append("eventType", eventType);

    navigate(`/browse?${params.toString()}`);
  };

  const clearFilters = () => {
    setLocation("");
    setEventType("");
    setSortBy("");
    navigate("/browse");
  };

  if (error) {
    toast({
      title: "Error loading caterers",
      description: "Please try again later",
      variant: "destructive",
    });
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-poppins mb-2 dark:text-white">Browse Caterers</h1>
          <p className="text-neutral-600 dark:text-neutral-300">
            Find the perfect caterer for your event
          </p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4">
              <label className="block text-sm font-medium mb-1 dark:text-neutral-200">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
                <Input
                  type="text"
                  placeholder="Enter city or area"
                  className="pl-9"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>
            
            <div className="md:col-span-3">
              <label className="block text-sm font-medium mb-1 dark:text-neutral-200">Event Type</label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger>
                  <SelectValue placeholder="All event types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All event types</SelectItem>
                  <SelectItem value="wedding">Wedding</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                  <SelectItem value="pooja">Traditional Pooja</SelectItem>
                  <SelectItem value="party">Private Party</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-3">
              <label className="block text-sm font-medium mb-1 dark:text-neutral-200">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="rating-high">Rating (High to Low)</SelectItem>
                  <SelectItem value="rating-low">Rating (Low to High)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-2 flex items-end space-x-2">
              <Button type="submit" className="flex-1 bg-primary text-white hover:bg-primary/90">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
              
              {(location || eventType || sortBy) && (
                <Button type="button" variant="outline" onClick={clearFilters}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </form>
          
          {/* Active filters display */}
          {(location || eventType) && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium dark:text-neutral-300">Active filters:</span>
              {location && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {location}
                  <button onClick={() => setLocation("")}>
                    <X className="h-3 w-3 ml-1" />
                  </button>
                </Badge>
              )}
              {eventType && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Utensils className="h-3 w-3" />
                  {eventType.charAt(0).toUpperCase() + eventType.slice(1)}
                  <button onClick={() => setEventType("")}>
                    <X className="h-3 w-3 ml-1" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold dark:text-white">
          {isLoading ? "Loading caterers..." : `${filteredCaterers.length} Caterer${filteredCaterers.length !== 1 ? 's' : ''} Found`}
        </h2>
      </div>

      {isLoading ? (
        // Loading skeletons
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-5">
                <Skeleton className="h-8 w-2/3 mb-3" />
                <Skeleton className="h-4 w-full mb-3" />
                <Skeleton className="h-4 w-full mb-4" />
                <div className="flex gap-1 mb-4">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="flex gap-1 mb-4">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="flex justify-between mb-4">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {filteredCaterers.length === 0 ? (
            <div className="text-center py-12">
              <Utensils className="mx-auto h-12 w-12 text-neutral-400 mb-3" />
              <h3 className="text-xl font-semibold mb-2 dark:text-white">No caterers found</h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                Try changing your search criteria or clear filters
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear all filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCaterers.map((caterer) => (
                <Card key={caterer.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-neutral-200 dark:bg-neutral-700">
                    <img
                      src={caterer.image}
                      alt={`${caterer.businessName}'s signature dish`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-poppins font-semibold text-xl dark:text-white">{caterer.businessName}</h3>
                      {caterer.rating && (
                        <div className="flex items-center bg-success text-white px-2 py-1 rounded-lg text-sm">
                          <Star className="text-sm mr-1 h-4 w-4" />
                          <span>{caterer.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center text-sm mb-3 dark:text-neutral-300">
                      <MapPin className="text-neutral-800 dark:text-neutral-300 text-sm mr-1 h-4 w-4" />
                      <span>{caterer.city}, {caterer.state}</span>
                    </div>
                    
                    <div className="mb-3 flex flex-wrap gap-1">
                      {caterer.eventTypes?.map((type, idx) => (
                        <span
                          key={`event-${idx}`}
                          className="inline-block bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 px-3 py-1 rounded-full text-sm mr-2 mb-2"
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </span>
                      ))}
                    </div>
                    
                    <div className="mb-4 flex flex-wrap gap-1">
                      {caterer.specialties?.map((specialty, idx) => (
                        <span
                          key={`specialty-${idx}`}
                          className="inline-block bg-neutral-200 dark:bg-neutral-600 text-neutral-800 dark:text-neutral-100 px-3 py-1 rounded-full text-sm mr-2 mb-2"
                        >
                          {specialty.charAt(0).toUpperCase() + specialty.slice(1)}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center text-sm dark:text-neutral-300 mb-4">
                      <div>
                        Capacity: <span className="font-semibold">{caterer.minPlate}-{caterer.maxPlate}</span> plates
                      </div>
                    </div>
                    
                    <Link href={`/caterer/${caterer.id}`}>
                      <Button className="w-full bg-primary text-white hover:bg-primary/90">
                        View Details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Browse;
