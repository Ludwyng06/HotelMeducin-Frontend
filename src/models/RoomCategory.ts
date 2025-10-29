// Modelos de Categorías de Habitaciones

export interface RoomCategory {
  _id: string;
  name: string;
  code: string;
  description: string;
  icon: string;
  basePrice: number;
  maxCapacity: number;
  bedTypes: string[];
  standardAmenities: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoomCategoryFilters {
  minPrice?: number;
  maxPrice?: number;
  capacity?: number;
}

