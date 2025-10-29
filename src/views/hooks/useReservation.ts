'use client';

import { useState } from 'react';
import { reservationService } from '@services/reservationService';
import { roomService } from '@services/roomService';

// Hook personalizado para gestionar reservas
export const useReservation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reservationData, setReservationData] = useState<any | null>(null);
  const [availability, setAvailability] = useState<{available: boolean, message?: string} | null>(null);

  // Verificar disponibilidad de habitación
  const checkAvailability = async (roomId: number, checkIn: string, checkOut: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await roomService.checkAvailability(roomId, checkIn, checkOut);
      setAvailability(result);
      return result;
    } catch (err: any) {
      setError(err.message || 'Error al verificar disponibilidad');
      setAvailability({ available: false, message: 'No se pudo verificar la disponibilidad' });
      return { available: false };
    } finally {
      setIsLoading(false);
    }
  };

  // Crear una nueva reserva
  const createReservation = async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await reservationService.createReservation(data);
      setReservationData(result);
      return result;
    } catch (err: any) {
      setError(err.message || 'Error al crear la reserva');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener una reserva por ID
  const getReservation = async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await reservationService.getReservationById(id);
      setReservationData(result);
      return result;
    } catch (err: any) {
      setError(err.message || 'Error al obtener la reserva');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener todas las reservas del usuario
  const getUserReservations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await reservationService.getUserReservations();
      return result;
    } catch (err: any) {
      setError(err.message || 'Error al obtener las reservas');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Cancelar una reserva
  const cancelReservation = async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await reservationService.cancelReservation(id);
      return result;
    } catch (err: any) {
      setError(err.message || 'Error al cancelar la reserva');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    reservationData,
    availability,
    checkAvailability,
    createReservation,
    getReservation,
    getUserReservations,
    cancelReservation,
  };
}; 