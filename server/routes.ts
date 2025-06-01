import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import MemoryStore from "memorystore";

// Import controllers
import * as authController from "./controllers/auth.controller";
import * as catererController from "./controllers/caterer.controller";
import * as orderController from "./controllers/order.controller";

// Import middleware
import { isAuthenticated, isCaterer, isAdmin } from "./middleware/auth.middleware";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware
  const MemoryStoreSession = MemoryStore(session);
  app.use(
    session({
      secret: "catereaseapp_secret_key",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production", maxAge: 86400000 }, // 24 hours
      store: new MemoryStoreSession({
        checkPeriod: 86400000 // prune expired entries every 24h
      }),
    })
  );

  // Auth routes
  app.post("/api/auth/register", authController.registerUser);
  app.post("/api/auth/register-caterer", authController.registerCaterer);
  app.post("/api/auth/login", authController.login);
  app.post("/api/auth/logout", authController.logout);
  app.get("/api/auth/me", authController.getCurrentUser);

  // Caterer routes
  app.get("/api/caterers", catererController.getAllCaterers);
  app.get("/api/caterers/search", catererController.searchCaterers);
  app.get("/api/caterers/:id", catererController.getCatererById);
  app.put("/api/caterers/profile", isAuthenticated, isCaterer, catererController.updateCatererProfile);
  app.post("/api/caterers/menus", isAuthenticated, isCaterer, catererController.addMenu);
  app.put("/api/caterers/menus/:id", isAuthenticated, isCaterer, catererController.updateMenu);
  app.delete("/api/caterers/menus/:id", isAuthenticated, isCaterer, catererController.deleteMenu);
  app.get("/api/caterers/orders", isAuthenticated, isCaterer, catererController.getCatererOrders);

  // Order routes
  app.post("/api/orders", isAuthenticated, orderController.placeOrder);
  app.get("/api/orders", isAuthenticated, orderController.getUserOrders);
  app.get("/api/orders/:id", isAuthenticated, orderController.getOrderById);
  app.put("/api/orders/:id/status", isAuthenticated, isCaterer, orderController.updateOrderStatus);
  app.post("/api/orders/:id/reviews", isAuthenticated, orderController.addReview);

  const httpServer = createServer(app);

  return httpServer;
}
