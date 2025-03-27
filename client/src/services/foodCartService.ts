import api from './api';

export interface FoodCart {
  _id: string;
  name: string;
  cartPod: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  podLocationImage: string;
  cartImage: string;
  menuImages: string[];
  owner: string;
  cuisineTypes?: string[];
  description?: string;
  reviews: {
    rating: number;
    comment: string;
    user: string;
    createdAt: string;
  }[];
  averageRating: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFoodCartData {
  name: string;
  cartPod: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  podLocationImage: File | null;
  cartImage: File | null;
  menuImages: File[];
}

export interface UpdateFoodCartData {
  name?: string;
  cartPod?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  podLocationImage?: File;
  cartImage?: File;
  menuImages?: File[];
  owner?: string;
}

interface ReviewData {
  rating: number;
  comment: string;
}

const foodCartService = {
  async getAllFoodCarts(): Promise<FoodCart[]> {
    const response = await api.get<FoodCart[]>('/foodcarts');
    return response.data;
  },

  async getFoodCartById(id: string): Promise<FoodCart> {
    const response = await api.get<FoodCart>(`/foodcarts/${id}`);
    return response.data;
  },

  async createFoodCart(data: CreateFoodCartData): Promise<FoodCart> {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('cartPod', data.cartPod);
      formData.append('location', JSON.stringify(data.location));
      
      if (data.podLocationImage) {
        formData.append('podLocationImage', data.podLocationImage);
      }
      
      if (data.cartImage) {
        formData.append('cartImage', data.cartImage);
      }
      
      data.menuImages.forEach((image) => {
        formData.append('menuImages', image);
      });

      console.log('Sending form data:', {
        name: data.name,
        cartPod: data.cartPod,
        location: data.location,
        hasPodLocationImage: !!data.podLocationImage,
        hasCartImage: !!data.cartImage,
        menuImagesCount: data.menuImages.length
      });

      const response = await api.post<FoodCart>('/foodcarts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error in createFoodCart:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        throw new Error(error.response.data.message || 'Failed to create food cart');
      }
      throw error;
    }
  },

  async updateFoodCart(id: string, data: Partial<UpdateFoodCartData>): Promise<FoodCart> {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.cartPod) formData.append('cartPod', data.cartPod);
    if (data.location) formData.append('location', JSON.stringify(data.location));
    if (data.podLocationImage) formData.append('podLocationImage', data.podLocationImage);
    if (data.cartImage) formData.append('cartImage', data.cartImage);
    if (data.menuImages) data.menuImages.forEach((image, index) => {
      formData.append('menuImages', image);
    });
    if (data.owner) formData.append('owner', data.owner);

    const response = await api.put<FoodCart>(`/foodcarts/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async deleteFoodCart(id: string): Promise<void> {
    await api.delete(`/foodcarts/${id}`);
  },

  async assignToCartPod(foodCartId: string, cartPodId: string): Promise<FoodCart> {
    const response = await api.put<FoodCart>(`/foodcarts/${foodCartId}/assign`, { cartPodId });
    return response.data;
  },

  async removeFromCartPod(foodCartId: string): Promise<FoodCart> {
    const response = await api.put<FoodCart>(`/foodcarts/${foodCartId}/remove`);
    return response.data;
  },

  async findNearbyFoodCarts(longitude: number, latitude: number, maxDistance: number): Promise<FoodCart[]> {
    const response = await api.get<FoodCart[]>(`/foodcarts/near/${longitude}/${latitude}/${maxDistance}`);
    return response.data;
  },

  async getFoodCartsByCartPod(cartPodId: string): Promise<FoodCart[]> {
    const response = await api.get<FoodCart[]>(`/foodcarts/cartpod/${cartPodId}`);
    return response.data;
  },

  async addReview(foodCartId: string, reviewData: ReviewData): Promise<FoodCart> {
    const response = await api.post<FoodCart>(`/foodcarts/${foodCartId}/reviews`, reviewData);
    return response.data;
  }
};

export default foodCartService; 