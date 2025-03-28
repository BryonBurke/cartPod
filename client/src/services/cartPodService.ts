import axios from 'axios';

export interface FoodCart {
  _id: string;
  name: string;
  description?: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  cartPod: string;
  podLocationImage: string;
  cartImage: string;
  menuImages: string[];
  owner: string;
  reviews: Array<{
    rating: number;
    comment: string;
    user: string;
    createdAt: string;
  }>;
  averageRating: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartPod {
  _id: string;
  name: string;
  description?: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  cuisine?: string;
  hours?: {
    [key: string]: string;
  };
  images?: string[];
  foodCarts?: FoodCart[];
  createdAt: string;
  updatedAt: string;
}

const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) {
  console.error('VITE_API_URL is not defined in environment variables');
}

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const cartPodService = {
  getAllCartPods: async (): Promise<CartPod[]> => {
    try {
      if (!API_URL) {
        throw new Error('API URL is not configured');
      }
      console.log('Fetching cart pods from:', API_URL);
      const response = await api.get('/cartpods');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error fetching cart pods:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url
        });
      } else {
        console.error('Error fetching cart pods:', error);
      }
      throw error;
    }
  },

  createCartPod: async (cartPodData: Omit<CartPod, '_id' | 'createdAt' | 'updatedAt'>): Promise<CartPod> => {
    try {
      if (!API_URL) {
        throw new Error('API URL is not configured');
      }
      const response = await api.post('/cartpods', cartPodData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error creating cart pod:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
      } else {
        console.error('Error creating cart pod:', error);
      }
      throw error;
    }
  },

  updateCartPod: async (id: string, cartPodData: Partial<CartPod>): Promise<CartPod> => {
    try {
      if (!API_URL) {
        throw new Error('API URL is not configured');
      }
      const response = await api.put(`/cartpods/${id}`, cartPodData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error updating cart pod:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
      } else {
        console.error('Error updating cart pod:', error);
      }
      throw error;
    }
  },

  deleteCartPod: async (id: string): Promise<void> => {
    try {
      if (!API_URL) {
        throw new Error('API URL is not configured');
      }
      await api.delete(`/cartpods/${id}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error deleting cart pod:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
      } else {
        console.error('Error deleting cart pod:', error);
      }
      throw error;
    }
  },

  async getCartPodById(id: string): Promise<CartPod> {
    try {
      if (!API_URL) {
        throw new Error('API URL is not configured');
      }
      const response = await api.get<CartPod>(`/cartpods/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error fetching cart pod by ID:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
      } else {
        console.error('Error fetching cart pod by ID:', error);
      }
      throw error;
    }
  },

  async findNearbyCartPods(longitude: number, latitude: number, maxDistance: number): Promise<CartPod[]> {
    try {
      if (!API_URL) {
        throw new Error('API URL is not configured');
      }
      const response = await api.get<CartPod[]>(`/cartpods/near/${longitude}/${latitude}/${maxDistance}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error finding nearby cart pods:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
      } else {
        console.error('Error finding nearby cart pods:', error);
      }
      throw error;
    }
  },

  async addFoodCartToPod(cartPodId: string, foodCartData: any): Promise<CartPod> {
    try {
      if (!API_URL) {
        throw new Error('API URL is not configured');
      }
      const response = await api.post<CartPod>(`/cartpods/${cartPodId}/foodcarts`, foodCartData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error adding food cart:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
      } else {
        console.error('Error adding food cart:', error);
      }
      throw error;
    }
  },

  async uploadImage(formData: FormData): Promise<{ imageUrl: string }> {
    try {
      if (!API_URL) {
        throw new Error('API URL is not configured');
      }
      const response = await api.post<{ imageUrl: string }>('/foodcarts/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error uploading image:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
      } else {
        console.error('Error uploading image:', error);
      }
      throw error;
    }
  },

  async getFoodCartById(id: string): Promise<FoodCart> {
    try {
      if (!API_URL) {
        throw new Error('API URL is not configured');
      }
      const response = await api.get<FoodCart>(`/foodcarts/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error fetching food cart by ID:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
      } else {
        console.error('Error fetching food cart by ID:', error);
      }
      throw error;
    }
  },

  async updateFoodCart(id: string, foodCartData: Partial<FoodCart>): Promise<FoodCart> {
    try {
      if (!API_URL) {
        throw new Error('API URL is not configured');
      }
      const response = await api.put<FoodCart>(`/foodcarts/${id}`, foodCartData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error updating food cart:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
      } else {
        console.error('Error updating food cart:', error);
      }
      throw error;
    }
  }
};

export default cartPodService; 