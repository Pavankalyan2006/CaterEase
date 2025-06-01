import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin, Clock } from "lucide-react";

const Footer = () => {
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Email is required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, this would send a request to an API
    toast({
      title: "Subscribed!",
      description: "You've been subscribed to our newsletter",
    });
    
    setEmail('');
  };

  return (
    <footer className="bg-neutral-800 text-white pt-16 pb-8 dark:bg-neutral-900">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-6">
              <span className="text-primary text-3xl mr-2">🍽️</span>
              <h2 className="font-poppins font-bold text-2xl">CaterEase</h2>
            </div>
            <p className="text-neutral-200 mb-6">
              Simplifying bulk food ordering for all types of events. Connect with the best caterers in your area.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="bg-neutral-700 hover:bg-primary w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="bg-neutral-700 hover:bg-primary w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                className="bg-neutral-700 hover:bg-primary w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                className="bg-neutral-700 hover:bg-primary w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-poppins font-semibold text-xl mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/">
                  <a className="text-neutral-200 hover:text-primary transition-colors">Home</a>
                </Link>
              </li>
              <li>
                <Link href="/browse">
                  <a className="text-neutral-200 hover:text-primary transition-colors">Browse Caterers</a>
                </Link>
              </li>
              <li>
                <Link href="/login">
                  <a className="text-neutral-200 hover:text-primary transition-colors">Login</a>
                </Link>
              </li>
              <li>
                <Link href="/register">
                  <a className="text-neutral-200 hover:text-primary transition-colors">Register</a>
                </Link>
              </li>
              <li>
                <Link href="/caterer-register">
                  <a className="text-neutral-200 hover:text-primary transition-colors">Register as Caterer</a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-poppins font-semibold text-xl mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="mr-3 mt-1 h-5 w-5" />
                <span className="text-neutral-200">
                  123 Business Park, Bangalore, Karnataka, India - 560001
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="mr-3 h-5 w-5" />
                <span className="text-neutral-200">+91 1234567890</span>
              </li>
              <li className="flex items-center">
                <Mail className="mr-3 h-5 w-5" />
                <span className="text-neutral-200">info@caterease.com</span>
              </li>
              <li className="flex items-center">
                <Clock className="mr-3 h-5 w-5" />
                <span className="text-neutral-200">Mon-Fri: 9AM-6PM</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-poppins font-semibold text-xl mb-6">Newsletter</h3>
            <p className="text-neutral-200 mb-4">
              Subscribe to our newsletter for the latest updates on new caterers and special offers.
            </p>
            <form className="flex flex-col space-y-3" onSubmit={handleSubscribe}>
              <Input
                type="email"
                placeholder="Your Email Address"
                className="px-4 py-3 rounded-lg bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400 focus:border-primary"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button type="submit" className="bg-primary text-white hover:bg-primary/90">
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        <div className="pt-8 border-t border-neutral-700 flex flex-col md:flex-row justify-between items-center">
          <p className="text-neutral-400 mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} CaterEase. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-neutral-400 hover:text-primary transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-neutral-400 hover:text-primary transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-neutral-400 hover:text-primary transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
