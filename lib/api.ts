const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Get token from localStorage
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Save token to localStorage
export const saveToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
};

// Remove token from localStorage
export const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
};

// Generic fetch with auth
const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
};

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    authFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  
  register: (data: { email: string; password: string; firstName: string; lastName: string }) =>
    authFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Courses API
export const coursesAPI = {
  getAll: () => authFetch('/courses'),
  getOne: (id: string) => authFetch(`/courses/${id}`),
  create: (data: any) => authFetch('/courses', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  createWithFiles: async (data: FormData) => {
    const token = getToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}/courses`, {
      method: 'POST',
      headers,
      body: data, // FormData - don't set Content-Type, browser will set it with boundary
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  },
  update: (id: string, data: any) => authFetch(`/courses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  updateWithFiles: async (id: string, data: FormData) => {
    const token = getToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}/courses/${id}`, {
      method: 'PUT',
      headers,
      body: data, // FormData - don't set Content-Type, browser will set it with boundary
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  },
  delete: (id: string) => authFetch(`/courses/${id}`, {
    method: 'DELETE',
  }),
  
  // Schedules
  getSchedules: (courseId: string) => authFetch(`/courses/${courseId}/schedules`),
  createSchedule: (courseId: string, data: any) => authFetch(`/courses/${courseId}/schedules`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateSchedule: (courseId: string, scheduleId: string, data: any) => 
    authFetch(`/courses/${courseId}/schedules/${scheduleId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteSchedule: (courseId: string, scheduleId: string) =>
    authFetch(`/courses/${courseId}/schedules/${scheduleId}`, {
      method: 'DELETE',
    }),
};

// Videos API
export const videosAPI = {
  // Categories
  getCategories: () => authFetch('/videos/categories'),
  getCategory: (id: string) => authFetch(`/videos/categories/${id}`),
  createCategory: (data: any) => authFetch('/videos/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateCategory: (id: string, data: any) => authFetch(`/videos/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  deleteCategory: (id: string) => authFetch(`/videos/categories/${id}`, {
    method: 'DELETE',
  }),
  
  // Videos
  getAll: () => authFetch('/videos'),
  getOne: (id: string) => authFetch(`/videos/${id}`),
  create: async (data: FormData) => {
    const token = getToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}/videos`, {
      method: 'POST',
      headers,
      body: data, // FormData - don't set Content-Type, browser will set it with boundary
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  },
  update: async (id: string, data: FormData) => {
    const token = getToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}/videos/${id}`, {
      method: 'PATCH',
      headers,
      body: data, // FormData - don't set Content-Type, browser will set it with boundary
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  },
  delete: (id: string) => authFetch(`/videos/${id}`, {
    method: 'DELETE',
  }),
};

// Contacts API
export const contactsAPI = {
  getAll: () => authFetch('/contacts'),
  getOne: (id: string) => authFetch(`/contacts/${id}`),
  markAsRead: (id: string) => authFetch(`/contacts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ isRead: true }),
  }),
  updateStatus: (id: string, status: string) => authFetch(`/contacts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
  respond: (id: string, response: string) => authFetch(`/contacts/${id}/respond`, {
    method: 'POST',
    body: JSON.stringify({ adminResponse: response }),
  }),
  delete: (id: string) => authFetch(`/contacts/${id}`, {
    method: 'DELETE',
  }),
};

// Locations API
export const locationsAPI = {
  getAll: () => authFetch('/locations'),
  getOne: (id: string) => authFetch(`/locations/${id}`),
  create: (data: any) => authFetch('/locations', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => authFetch(`/locations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => authFetch(`/locations/${id}`, {
    method: 'DELETE',
  }),
};

// Categories API
export const categoriesAPI = {
  getAll: () => authFetch('/categories'),
  getOne: (id: string) => authFetch(`/categories/${id}`),
  create: (data: any) => authFetch('/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => authFetch(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => authFetch(`/categories/${id}`, {
    method: 'DELETE',
  }),
};

// BMI API (Admin endpoints - will need to be created in backend)
export const bmiAPI = {
  // Get all BMI records across all users
  getAllRecords: () => authFetch('/admin/bmi'),
  // Get BMI records for specific user
  getUserRecords: (userId: string) => authFetch(`/admin/bmi/user/${userId}`),
  // Get BMI statistics
  getStats: () => authFetch('/admin/bmi/stats'),
  // Delete BMI record
  deleteRecord: (id: string) => authFetch(`/admin/bmi/${id}`, {
    method: 'DELETE',
  }),
};
