import apiClient from './ApiClient';

class ApiService {
  // Admin Authentication
  async adminLogin(credentials) {
    try {
      // Clear any existing token before login
      await apiClient.removeToken();
      
      const response = await apiClient.post('/auth/admin/login/', credentials);
      if (response.data.access_token) {
        // Store ONLY the token in cache storage
        await apiClient.storeToken(response.data.access_token);
      }
      return response;
    } catch (error) {
      // Ensure token is cleared on login failure
      await apiClient.removeToken();
      throw error;
    }
  }

  async adminLogout() {
    try {
      // Clear the token from cache storage
      await apiClient.removeToken();
      
      // Optional: Call backend logout endpoint if available
      // return await apiClient.post('/admin/logout', {}, {}, true);
      
      return { message: 'Logged out successfully' };
    } catch (error) {
      // Still clear token even if logout request fails
      await apiClient.removeToken();
      throw error;
    }
  }

  // Admin Products Management
  async getAdminProducts() {
    return apiClient.get('/admin/products', {}, true);
  }

  
async createProduct(productData) {
  // For FormData, let the browser set the Content-Type with boundary
  const config = productData instanceof FormData ? {} : {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  return apiClient.post('/admin/products/', productData, config, true);
}

  async updateProduct(id, productData) {
    return apiClient.put(`/admin/products/${id}`, productData, {}, true);
  }

  async deleteProduct(id) {
    return apiClient.delete(`/admin/products/${id}`, {}, true);
  }

  // Admin Categories Management
  async getAdminCategories() {
    return apiClient.get('/admin/categories', {}, true);
  }

  async createCategory(categoryData) {
    console.log(categoryData)
    return apiClient.post('/admin/categories/', categoryData, {}, true);
  }

  async updateCategory(id, categoryData) {
    return apiClient.put(`/admin/categories/${id}/`, categoryData, {}, true);
  }

  async deleteCategory(id) {
    return apiClient.delete(`/admin/categories/${id}`, {}, true);
  }

  // Admin Orders Management
  async getAdminOrders(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const url = queryParams ? `/admin/orders?${queryParams}` : '/admin/orders';
    return apiClient.get(url, {}, true);
  }

  async updateOrder(id, orderData) {
    return apiClient.put(`/admin/orders/${id}`, orderData, {}, true);
  }

  // Admin Inventory Management
  async getAdminInventory() {
    return apiClient.get('/admin/inventory', {}, true);
  }

  async adjustInventory(adjustmentData) {
    return apiClient.put('/admin/inventory/adjust', adjustmentData, {}, true);
  }

  // Admin Dashboard
  async getAdminDashboard() {
    return apiClient.get('/admin/dashboard', {}, true);
  }

  // Auth status check
  async checkAuthStatus() {
    return apiClient.isLoggedIn();
  }

  // Get current token (for debugging or specific use cases)
  async getCurrentToken() {
    return apiClient.getToken();
  }
}

export default new ApiService();