export type Room = {
  id: number;
  name: string;
  description: string;
  price: number;
  capacity: number;
  bedType: string;
  imageUrls: string[];
  amenities: string[];
};

export interface RoomWithCategory extends Room {
  categoryId: {
    _id: string;
    name: string;
    code: string;
    icon: string;
    basePrice: number;
    maxCapacity: number;
  };
  roomNumber: string;
  floor: number;
  view: string;
  isMaintenance: boolean;
}

export interface RoomFilters {
  checkIn?: string;
  checkOut?: string;
  capacity?: number;
  minPrice?: number;
  maxPrice?: number;
  bedType?: string;
  floor?: number;
  view?: string;
  categoryId?: string;
  amenities?: string[];
}


