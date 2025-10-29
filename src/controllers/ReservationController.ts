// Controlador de Reservaciones - Orquesta servicios y prepara datos para vistas
import { draftService } from '@services/draftService';
import { reservationService } from '@services/reservationService';
import type { GuestData, CreateDraftData, ReservationDraft } from '@models/Reservation';

export class ReservationController {
  /**
   * Inicializa el proceso de reserva cargando datos necesarios
   */
  static async initializeReservation(params: {
    roomId: string;
    checkIn: string;
    checkOut: string;
    userId?: string;
  }) {
    try {
      // En un controlador real, aquí orquestarías múltiples servicios
      // Por ahora delegamos al servicio pero preparando para expansión
      const roomData = await reservationService.getRoomById(params.roomId);
      const draft = params.userId 
        ? await draftService.getDraftByUser(params.userId)
        : null;
      
      return {
        room: roomData,
        draft,
        isValid: !!roomData && !!params.checkIn && !!params.checkOut
      };
    } catch (error: any) {
      throw new Error(`Error inicializando reserva: ${error.message}`);
    }
  }

  /**
   * Crea una reserva final y elimina el borrador
   * Esta es la orquestación que antes estaba en la página
   */
  static async createReservationAndCleanup(params: {
    userId: string;
    roomId: string;
    checkInDate: string;
    checkOutDate: string;
    guestCount: number;
    maxCapacity: number;
    totalPrice: number;
    specialRequests?: string;
    guests: GuestData[];
  }) {
    try {
      // Preparar datos de reserva (sin campos internos como isCompleted)
      const reservationData = {
        userId: params.userId,
        roomId: params.roomId,
        checkInDate: params.checkInDate,
        checkOutDate: params.checkOutDate,
        guestCount: params.guestCount,
        maxCapacity: params.maxCapacity,
        totalPrice: params.totalPrice,
        specialRequests: params.specialRequests,
        guests: params.guests.slice(0, params.guestCount).map(g => ({
          documentType: g.documentType,
          documentNumber: g.documentNumber,
          firstName: g.firstName,
          lastName: g.lastName,
          birthDate: new Date(g.birthDate),
          nationality: g.nationality,
          phoneNumber: g.phoneNumber,
          email: g.email,
        })),
      };

      // Crear reserva
      const reservation = await reservationService.create(reservationData);
      
      // Eliminar borrador después de crear reserva exitosamente
      if (reservation.success) {
        try {
          await draftService.deleteDraftByUser(params.userId);
        } catch (error) {
          console.warn('No se pudo eliminar borrador:', error);
          // No fallar la operación si falla la eliminación del borrador
        }
      }

      return reservation;
    } catch (error: any) {
      throw new Error(`Error creando reserva: ${error.message}`);
    }
  }

  /**
   * Guarda un borrador de reserva
   */
  static async saveDraft(draftData: CreateDraftData): Promise<ReservationDraft> {
    try {
      // Validaciones básicas antes de guardar
      if (!draftData.userId || !draftData.roomId) {
        throw new Error('Faltan datos requeridos para el borrador');
      }

      return await draftService.createDraft(draftData);
    } catch (error: any) {
      throw new Error(`Error guardando borrador: ${error.message}`);
    }
  }

  /**
   * Actualiza un borrador existente
   */
  static async updateDraft(
    draftId: string,
    updateData: Partial<CreateDraftData>
  ): Promise<ReservationDraft> {
    try {
      return await draftService.updateDraft(draftId, updateData);
    } catch (error: any) {
      throw new Error(`Error actualizando borrador: ${error.message}`);
    }
  }
}

