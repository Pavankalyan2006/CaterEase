import { Request, Response } from "express";
import { storage } from "../storage";
import { insertMenuSchema } from "@shared/schema";
import { z } from "zod";

// Get all caterers
export const getAllCaterers = async (_req: Request, res: Response) => {
  try {
    const caterers = await storage.getAllCaterers();
    res.status(200).json(caterers);
  } catch (error) {
    console.error("Get all caterers error:", error);
    res.status(500).json({ message: "Failed to fetch caterers" });
  }
};

// Search caterers by location and/or event type
export const searchCaterers = async (req: Request, res: Response) => {
  try {
    const { location, eventType } = req.query;
    
    const caterers = await storage.searchCaterers(
      location as string | undefined,
      eventType as string | undefined
    );
    
    res.status(200).json(caterers);
  } catch (error) {
    console.error("Search caterers error:", error);
    res.status(500).json({ message: "Failed to search caterers" });
  }
};

// Get caterer by ID
export const getCatererById = async (req: Request, res: Response) => {
  try {
    const catererId = parseInt(req.params.id);
    
    const caterer = await storage.getCaterer(catererId);
    if (!caterer) {
      return res.status(404).json({ message: "Caterer not found" });
    }
    
    // Get menus for this caterer
    const menus = await storage.getMenusByCaterer(catererId);
    
    // Get reviews for this caterer
    const reviews = await storage.getReviewsByCaterer(catererId);
    
    res.status(200).json({
      caterer,
      menus,
      reviews
    });
  } catch (error) {
    console.error("Get caterer error:", error);
    res.status(500).json({ message: "Failed to fetch caterer details" });
  }
};

// Update caterer profile
export const updateCatererProfile = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Get the caterer profile for this user
    const caterer = await storage.getCatererByUserId(req.userId);
    if (!caterer) {
      return res.status(404).json({ message: "Caterer profile not found" });
    }
    
    // Update the caterer profile
    const updatedCaterer = await storage.updateCaterer(caterer.id, req.body);
    if (!updatedCaterer) {
      return res.status(404).json({ message: "Failed to update profile" });
    }
    
    res.status(200).json({
      message: "Profile updated successfully",
      caterer: updatedCaterer
    });
  } catch (error) {
    console.error("Update caterer error:", error);
    res.status(500).json({ message: "Failed to update caterer profile" });
  }
};

// Add a new menu
export const addMenu = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Get the caterer profile for this user
    const caterer = await storage.getCatererByUserId(req.userId);
    if (!caterer) {
      return res.status(404).json({ message: "Caterer profile not found" });
    }
    
    // Create the menu
    const menuData = insertMenuSchema.parse({
      ...req.body,
      catererId: caterer.id
    });
    
    const newMenu = await storage.createMenu(menuData);
    
    res.status(201).json({
      message: "Menu added successfully",
      menu: newMenu
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    
    console.error("Add menu error:", error);
    res.status(500).json({ message: "Failed to add menu" });
  }
};

// Update a menu
export const updateMenu = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const menuId = parseInt(req.params.id);
    
    // Get the menu
    const menu = await storage.getMenu(menuId);
    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }
    
    // Get the caterer profile for this user
    const caterer = await storage.getCatererByUserId(req.userId);
    if (!caterer) {
      return res.status(404).json({ message: "Caterer profile not found" });
    }
    
    // Check if the menu belongs to this caterer
    if (menu.catererId !== caterer.id) {
      return res.status(403).json({ message: "You don't have permission to edit this menu" });
    }
    
    // Update the menu
    const updatedMenu = await storage.updateMenu(menuId, req.body);
    if (!updatedMenu) {
      return res.status(404).json({ message: "Failed to update menu" });
    }
    
    res.status(200).json({
      message: "Menu updated successfully",
      menu: updatedMenu
    });
  } catch (error) {
    console.error("Update menu error:", error);
    res.status(500).json({ message: "Failed to update menu" });
  }
};

// Delete a menu
export const deleteMenu = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const menuId = parseInt(req.params.id);
    
    // Get the menu
    const menu = await storage.getMenu(menuId);
    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }
    
    // Get the caterer profile for this user
    const caterer = await storage.getCatererByUserId(req.userId);
    if (!caterer) {
      return res.status(404).json({ message: "Caterer profile not found" });
    }
    
    // Check if the menu belongs to this caterer
    if (menu.catererId !== caterer.id) {
      return res.status(403).json({ message: "You don't have permission to delete this menu" });
    }
    
    // Delete the menu
    const result = await storage.deleteMenu(menuId);
    if (!result) {
      return res.status(404).json({ message: "Failed to delete menu" });
    }
    
    res.status(200).json({
      message: "Menu deleted successfully"
    });
  } catch (error) {
    console.error("Delete menu error:", error);
    res.status(500).json({ message: "Failed to delete menu" });
  }
};

// Get orders for a caterer
export const getCatererOrders = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Get the caterer profile for this user
    const caterer = await storage.getCatererByUserId(req.userId);
    if (!caterer) {
      return res.status(404).json({ message: "Caterer profile not found" });
    }
    
    // Get orders for this caterer
    const orders = await storage.getOrdersByCaterer(caterer.id);
    
    res.status(200).json(orders);
  } catch (error) {
    console.error("Get caterer orders error:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};
