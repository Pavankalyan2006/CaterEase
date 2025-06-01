import { Request, Response } from "express";
import { storage } from "../storage";
import { insertOrderSchema, insertReviewSchema } from "@shared/schema";
import { z } from "zod";

// Place a new order
export const placeOrder = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Parse and validate order data
    const orderData = insertOrderSchema.parse({
      ...req.body,
      userId: req.userId
    });
    
    // Verify the caterer exists
    const caterer = await storage.getCaterer(orderData.catererId);
    if (!caterer) {
      return res.status(404).json({ message: "Caterer not found" });
    }
    
    // Verify the menu exists and belongs to the caterer
    const menu = await storage.getMenu(orderData.menuId);
    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }
    
    if (menu.catererId !== orderData.catererId) {
      return res.status(400).json({ message: "Menu does not belong to the selected caterer" });
    }
    
    // Verify plate count is within caterer's range
    if (orderData.noOfPlates < caterer.minPlate || orderData.noOfPlates > caterer.maxPlate) {
      return res.status(400).json({ 
        message: `Order must be between ${caterer.minPlate} and ${caterer.maxPlate} plates`
      });
    }
    
    // Create the order
    const newOrder = await storage.createOrder(orderData);
    
    res.status(201).json({
      message: "Order placed successfully",
      order: newOrder
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    
    console.error("Place order error:", error);
    res.status(500).json({ message: "Failed to place order" });
  }
};

// Get user's orders
export const getUserOrders = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const orders = await storage.getOrdersByUser(req.userId);
    
    // Get additional info for each order
    const ordersWithDetails = await Promise.all(orders.map(async (order) => {
      const caterer = await storage.getCaterer(order.catererId);
      const menu = await storage.getMenu(order.menuId);
      
      return {
        ...order,
        catererName: caterer?.businessName || "Unknown Caterer",
        menuName: menu?.name || "Unknown Menu"
      };
    }));
    
    res.status(200).json(ordersWithDetails);
  } catch (error) {
    console.error("Get user orders error:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

// Get order details by ID
export const getOrderById = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const orderId = parseInt(req.params.id);
    
    const order = await storage.getOrder(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Check if the user is authorized to view this order
    // Users can view their own orders, caterers can view orders assigned to them
    if (order.userId !== req.userId) {
      const caterer = await storage.getCatererByUserId(req.userId);
      if (!caterer || order.catererId !== caterer.id) {
        return res.status(403).json({ message: "You don't have permission to view this order" });
      }
    }
    
    // Get additional info
    const caterer = await storage.getCaterer(order.catererId);
    const menu = await storage.getMenu(order.menuId);
    const user = await storage.getUser(order.userId);
    
    const orderDetails = {
      ...order,
      caterer,
      menu,
      userName: user?.name || "Unknown User"
    };
    
    res.status(200).json(orderDetails);
  } catch (error) {
    console.error("Get order details error:", error);
    res.status(500).json({ message: "Failed to fetch order details" });
  }
};

// Update order status (for caterers)
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const orderId = parseInt(req.params.id);
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }
    
    // Check if status is valid
    const validStatuses = ["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    
    // Get the order
    const order = await storage.getOrder(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Check if the caterer is authorized to update this order
    const caterer = await storage.getCatererByUserId(req.userId);
    if (!caterer || order.catererId !== caterer.id) {
      return res.status(403).json({ message: "You don't have permission to update this order" });
    }
    
    // Update the order status
    const updatedOrder = await storage.updateOrderStatus(orderId, status);
    if (!updatedOrder) {
      return res.status(404).json({ message: "Failed to update order status" });
    }
    
    res.status(200).json({
      message: "Order status updated successfully",
      order: updatedOrder
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ message: "Failed to update order status" });
  }
};

// Add a review for a completed order
export const addReview = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const orderId = parseInt(req.params.id);
    
    // Get the order
    const order = await storage.getOrder(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Check if the user is authorized to review this order
    if (order.userId !== req.userId) {
      return res.status(403).json({ message: "You don't have permission to review this order" });
    }
    
    // Check if the order is delivered
    if (order.status !== "delivered") {
      return res.status(400).json({ message: "You can only review delivered orders" });
    }
    
    // Parse and validate review data
    const reviewData = insertReviewSchema.parse({
      ...req.body,
      userId: req.userId,
      catererId: order.catererId,
      orderId
    });
    
    // Create the review
    const newReview = await storage.createReview(reviewData);
    
    res.status(201).json({
      message: "Review added successfully",
      review: newReview
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    
    console.error("Add review error:", error);
    res.status(500).json({ message: "Failed to add review" });
  }
};
