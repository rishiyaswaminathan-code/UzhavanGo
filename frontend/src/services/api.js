// Centralized API Service for UzhavanGo React Frontend
const BASE_URL = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('uzhavan_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {})
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `HTTP error ${response.status}`);
  }

  return data;
}

export const api = {
  // Auth
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  adminLogin: (credentials) => request('/auth/admin/login', { method: 'POST', body: JSON.stringify(credentials) }),

  // Posts (Produce)
  getPosts: () => request('/posts'),
  createPost: (postData) => request('/posts', { method: 'POST', body: JSON.stringify(postData) }),
  deletePost: (id) => request(`/posts/${id}`, { method: 'DELETE' }),

  // Offers (Bids)
  getPostOffers: (postId) => request(`/posts/${postId}/offers`),
  submitOffer: (postId, offerData) => request(`/posts/${postId}/offers`, { method: 'POST', body: JSON.stringify(offerData) }),
  selectOffer: (offerId) => request(`/offers/${offerId}/select`, { method: 'POST' }),

  // Orders
  getOrders: () => request('/orders'),
  updateOrderStatus: (orderId, status) => request(`/orders/${orderId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Payments
  processPayment: (paymentData) => request('/payments', { method: 'POST', body: JSON.stringify(paymentData) }),

  // Admin APIs
  getAdminStats: () => request('/admin/stats'),
  getAdminFarmers: () => request('/admin/farmers'),
  getAdminBuyers: () => request('/admin/buyers'),
  updateUserStatus: (userId, active) => request(`/admin/users/${userId}/status`, { method: 'PATCH', body: JSON.stringify({ active }) }),
  getAdminProducts: () => request('/admin/products'),
  updateProductStatus: (id, status) => request(`/admin/products/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getAdminOffers: () => request('/admin/offers'),
  getAdminOrders: () => request('/admin/orders'),
  getAdminPayments: () => request('/admin/payments'),
  getAdminReports: () => request('/admin/reports'),
  updateReportStatus: (id, status) => request(`/admin/reports/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getAdminActivityLogs: () => request('/admin/activity-log'),
  sendAdminNotification: (notifData) => request('/admin/notifications', { method: 'POST', body: JSON.stringify(notifData) })
};
