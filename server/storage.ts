import { 
  users, type User, type InsertUser, 
  caterers, type Caterer, type InsertCaterer,
  menus, type Menu, type InsertMenu,
  orders, type Order, type InsertOrder,
  reviews, type Review, type InsertReview
} from "@shared/schema";

// Storage interface for all database operations
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Caterer methods
  getCaterer(id: number): Promise<Caterer | undefined>;
  getCatererByUserId(userId: number): Promise<Caterer | undefined>;
  createCaterer(caterer: InsertCaterer): Promise<Caterer>;
  updateCaterer(id: number, caterer: Partial<Caterer>): Promise<Caterer | undefined>;
  getAllCaterers(): Promise<Caterer[]>;
  searchCaterers(location?: string, eventType?: string): Promise<Caterer[]>;
  
  // Menu methods
  getMenu(id: number): Promise<Menu | undefined>;
  getMenusByCaterer(catererId: number): Promise<Menu[]>;
  createMenu(menu: InsertMenu): Promise<Menu>;
  updateMenu(id: number, menu: Partial<Menu>): Promise<Menu | undefined>;
  deleteMenu(id: number): Promise<boolean>;
  
  // Order methods
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersByUser(userId: number): Promise<Order[]>;
  getOrdersByCaterer(catererId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // Review methods
  getReview(id: number): Promise<Review | undefined>;
  getReviewsByCaterer(catererId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private caterers: Map<number, Caterer>;
  private menus: Map<number, Menu>;
  private orders: Map<number, Order>;
  private reviews: Map<number, Review>;
  
  private userId: number;
  private catererId: number;
  private menuId: number;
  private orderId: number;
  private reviewId: number;

  constructor() {
    this.users = new Map();
    this.caterers = new Map();
    this.menus = new Map();
    this.orders = new Map();
    this.reviews = new Map();
    
    this.userId = 1;
    this.catererId = 1;
    this.menuId = 1;
    this.orderId = 1;
    this.reviewId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    // Ensure all required fields have proper values
    const user: User = { 
      ...insertUser, 
      id,
      address: insertUser.address || null,
      city: insertUser.city || null,
      state: insertUser.state || null,
      role: insertUser.role || "user"
    };
    this.users.set(id, user);
    return user;
  }

  // Caterer methods
  async getCaterer(id: number): Promise<Caterer | undefined> {
    return this.caterers.get(id);
  }

  async getCatererByUserId(userId: number): Promise<Caterer | undefined> {
    return Array.from(this.caterers.values()).find(
      (caterer) => caterer.userId === userId
    );
  }

  async createCaterer(insertCaterer: InsertCaterer): Promise<Caterer> {
    const id = this.catererId++;
    const caterer: Caterer = { 
      ...insertCaterer, 
      id,
      description: insertCaterer.description || null,
      rating: insertCaterer.rating || null,
      reviewCount: insertCaterer.reviewCount || null,
      specialties: insertCaterer.specialties || null,
      eventTypes: insertCaterer.eventTypes || null
    };
    this.caterers.set(id, caterer);
    return caterer;
  }

  async updateCaterer(id: number, catererData: Partial<Caterer>): Promise<Caterer | undefined> {
    const caterer = this.caterers.get(id);
    if (!caterer) return undefined;
    
    const updatedCaterer = { ...caterer, ...catererData };
    this.caterers.set(id, updatedCaterer);
    return updatedCaterer;
  }

  async getAllCaterers(): Promise<Caterer[]> {
    return Array.from(this.caterers.values());
  }

  async searchCaterers(location?: string, eventType?: string): Promise<Caterer[]> {
    return Array.from(this.caterers.values()).filter(caterer => {
      let match = true;
      
      if (location && !caterer.location.toLowerCase().includes(location.toLowerCase()) && 
          !caterer.city.toLowerCase().includes(location.toLowerCase()) &&
          !caterer.state.toLowerCase().includes(location.toLowerCase())) {
        match = false;
      }
      
      if (eventType && caterer.eventTypes && !caterer.eventTypes.includes(eventType as any)) {
        match = false;
      }
      
      return match;
    });
  }

  // Menu methods
  async getMenu(id: number): Promise<Menu | undefined> {
    return this.menus.get(id);
  }

  async getMenusByCaterer(catererId: number): Promise<Menu[]> {
    return Array.from(this.menus.values()).filter(
      (menu) => menu.catererId === catererId
    );
  }

  async createMenu(insertMenu: InsertMenu): Promise<Menu> {
    const id = this.menuId++;
    const menu: Menu = { 
      ...insertMenu, 
      id,
      description: insertMenu.description || null,
      isVegetarian: insertMenu.isVegetarian || false,
      isSpecial: insertMenu.isSpecial || false
    };
    this.menus.set(id, menu);
    return menu;
  }

  async updateMenu(id: number, menuData: Partial<Menu>): Promise<Menu | undefined> {
    const menu = this.menus.get(id);
    if (!menu) return undefined;
    
    const updatedMenu = { ...menu, ...menuData };
    this.menus.set(id, updatedMenu);
    return updatedMenu;
  }

  async deleteMenu(id: number): Promise<boolean> {
    return this.menus.delete(id);
  }

  // Order methods
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrdersByUser(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.userId === userId
    );
  }

  async getOrdersByCaterer(catererId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.catererId === catererId
    );
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.orderId++;
    const createdAt = new Date();
    const order: Order = { 
      ...insertOrder, 
      id, 
      createdAt,
      status: insertOrder.status || "pending",
      specialInstructions: insertOrder.specialInstructions || null
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, status: status as any };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Review methods
  async getReview(id: number): Promise<Review | undefined> {
    return this.reviews.get(id);
  }

  async getReviewsByCaterer(catererId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.catererId === catererId
    );
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.reviewId++;
    const createdAt = new Date();
    const review: Review = { 
      ...insertReview, 
      id, 
      createdAt,
      comment: insertReview.comment || null
    };
    this.reviews.set(id, review);
    
    // Update caterer rating
    const caterer = this.caterers.get(insertReview.catererId);
    if (caterer) {
      const catererReviews = await this.getReviewsByCaterer(caterer.id);
      const totalRating = catererReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / catererReviews.length;
      
      this.updateCaterer(caterer.id, {
        rating: Math.round(averageRating),
        reviewCount: catererReviews.length
      });
    }
    
    return review;
  }
}

export const storage = new MemStorage();
