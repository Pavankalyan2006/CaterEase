import { Request, Response } from "express";
import { storage } from "../storage";
import { insertUserSchema, loginSchema, userRegisterSchema, catererRegisterSchema } from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod-validation-error";
import crypto from "crypto";

// Helper function to hash passwords
const hashPassword = (password: string): string => {
  return crypto.createHash("sha256").update(password).digest("hex");
};

// Register a new user
export const registerUser = async (req: Request, res: Response) => {
  try {
    const userData = userRegisterSchema.parse(req.body);
    
    // Check if username already exists
    const existingUsername = await storage.getUserByUsername(userData.username);
    if (existingUsername) {
      return res.status(400).json({ message: "Username is already taken" });
    }
    
    // Check if email already exists
    const existingEmail = await storage.getUserByEmail(userData.email);
    if (existingEmail) {
      return res.status(400).json({ message: "Email is already registered" });
    }
    
    // Hash password and create user
    const hashedPassword = hashPassword(userData.password);
    const userToCreate = insertUserSchema.parse({
      ...userData,
      password: hashedPassword
    });
    
    const newUser = await storage.createUser(userToCreate);
    
    // Set user session
    req.session.userId = newUser.id;
    
    // Return user without password
    const { password, ...userWithoutPassword } = newUser;
    res.status(201).json({
      message: "User registered successfully",
      user: userWithoutPassword
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    
    console.error("Register error:", error);
    res.status(500).json({ message: "Failed to register user" });
  }
};

// Register a new caterer
export const registerCaterer = async (req: Request, res: Response) => {
  try {
    const catererData = catererRegisterSchema.parse(req.body);
    
    // Check if username already exists
    const existingUsername = await storage.getUserByUsername(catererData.username);
    if (existingUsername) {
      return res.status(400).json({ message: "Username is already taken" });
    }
    
    // Check if email already exists
    const existingEmail = await storage.getUserByEmail(catererData.email);
    if (existingEmail) {
      return res.status(400).json({ message: "Email is already registered" });
    }
    
    // Hash password and create user
    const hashedPassword = hashPassword(catererData.password);
    const userToCreate = insertUserSchema.parse({
      username: catererData.username,
      email: catererData.email,
      password: hashedPassword,
      name: catererData.name,
      phone: catererData.phone,
      address: catererData.address,
      city: catererData.city,
      state: catererData.state,
      role: "caterer"
    });
    
    const newUser = await storage.createUser(userToCreate);
    
    // Create caterer profile
    const catererToCreate = {
      userId: newUser.id,
      businessName: catererData.businessName,
      description: catererData.description,
      location: catererData.location,
      city: catererData.city,
      state: catererData.state,
      minPlate: catererData.minPlate,
      maxPlate: catererData.maxPlate,
      specialties: catererData.specialties,
      eventTypes: catererData.eventTypes
    };
    
    const newCaterer = await storage.createCaterer(catererToCreate);
    
    // Set user session
    req.session.userId = newUser.id;
    
    res.status(201).json({
      message: "Caterer registered successfully",
      caterer: newCaterer
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    
    console.error("Caterer register error:", error);
    res.status(500).json({ message: "Failed to register caterer" });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const loginData = loginSchema.parse(req.body);
    
    // Find user by username
    const user = await storage.getUserByUsername(loginData.username);
    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }
    
    // Verify password
    const hashedPassword = hashPassword(loginData.password);
    if (user.password !== hashedPassword) {
      return res.status(400).json({ message: "Invalid username or password" });
    }
    
    // Set user session
    req.session.userId = user.id;
    
    // Get caterer info if user is a caterer
    let caterer = null;
    if (user.role === "caterer") {
      caterer = await storage.getCatererByUserId(user.id);
    }
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    res.status(200).json({
      message: "Login successful",
      user: userWithoutPassword,
      caterer
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    
    console.error("Login error:", error);
    res.status(500).json({ message: "Failed to login" });
  }
};

// Logout user
export const logout = (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Failed to logout" });
    }
    
    res.clearCookie("connect.sid");
    res.status(200).json({ message: "Logged out successfully" });
  });
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Get caterer info if user is a caterer
    let caterer = null;
    if (user.role === "caterer") {
      caterer = await storage.getCatererByUserId(user.id);
    }
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    res.status(200).json({
      user: userWithoutPassword,
      caterer
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ message: "Failed to get current user" });
  }
};
