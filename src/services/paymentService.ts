import API from './api';

export const paymentService = {
  makePayment: async (paymentData: any) => {
    const response = await API.post('/payments', paymentData);
    return response.data;
  },

  getPaymentStatus: async (paymentId: number) => {
    const response = await API.get(`/payments/${paymentId}`);
    return response.data;
  },

  refundPayment: async (paymentId: number) => {
    const response = await API.post(`/payments/${paymentId}/refund`);
    return response.data;
  },
}; 