import API from './api';

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

export const draftService = {
  async createDraft(draftData: CreateDraftData): Promise<ReservationDraft> {
    const response = await API.post('/reservation-drafts', draftData);
    return response.data;
  },

  async getDraftByUser(userId: string): Promise<ReservationDraft | null> {
    try {
      const response = await API.get(`/reservation-drafts/user/${userId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async updateDraft(draftId: string, updateData: Partial<CreateDraftData>): Promise<ReservationDraft> {
    const response = await API.patch(`/reservation-drafts/${draftId}`, updateData);
    return response.data;
  },

  async deleteDraft(draftId: string): Promise<void> {
    await API.delete(`/reservation-drafts/${draftId}`);
  },

  async deleteDraftByUser(userId: string): Promise<void> {
    try {
      await API.delete(`/reservation-drafts/user/${userId}`);
    } catch (error: any) {
      if (error.response?.status !== 404) {
        throw error;
      }
    }
  },

  async confirmReservation(draftId: string): Promise<any> {
    const response = await API.post(`/reservation-drafts/${draftId}/confirm`);
    return response.data;
  }
};
