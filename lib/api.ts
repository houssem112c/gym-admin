const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');

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

// Health check API (no auth required)
export const healthAPI = {
  check: async () => {
    try {
      const response = await fetch(`${API_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Health check failed');
      }

      return response.json();
    } catch (error) {
      throw error;
    }
  },
};

// Generic fetch with auth
const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  console.log(`📡 Sending ${options.method || 'GET'} to: ${API_URL}${url}`);
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  // Handle unauthorized/forbidden responses
  if (response.status === 401 || response.status === 403) {
    removeToken();
    // Remove admin_token cookie as well
    if (typeof window !== 'undefined') {
      document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      window.location.href = '/';
    }
    throw new Error('Authentication required. Please login again.');
  }

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

    // Handle unauthorized/forbidden responses
    if (response.status === 401 || response.status === 403) {
      removeToken();
      if (typeof window !== 'undefined') {
        document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
        window.location.href = '/';
      }
      throw new Error('Authentication required. Please login again.');
    }

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

    // Handle unauthorized/forbidden responses
    if (response.status === 401 || response.status === 403) {
      removeToken();
      if (typeof window !== 'undefined') {
        document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
        window.location.href = '/';
      }
      throw new Error('Authentication required. Please login again.');
    }

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

// Stories API
export const storiesAPI = {
  getAll: () => authFetch('/stories'),
  getAllGrouped: () => authFetch('/stories/grouped'),
  getOne: (id: string) => authFetch(`/stories/${id}`),
  uploadStory: async (formData: FormData) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/stories/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    return response.json();
  },
  create: (data: any) => authFetch('/stories', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => authFetch(`/stories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => authFetch(`/stories/${id}`, {
    method: 'DELETE',
  }),
};

// Exercises API
export const exercisesAPI = {
  getAll: () => authFetch('/exercises'),
  getOne: (id: string) => authFetch(`/exercises/${id}`),
  create: (data: any) => authFetch('/exercises', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => authFetch(`/exercises/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  createWithFiles: async (data: FormData) => {
    const token = getToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    console.log(`📡 Sending POST (with files) to: ${API_URL}/exercises`);
    const response = await fetch(`${API_URL}/exercises`, {
      method: 'POST',
      headers,
      body: data,
    });

    if (response.status === 401 || response.status === 403) {
      removeToken();
      if (typeof window !== 'undefined') {
        document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
        window.location.href = '/';
      }
      throw new Error('Authentication required. Please login again.');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }
    return response.json();
  },
  updateWithFiles: async (id: string, data: FormData) => {
    const token = getToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}/exercises/${id}`, {
      method: 'PATCH',
      headers,
      body: data,
    });

    if (response.status === 401 || response.status === 403) {
      removeToken();
      if (typeof window !== 'undefined') {
        document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
        window.location.href = '/';
      }
      throw new Error('Authentication required. Please login again.');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }
    return response.json();
  },
  delete: (id: string) => authFetch(`/exercises/${id}`, {
    method: 'DELETE',
  }),
};

// Workout Plans API
export const workoutPlansAPI = {
  getAll: () => authFetch('/workout-plans'),
  getOne: (id: string) => authFetch(`/workout-plans/${id}`),
  create: (data: any) => authFetch('/workout-plans', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => authFetch(`/workout-plans/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  createWithFiles: async (data: FormData) => {
    const token = getToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}/workout-plans`, {
      method: 'POST',
      headers,
      body: data,
    });

    if (response.status === 401 || response.status === 403) {
      removeToken();
      if (typeof window !== 'undefined') {
        document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
        window.location.href = '/';
      }
      throw new Error('Authentication required. Please login again.');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }
    return response.json();
  },
  updateWithFiles: async (id: string, data: FormData) => {
    const token = getToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}/workout-plans/${id}`, {
      method: 'PATCH',
      headers,
      body: data,
    });

    if (response.status === 401 || response.status === 403) {
      removeToken();
      if (typeof window !== 'undefined') {
        document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
        window.location.href = '/';
      }
      throw new Error('Authentication required. Please login again.');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }
    return response.json();
  },
  delete: (id: string) => authFetch(`/workout-plans/${id}`, {
    method: 'DELETE',
  }),
};

// User Progress API (Admin view)
export const userProgressAPI = {
  getPhotos: (userId: string) => authFetch(`/user-progress/photos`),
  getMeasurements: (userId: string) => authFetch(`/user-progress/measurements`),
  getPRs: (userId: string) => authFetch(`/user-progress/prs`),
};

// Users API
export const usersAPI = {
  getAll: () => authFetch('/admin/users'),
  getOne: (id: string) => authFetch(`/admin/users/${id}`),
  create: (data: any) => authFetch('/admin/users', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => authFetch(`/admin/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => authFetch(`/admin/users/${id}`, {
    method: 'DELETE',
  }),
  importExcel: async (file: File) => {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/admin/users/import`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Import failed' }));
      throw new Error(error.message || 'Import failed');
    }

    return response.json();
  },
  exportExcel: async () => {
    const token = getToken();
    const response = await fetch(`${API_URL}/admin/users/export/excel`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};

