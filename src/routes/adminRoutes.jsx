// Centralized route configuration for the entire admin panel
export const adminRoutes = [
  {
    title: "Dashboard",
    path: "/",
    icon: "📊",
    description: "View analytics and overview",
    category: "Main",
    keywords: ["dashboard", "home", "analytics", "stats", "overview"]
  },
  {
    title: "Products",
    path: "/product",
    icon: "🛍️",
    description: "Manage all products",
    category: "Inventory",
    keywords: ["products", "items", "goods", "stock", "merchandise"]
  },
  {
    title: "Add Product",
    path: "/add-product",
    icon: "➕",
    description: "Create new product",
    category: "Products",
    keywords: ["add product", "create product", "new product"],
    parent: "Products"
  },
  {
    title: "List Products",
    path: "/product",
    icon: "📋",
    description: "View all products",
    category: "Products",
    keywords: ["list products", "view products", "product list", "all products"],
    parent: "Products"
  },
  {
    title: "Banners",
    path: "/banner",
    icon: "🖼️",
    description: "Manage website banners",
    category: "Marketing",
    keywords: ["banners", "sliders", "promotions", "ads", "marketing"]
  },
  {
    title: "Add Banner",
    path: "/add-banner",
    icon: "➕",
    description: "Upload new banner",
    category: "Banners",
    keywords: ["add banner", "create banner", "new banner"],
    parent: "Banners"
  },
  {
    title: "List Banners",
    path: "/banner",
    icon: "📋",
    description: "View all banners",
    category: "Banners",
    keywords: ["list banners", "view banners", "banner list"],
    parent: "Banners"
  },
  {
    title: "Categories",
    path: "/category",
    icon: "🏷️",
    description: "Manage product categories",
    category: "Inventory",
    keywords: ["categories", "tags", "groups", "classification"]
  },
  {
    title: "Add Category",
    path: "/add-category",
    icon: "➕",
    description: "Create new category",
    category: "Categories",
    keywords: ["add category", "create category", "new category"],
    parent: "Categories"
  },
  {
    title: "Add SubCategory",
    path: "/add-subcategory",
    icon: "➕",
    description: "Create new category",
    category: "Categories",
    keywords: ["add category", "create category", "new category"],
    parent: "Categories"
  },
  {
    title: "List Categories",
    path: "/category",
    icon: "📋",
    description: "View all categories",
    category: "Categories",
    keywords: ["list categories", "view categories", "category list"],
    parent: "Categories"
  },
  {
    title: "Orders",
    path: "/orders",
    icon: "📦",
    description: "Manage customer orders",
    category: "Sales",
    keywords: ["orders", "purchases", "transactions", "sales", "invoices"]
  },
  {
    title: "Reviews",
    path: "/reviews",
    icon: "⭐",
    description: "Manage customer reviews",
    category: "Customer Service",
    keywords: ["reviews", "ratings", "feedback", "testimonials", "comments"]
  },
  {
    title: "Inventory",
    path: "/inventory",
    icon: "📊",
    description: "Manage stock and inventory",
    category: "Inventory",
    keywords: ["inventory", "stock", "warehouse", "supply", "quantities"]
  },
  {
    title: "Profile",
    path: "/profile",
    icon: "👤",
    description: "Manage your profile",
    category: "Account",
    keywords: ["profile", "account", "settings", "personal", "user"]
  },
  {
    title: "Settings",
    path: "/settings",
    icon: "⚙️",
    description: "System settings",
    category: "Configuration",
    keywords: ["settings", "configuration", "preferences", "setup", "admin"]
  }
];

// Helper function to search routes
export const searchRoutes = (query) => {
  if (!query || query.trim() === '') {
    return adminRoutes.filter(route => !route.parent); // Return only main routes
  }
  
  const searchTerm = query.toLowerCase().trim();
  
  return adminRoutes.filter(route => {
    const searchableText = [
      route.title,
      route.description,
      route.category,
      ...(route.keywords || [])
    ].join(' ').toLowerCase();
    
    return searchableText.includes(searchTerm);
  });
};

// Get main navigation items for sidebar
export const getMainNavItems = () => {
  return adminRoutes.filter(route => !route.parent);
};

// Get sub-items for a specific parent
export const getSubItems = (parentTitle) => {
  return adminRoutes.filter(route => route.parent === parentTitle);
};