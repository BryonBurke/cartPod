import axios from 'axios';

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
  createdAt: string;
  updatedAt: string;
}

const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) {
  console.error('VITE_API_URL is not defined in environment variables');
}

const cartPodService = {
  getAllCartPods: async (): Promise<CartPod[]> => {
    try {
      if (!API_URL) {
        throw new Error('API URL is not configured');
      }
      console.log('Fetching cart pods from:', API_URL);
      const response = await axios.get(`${API_URL}/cartpods`);
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
      const response = await axios.post(`${API_URL}/cartpods`, cartPodData);
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
      const response = await axios.put(`${API_URL}/cartpods/${id}`, cartPodData);
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
      await axios.delete(`${API_URL}/cartpods/${id}`);
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
      const response = await axios.get<CartPod>(`${API_URL}/cartpods/${id}`);
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
      const response = await axios.get<CartPod[]>(`${API_URL}/cartpods/near/${longitude}/${latitude}/${maxDistance}`);
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
  }
};

export default cartPodService; 