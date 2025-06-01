import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Check, Search, Users, CalendarRange, Utensils, Star, Truck, MapPin, HandPlatter, Clock, CheckCircle2, Edit3, CreditCard, MenuSquare, Shield, Package } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

const Home = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [locationInput, setLocationInput] = useState("");
  const [eventType, setEventType] = useState("");

  const { data: featuredCaterers } = useQuery({
    queryKey: ["/api/caterers"],
    staleTime: 60000, // 1 minute
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    let searchParams = new URLSearchParams();
    if (locationInput) searchParams.append("location", locationInput);
    if (eventType) searchParams.append("eventType", eventType);
    
    navigate(`/browse?${searchParams.toString()}`);
  };

  const handleGetStarted = () => {
    if (user) {
      navigate("/browse");
    } else {
      navigate("/register");
    }
  };

  const handleCatererRegistration = () => {
    navigate("/caterer-register");
  };

  return (
    <main>
      {/* Hero Section */}
      <section className="relative bg-neutral-100 pt-8 pb-16 md:pt-16 md:pb-24 dark:bg-neutral-800 dark:text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 md:pr-12 mb-8 md:mb-0">
              <h1 className="font-poppins font-bold text-4xl md:text-5xl lg:text-6xl text-neutral-800 dark:text-white leading-tight mb-6">
                Bulk Catering Orders <span className="text-primary">Made Simple</span>
              </h1>
              <p className="text-lg md:text-xl text-neutral-800 dark:text-neutral-200 mb-8">
                Order delicious meals for your events, from traditional poojas to corporate meetings and grand weddings. Serve 100 to 500+ guests with ease.
              </p>

              {/* Search Form */}
              <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl shadow-lg mb-8 md:mb-0">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1 dark:text-neutral-200">Event Type</label>
                    <Select onValueChange={setEventType} value={eventType}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Event Types</SelectLabel>
                          <SelectItem value="wedding">Wedding</SelectItem>
                          <SelectItem value="corporate">Corporate Meeting</SelectItem>
                          <SelectItem value="pooja">Traditional Pooja</SelectItem>
                          <SelectItem value="party">Private Party</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1 dark:text-neutral-200">Location</label>
                    <Input 
                      type="text" 
                      placeholder="Enter your location" 
                      value={locationInput}
                      onChange={(e) => setLocationInput(e.target.value)}
                    />
                  </div>
                  <div className="flex-none self-end">
                    <Button type="submit" className="bg-primary text-white hover:bg-primary/90 whitespace-nowrap">
                      <Search className="mr-2 h-4 w-4" /> Find Caterers
                    </Button>
                  </div>
                </form>
              </div>
            </div>

            {/* Hero Image */}
            <div className="md:w-1/2 relative">
              <img
                src="https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                alt="Catering food display with multiple dishes"
                className="rounded-2xl shadow-xl w-full object-cover"
                style={{ height: "500px" }}
              />
              <div className="absolute -bottom-5 -left-5 bg-white dark:bg-neutral-900 p-3 rounded-xl shadow-lg">
                <div className="flex items-center">
                  <div className="bg-success text-white p-1 rounded-full">
                    <CheckCircle2 size={20} />
                  </div>
                  <p className="ml-2 font-medium dark:text-white">800+ Satisfied Events</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Clients/Partners */}
        <div className="container mx-auto px-4 mt-16">
          <p className="text-center text-neutral-800 dark:text-neutral-200 font-medium mb-6">
            Trusted by leading event organizers
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            <div className="grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all">
              <div className="h-12 flex items-center justify-center">
                <span className="font-poppins font-bold text-xl">Event Corp</span>
              </div>
            </div>
            <div className="grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all">
              <div className="h-12 flex items-center justify-center">
                <span className="font-poppins font-bold text-xl">WeddingPro</span>
              </div>
            </div>
            <div className="grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all">
              <div className="h-12 flex items-center justify-center">
                <span className="font-poppins font-bold text-xl">CelebrateTech</span>
              </div>
            </div>
            <div className="grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all">
              <div className="h-12 flex items-center justify-center">
                <span className="font-poppins font-bold text-xl">FestivalPlus</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white dark:bg-neutral-900 dark:text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-neutral-800 dark:text-white mb-4">
              How CaterEase Works
            </h2>
            <p className="text-lg text-neutral-800 dark:text-neutral-200 max-w-2xl mx-auto">
              Our simple 3-step process makes bulk food ordering effortless for any event
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="bg-primary bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="text-4xl text-primary" />
                </div>
                <h3 className="font-poppins font-semibold text-xl mb-3 dark:text-white">Find the Perfect Caterer</h3>
                <p className="text-neutral-800 dark:text-neutral-300">
                  Browse caterers by location, event type, and cuisine. View menus, capacity, and read customer reviews.
                </p>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="bg-primary bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Edit3 className="text-4xl text-primary" />
                </div>
                <h3 className="font-poppins font-semibold text-xl mb-3 dark:text-white">Customize Your Order</h3>
                <p className="text-neutral-800 dark:text-neutral-300">
                  Specify guest count, select menu items, add special requirements, and choose delivery date and time.
                </p>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="bg-primary bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Utensils className="text-4xl text-primary" />
                </div>
                <h3 className="font-poppins font-semibold text-xl mb-3 dark:text-white">Enjoy Your Event</h3>
                <p className="text-neutral-800 dark:text-neutral-300">
                  Track your order status, receive updates, and have delicious food delivered to your event on time.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button className="bg-primary text-white hover:bg-primary/90" onClick={handleGetStarted}>
              Get Started Now
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Event Types */}
      <section className="py-16 bg-neutral-100 dark:bg-neutral-800 dark:text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-neutral-800 dark:text-white mb-4">
              Catering for Every Occasion
            </h2>
            <p className="text-lg text-neutral-800 dark:text-neutral-200 max-w-2xl mx-auto">
              From traditional ceremonies to corporate gatherings, we have experienced caterers for all your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Wedding Card */}
            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md overflow-hidden group relative">
              <img
                src="https://images.unsplash.com/photo-1565538420870-da08ff96a207?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Elegant wedding reception food display"
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="font-poppins font-semibold text-xl mb-1">Wedding Functions</h3>
                <p className="mb-3 text-white/90">Elegant catering for 100-500+ guests</p>
                <Button variant="secondary" onClick={() => navigate("/browse?eventType=wedding")}>
                  Explore Options
                </Button>
              </div>
            </div>

            {/* Corporate Card */}
            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md overflow-hidden group relative">
              <img
                src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Corporate event catering with buffet setup"
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="font-poppins font-semibold text-xl mb-1">Corporate Events</h3>
                <p className="mb-3 text-white/90">Professional service for meetings & conferences</p>
                <Button variant="secondary" onClick={() => navigate("/browse?eventType=corporate")}>
                  Explore Options
                </Button>
              </div>
            </div>

            {/* Traditional Poojas Card */}
            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md overflow-hidden group relative">
              <img
                src="https://cdn.pixabay.com/photo/2017/06/16/11/38/breakfast-2408818_1280.jpg"
                alt="Traditional pooja food items arranged on banana leaves"
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="font-poppins font-semibold text-xl mb-1">Traditional Poojas</h3>
                <p className="mb-3 text-white/90">Authentic food for religious ceremonies</p>
                <Button variant="secondary" onClick={() => navigate("/browse?eventType=pooja")}>
                  Explore Options
                </Button>
              </div>
            </div>

            {/* Private Parties Card */}
            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md overflow-hidden group relative">
              <img
                src="https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Party food spread with appetizers and cocktails"
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="font-poppins font-semibold text-xl mb-1">Private Parties</h3>
                <p className="mb-3 text-white/90">Customizable menus for celebrations</p>
                <Button variant="secondary" onClick={() => navigate("/browse?eventType=party")}>
                  Explore Options
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Caterers */}
      <section className="py-16 bg-white dark:bg-neutral-900 dark:text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
            <div>
              <h2 className="font-poppins font-bold text-3xl md:text-4xl text-neutral-800 dark:text-white mb-4">
                Top-Rated Caterers
              </h2>
              <p className="text-lg text-neutral-800 dark:text-neutral-200 max-w-2xl">
                Discover our most popular and highly-rated catering partners
              </p>
            </div>
            <Button
              variant="link"
              className="mt-4 md:mt-0 text-primary font-semibold flex items-center hover:underline"
              onClick={() => navigate("/browse")}
            >
              View all caterers
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ml-1"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Button>
          </div>

          {/* Caterer Listings */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Caterer Card 1 */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <img
                src="https://images.unsplash.com/photo-1530062845289-9109b2c9c868?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Royal Feast Caterers food display"
                className="w-full h-48 object-cover"
              />
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-poppins font-semibold text-xl dark:text-white">Royal Feast Caterers</h3>
                  <div className="flex items-center bg-success text-white px-2 py-1 rounded-lg text-sm">
                    <Star className="text-sm mr-1 h-4 w-4" />
                    <span>4.8</span>
                  </div>
                </div>

                <div className="flex items-center text-sm mb-3 dark:text-neutral-300">
                  <MapPin className="text-neutral-800 dark:text-neutral-300 text-sm mr-1 h-4 w-4" />
                  <span>Bangalore, Karnataka</span>
                  <span className="mx-2">•</span>
                  <HandPlatter className="text-neutral-800 dark:text-neutral-300 text-sm mr-1 h-4 w-4" />
                  <span>North Indian, South Indian</span>
                </div>

                <div className="mb-4">
                  <span className="inline-block bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 px-3 py-1 rounded-full text-sm mr-2 mb-2">
                    Wedding
                  </span>
                  <span className="inline-block bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 px-3 py-1 rounded-full text-sm mr-2 mb-2">
                    Corporate
                  </span>
                  <span className="inline-block bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 px-3 py-1 rounded-full text-sm mr-2 mb-2">
                    Parties
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm dark:text-neutral-300">
                  <div className="font-semibold">
                    <span className="text-primary">₹250 - ₹450</span> per plate
                  </div>
                  <div>
                    Capacity: <span className="font-semibold">100-1000</span> plates
                  </div>
                </div>

                <Button className="w-full mt-4 bg-primary text-white hover:bg-primary/90" onClick={() => navigate("/caterer/1")}>
                  View Menu
                </Button>
              </div>
            </div>

            {/* Caterer Card 2 */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <img
                src="https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_1280.jpg"
                alt="Spice Route Caterers traditional South Indian dishes"
                className="w-full h-48 object-cover"
              />
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-poppins font-semibold text-xl dark:text-white">Spice Route Caterers</h3>
                  <div className="flex items-center bg-success text-white px-2 py-1 rounded-lg text-sm">
                    <Star className="text-sm mr-1 h-4 w-4" />
                    <span>4.7</span>
                  </div>
                </div>

                <div className="flex items-center text-sm mb-3 dark:text-neutral-300">
                  <MapPin className="text-neutral-800 dark:text-neutral-300 text-sm mr-1 h-4 w-4" />
                  <span>Chennai, Tamil Nadu</span>
                  <span className="mx-2">•</span>
                  <HandPlatter className="text-neutral-800 dark:text-neutral-300 text-sm mr-1 h-4 w-4" />
                  <span>South Indian, Kerala</span>
                </div>

                <div className="mb-4">
                  <span className="inline-block bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 px-3 py-1 rounded-full text-sm mr-2 mb-2">
                    Wedding
                  </span>
                  <span className="inline-block bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 px-3 py-1 rounded-full text-sm mr-2 mb-2">
                    Pooja
                  </span>
                  <span className="inline-block bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 px-3 py-1 rounded-full text-sm mr-2 mb-2">
                    Parties
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm dark:text-neutral-300">
                  <div className="font-semibold">
                    <span className="text-primary">₹200 - ₹400</span> per plate
                  </div>
                  <div>
                    Capacity: <span className="font-semibold">100-800</span> plates
                  </div>
                </div>

                <Button className="w-full mt-4 bg-primary text-white hover:bg-primary/90" onClick={() => navigate("/caterer/2")}>
                  View Menu
                </Button>
              </div>
            </div>

            {/* Caterer Card 3 */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <img
                src="https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Elite Corporate Caterers buffet setup"
                className="w-full h-48 object-cover"
              />
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-poppins font-semibold text-xl dark:text-white">Elite Corporate Caterers</h3>
                  <div className="flex items-center bg-success text-white px-2 py-1 rounded-lg text-sm">
                    <Star className="text-sm mr-1 h-4 w-4" />
                    <span>4.9</span>
                  </div>
                </div>

                <div className="flex items-center text-sm mb-3 dark:text-neutral-300">
                  <MapPin className="text-neutral-800 dark:text-neutral-300 text-sm mr-1 h-4 w-4" />
                  <span>Mumbai, Maharashtra</span>
                  <span className="mx-2">•</span>
                  <HandPlatter className="text-neutral-800 dark:text-neutral-300 text-sm mr-1 h-4 w-4" />
                  <span>Continental, Pan Asian</span>
                </div>

                <div className="mb-4">
                  <span className="inline-block bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 px-3 py-1 rounded-full text-sm mr-2 mb-2">
                    Corporate
                  </span>
                  <span className="inline-block bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 px-3 py-1 rounded-full text-sm mr-2 mb-2">
                    Conferences
                  </span>
                  <span className="inline-block bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 px-3 py-1 rounded-full text-sm mr-2 mb-2">
                    Team Lunches
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm dark:text-neutral-300">
                  <div className="font-semibold">
                    <span className="text-primary">₹350 - ₹600</span> per plate
                  </div>
                  <div>
                    Capacity: <span className="font-semibold">100-500</span> plates
                  </div>
                </div>

                <Button className="w-full mt-4 bg-primary text-white hover:bg-primary/90" onClick={() => navigate("/caterer/3")}>
                  View Menu
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-neutral-100 dark:bg-neutral-800 dark:text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-neutral-800 dark:text-white mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-neutral-800 dark:text-neutral-200 max-w-2xl mx-auto">
              Hear from event planners who have used our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-accent text-2xl"
                  >
                    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
                    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
                  </svg>
                </div>
                <p className="text-neutral-800 dark:text-neutral-200 mb-6">
                  "CaterEase made organizing food for our company's annual conference incredibly simple. We had 350 attendees, and everything was delivered on time with excellent quality. Will definitely use again!"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden mr-4">
                    <div className="w-full h-full flex items-center justify-center bg-secondary text-white font-bold">
                      RS
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold dark:text-white">Rahul Sharma</p>
                    <p className="text-sm text-neutral-800 dark:text-neutral-300">Event Manager, TechCorp</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 2 */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-accent text-2xl"
                  >
                    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
                    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
                  </svg>
                </div>
                <p className="text-neutral-800 dark:text-neutral-200 mb-6">
                  "Finding a caterer who could handle our traditional pooja requirements for 200 guests was challenging until we found CaterEase. The food was authentic, and our guests were delighted!"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden mr-4">
                    <div className="w-full h-full flex items-center justify-center bg-primary text-white font-bold">
                      PM
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold dark:text-white">Priya Mehta</p>
                    <p className="text-sm text-neutral-800 dark:text-neutral-300">Family Event Organizer</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 3 */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-accent text-2xl"
                  >
                    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
                    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
                  </svg>
                </div>
                <p className="text-neutral-800 dark:text-neutral-200 mb-6">
                  "Our wedding reception for 500 guests was a breeze thanks to CaterEase. The platform helped us find the perfect caterer, customize the menu, and handle all logistics. Highly recommended!"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden mr-4">
                    <div className="w-full h-full flex items-center justify-center bg-secondary text-white font-bold">
                      AK
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold dark:text-white">Aditya & Kavita</p>
                    <p className="text-sm text-neutral-800 dark:text-neutral-300">Wedding Couple</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-7/12 mb-8 md:mb-0">
              <h2 className="font-poppins font-bold text-3xl md:text-4xl mb-4">Ready to simplify your event catering?</h2>
              <p className="text-lg mb-6">
                Join thousands of event organizers who trust CaterEase for their bulk food ordering needs. 
                Sign up today and discover the perfect caterer for your next event.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-white text-primary font-semibold hover:bg-white/90" onClick={handleGetStarted}>
                  Get Started
                </Button>
                <Button variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-primary">
                  Contact Sales
                </Button>
              </div>
            </div>
            <div className="md:w-4/12">
              <Card className="bg-white p-6 rounded-xl shadow-xl">
                <CardContent className="p-0">
                  <h3 className="font-poppins font-semibold text-xl text-neutral-800 mb-4">Request a Demo</h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    toast({
                      title: "Demo Request Submitted",
                      description: "We'll contact you shortly to schedule your demo",
                    });
                  }}>
                    <div className="mb-4">
                      <Input type="text" placeholder="Full Name" />
                    </div>
                    <div className="mb-4">
                      <Input type="email" placeholder="Email Address" />
                    </div>
                    <div className="mb-4">
                      <Input type="tel" placeholder="Phone Number" />
                    </div>
                    <div className="mb-4">
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Event Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="wedding">Wedding</SelectItem>
                          <SelectItem value="corporate">Corporate</SelectItem>
                          <SelectItem value="pooja">Traditional Pooja</SelectItem>
                          <SelectItem value="party">Private Party</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="bg-primary text-white font-semibold hover:bg-primary/90 w-full">
                      Schedule Demo
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white dark:bg-neutral-900 dark:text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-neutral-800 dark:text-white mb-4">
              Why Choose CaterEase
            </h2>
            <p className="text-lg text-neutral-800 dark:text-neutral-200 max-w-2xl mx-auto">
              Our platform offers unique advantages for bulk food ordering
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:shadow-md transition-shadow">
              <div className="bg-primary bg-opacity-10 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <Shield className="text-3xl text-primary" />
              </div>
              <h3 className="font-poppins font-semibold text-xl mb-3 dark:text-white">Verified Caterers</h3>
              <p className="text-neutral-800 dark:text-neutral-300">
                All caterers on our platform are thoroughly vetted for quality, hygiene, and reliability.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:shadow-md transition-shadow">
              <div className="bg-primary bg-opacity-10 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <Users className="text-3xl text-primary" />
              </div>
              <h3 className="font-poppins font-semibold text-xl mb-3 dark:text-white">Dedicated Support</h3>
              <p className="text-neutral-800 dark:text-neutral-300">
                Our team provides end-to-end assistance from order placement to event completion.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:shadow-md transition-shadow">
              <div className="bg-primary bg-opacity-10 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <CreditCard className="text-3xl text-primary" />
              </div>
              <h3 className="font-poppins font-semibold text-xl mb-3 dark:text-white">Transparent Pricing</h3>
              <p className="text-neutral-800 dark:text-neutral-300">
                No hidden fees or charges. Pay only for what you order with secure payment options.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:shadow-md transition-shadow">
              <div className="bg-primary bg-opacity-10 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <MenuSquare className="text-3xl text-primary" />
              </div>
              <h3 className="font-poppins font-semibold text-xl mb-3 dark:text-white">Customizable Menus</h3>
              <p className="text-neutral-800 dark:text-neutral-300">
                Tailor food options to match your event's requirements and dietary preferences.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:shadow-md transition-shadow">
              <div className="bg-primary bg-opacity-10 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <Clock className="text-3xl text-primary" />
              </div>
              <h3 className="font-poppins font-semibold text-xl mb-3 dark:text-white">Real-time Tracking</h3>
              <p className="text-neutral-800 dark:text-neutral-300">
                Monitor your order status in real-time and receive timely updates via email and SMS.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:shadow-md transition-shadow">
              <div className="bg-primary bg-opacity-10 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <Package className="text-3xl text-primary" />
              </div>
              <h3 className="font-poppins font-semibold text-xl mb-3 dark:text-white">Bulk Capacity</h3>
              <p className="text-neutral-800 dark:text-neutral-300">
                Easily order for 100 to 500+ guests with caterers specialized in handling large events.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Caterer Registration CTA */}
      <section className="py-16 bg-neutral-100 dark:bg-neutral-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center bg-white dark:bg-neutral-900 rounded-2xl shadow-lg overflow-hidden">
            <div className="md:w-1/2 p-8 md:p-12">
              <h2 className="font-poppins font-bold text-3xl md:text-4xl text-neutral-800 dark:text-white mb-4">
                Are you a caterer?
              </h2>
              <p className="text-lg text-neutral-800 dark:text-neutral-200 mb-6">
                Join our platform to reach more customers and grow your catering business. We connect you with clients looking for bulk food orders for various events.
              </p>
              <ul className="mb-8">
                <li className="flex items-start mb-3">
                  <CheckCircle2 className="text-success mr-2 mt-0.5 h-5 w-5" />
                  <span className="dark:text-neutral-200">Expand your customer base with large event orders</span>
                </li>
                <li className="flex items-start mb-3">
                  <CheckCircle2 className="text-success mr-2 mt-0.5 h-5 w-5" />
                  <span className="dark:text-neutral-200">Easy-to-use dashboard to manage orders and menus</span>
                </li>
                <li className="flex items-start mb-3">
                  <CheckCircle2 className="text-success mr-2 mt-0.5 h-5 w-5" />
                  <span className="dark:text-neutral-200">Secure and timely payments for all orders</span>
                </li>
                <li className="flex items-start mb-3">
                  <CheckCircle2 className="text-success mr-2 mt-0.5 h-5 w-5" />
                  <span className="dark:text-neutral-200">Marketing support to showcase your specialties</span>
                </li>
              </ul>
              <Button className="bg-primary text-white hover:bg-primary/90" onClick={handleCatererRegistration}>
                Register as a Caterer
              </Button>
            </div>
            <div className="md:w-1/2">
              <img
                src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Professional catering team preparing food in kitchen"
                className="w-full h-full object-cover min-h-[300px]"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
