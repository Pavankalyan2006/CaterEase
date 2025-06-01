import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";

// Interface for extending Express Request
declare global {
  namespace Express {
    interface Request {
      userId?: number;
      userRole?: string;
    }
  }
}

// Function to check if user is logged in
export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. Please login to continue." });
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json({ message: "User not found. Please login again." });
    }
    
    // Attach user ID and role to request object
    req.userId = user.id;
    req.userRole = user.role;
    
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Function to check if user is a caterer
export const isCaterer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.userId || req.userRole !== "caterer") {
      return res.status(403).json({ message: "Access denied. Only caterers can perform this action." });
    }
    
    const caterer = await storage.getCatererByUserId(req.userId);
    if (!caterer) {
      return res.status(403).json({ message: "Caterer profile not found. Please complete your profile." });
    }
    
    next();
  } catch (error) {
    console.error("Caterer verification error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Function to check if user is an admin
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.userId || req.userRole !== "admin") {
    return res.status(403).json({ message: "Access denied. Only admins can perform this action." });
  }
  
  next();
};
