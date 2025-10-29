// Modelos de Reservaciones

export interface GuestData {
  documentType: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  nationality: string;
  phoneNumber: string;
  email: string;
  isCompleted: boolean;
}

export interface ReservationDraft {
  _id: string;
  userId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  maxCapacity: number;
  guests: GuestData[];
  totalPrice: number;
  specialRequests?: string;
  expiresAt: string;
}

export interface CreateDraftData {
  userId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  maxCapacity: number;
  guests: GuestData[];
  totalPrice: number;
  specialRequests?: string;
}

