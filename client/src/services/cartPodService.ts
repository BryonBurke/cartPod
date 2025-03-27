import api from './api';

export interface CartPod {
  _id: string;
  name: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  arrangementImage: string;
  foodCarts: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCartPodData {
  name: string;
  location: {
    coordinates: [number, number];
  };
  arrangementImage: File;
}

export interface UpdateCartPodData {
  name?: string;
  location?: {
    coordinates: [number, number];
  };
  arrangementImage?: File;
}

interface CartPodData {
  name: string;
  location: {
    coordinates: [number, number];
  };
  arrangementImage: File | null;
}

const cartPodService = {
  async getAllCartPods(): Promise<CartPod[]> {
    try {
      console.log('Fetching cart pods...');
      const response = await api.get<CartPod[]>('/cartpods');
      console.log('Cart pods response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getAllCartPods:', error);
      throw error;
    }
  },

  async getCartPodById(id: string): Promise<CartPod> {
    const response = await api.get<CartPod>(`/cartpods/${id}`);
    return response.data;
  },

  async createCartPod(data: CartPodData): Promise<CartPod> {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('location[coordinates][0]', data.location.coordinates[0].toString());
    formData.append('location[coordinates][1]', data.location.coordinates[1].toString());
    if (data.arrangementImage) {
      formData.append('arrangementImage', data.arrangementImage);
    }

    const response = await api.post<CartPod>('/cartpods', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async updateCartPod(id: string, data: Partial<CartPodData>): Promise<CartPod> {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.location) formData.append('location', JSON.stringify(data.location));
    if (data.arrangementImage) formData.append('arrangementImage', data.arrangementImage);

    const response = await api.put<CartPod>(`/cartpods/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async deleteCartPod(id: string): Promise<void> {
    await api.delete(`/cartpods/${id}`);
  },

  async findNearbyCartPods(longitude: number, latitude: number, maxDistance: number): Promise<CartPod[]> {
    const response = await api.get<CartPod[]>(`/cartpods/near/${longitude}/${latitude}/${maxDistance}`);
    return response.data;
  }
};

export default cartPodService; 