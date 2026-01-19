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

  
  async getProfile() {
    return apiClient.get('/auth/profile/', {}, true);
  }

  async updateProfile(profileData) {
    return apiClient.put('/auth/profile/', profileData, true);
  }

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

  // Update product with PATCH method
  async updateProduct(id, productData) {
  // For FormData, let the browser set the Content-Type with boundary
  const config = productData instanceof FormData ? {} : {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  return apiClient.patch(`/admin/products/${id}/`, productData, config, true);
}

  async deleteProduct(id) {
    return apiClient.delete(`/admin/products/${id}/`, {}, true);
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

  async getAdminOrders() {
    return apiClient.get('/admin/orders/', {}, true);
  };

  async getAdminOrder  (orderId)  {
    return apiClient.get(`/admin/orders/${orderId}/`, {}, true);
  };

  async updateOrderStatus  (orderId, statusData)  {
   
    return apiClient.patch(`/admin/orders/${orderId}/`, statusData,{}, true);
  };

  async getAdminBanners() {
    return apiClient.get('/admin/banners/', {}, true);
  }

  async getBanner(id) {
    return apiClient.get(`/admin/banners/${id}/`, {}, true);
  }

  async createBanner(formData) {
    return apiClient.post('/admin/banners/', formData, {}, true, true);
  }

  async updateBanner(id, data, isFormData = false) {
    const headers = isFormData ? {} : { 'Content-Type': 'application/json' };
    const body = isFormData ? data : JSON.stringify(data);
    return apiClient.patch(`/admin/banners/${id}/`, body, headers, true);
  }

  async deleteBanner(id) {
    return apiClient.delete(`/admin/banners/${id}/`, {}, true);
  }

    async getAdminCoupons() {
    return apiClient.get('/admin/coupons/', {}, true);
  }

   async getCoupon(id) {
    return apiClient.get(`/admin/coupons/${id}/`, {}, true);
  }

  async createCoupon(formData) {
    return apiClient.post('/admin/coupons/', formData, {}, true, true);
  }

  async updateCoupon(id, data) {
 
    return apiClient.put(`/admin/coupons/${id}/`, data, {}, true);
  }

  async deleteCoupon(id) {
    return apiClient.delete(`/admin/coupons/${id}/`, {}, true);
  }

  async sendCoupon(couponId, emails) {
    return apiClient.post('/admin/coupons/send/', {
      coupon_id: couponId,
      emails: emails
    }, {}, true);
  }

  // Admin Inventory Management
  async getAdminInventory() {
    return apiClient.get('/admin/inventory/', {}, true);
  }


  async adjustInventory(productId, adjustment) {
    const adjustmentData = {
      product_id: productId,
      adjustment: adjustment
    };
    return apiClient.put('/admin/inventory/adjust/', adjustmentData, {}, true);
  }

   // Admin Reviews Management
  async getAdminReviews(params = {}) {
    // Build query parameters
    const queryParams = {};
    
    if (params.rating) queryParams.rating = params.rating;
    if (params.product_id) queryParams.product_id = params.product_id;
    if (params.user_id) queryParams.user_id = params.user_id;
    if (params.search) queryParams.search = params.search;
    if (params.date) queryParams.date = params.date;
    if (params.page) queryParams.page = params.page;
    if (params.page_size) queryParams.page_size = params.page_size;
    
    return apiClient.get('/admin/reviews/', queryParams, true);
  }

  async getReviewDetails(reviewId) {
    return apiClient.get(`/admin/reviews/${reviewId}/`, {}, true);
  }

  async deleteReview(reviewId) {
    return apiClient.delete(`/admin/reviews/${reviewId}/`, {}, true);
  }

  async updateReview(reviewId, reviewData) {
    return apiClient.put(`/admin/reviews/${reviewId}/`, reviewData, {}, true);
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