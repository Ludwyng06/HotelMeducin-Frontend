'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@context/AuthContext';
import API from '@services/api';
import GuestForm from '@views/components/GuestForm';
import AvailabilityCalendar from '@views/components/AvailabilityCalendar';
import { useToast } from '../../../../hooks/useToast';
import ToastContainer from '../../../../components/Toast/ToastContainer';
import '@styles/RecepcionistaHabitacionDetalle.css';
import type { DocumentType } from '@models/Document';
import type { GuestData } from '@models/Reservation';
import { reservationService } from '@services/reservationService';

// Función para parsear string YYYY-MM-DD a Date local (sin problemas de zona horaria)
const parseLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// Función para formatear Date a string YYYY-MM-DD (sin problemas de zona horaria)
const formatDateToString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Función para formatear string YYYY-MM-DD a formato local para mostrar
const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return 'Seleccionar fecha';
  const date = parseLocalDate(dateString);
  return date.toLocaleDateString('es-CO');
};

// Función para encontrar la primera fecha disponible después de hoy
const findFirstAvailableDate = (occupiedDates: string[], startFrom?: Date): Date => {
  const today = startFrom || new Date();
  today.setHours(0, 0, 0, 0);
  
  // Buscar la primera fecha disponible (no ocupada y no pasada)
  let checkDate = new Date(today);
  const maxDaysToCheck = 365; // Buscar hasta 1 año adelante
  
  for (let i = 0; i < maxDaysToCheck; i++) {
    const dateString = formatDateToString(checkDate);
    if (!occupiedDates.includes(dateString)) {
      return checkDate;
    }
    checkDate.setDate(checkDate.getDate() + 1);
  }
  
  // Si no se encuentra ninguna fecha disponible, retornar mañana
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
};

export default function RecepcionistaHabitacionDetalle() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const roomId = params?.id as string;

  const [room, setRoom] = useState<any>(null);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [guestCount, setGuestCount] = useState<number>(1);
  const [guests, setGuests] = useState<GuestData[]>([]);
  const [checkInDate, setCheckInDate] = useState<string>('');
  const [checkOutDate, setCheckOutDate] = useState<string>('');
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [specialRequests, setSpecialRequests] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [paymentNotes, setPaymentNotes] = useState<string>('');
  const [showCheckInCalendar, setShowCheckInCalendar] = useState<boolean>(false);
  const [showCheckOutCalendar, setShowCheckOutCalendar] = useState<boolean>(false);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [showReservationForm, setShowReservationForm] = useState<boolean>(false);
  const [realTimeCounter, setRealTimeCounter] = useState<{ minutes: number; seconds: number } | null>(null);
  const { toasts, success: showSuccessToast, removeToast } = useToast();

  // Función helper para obtener imagen correcta según categoría
  const getRoomImage = (roomData: any) => {
    // Siempre usar la imagen de la categoría, no las imageUrls de la habitación
    const categoryName = roomData?.categoryId?.name || '';
    const imageMap: { [key: string]: string } = {
      'Individual': '/images/habitacion-individual.jpg',
      'Doble': '/images/habitacion-doble.jpg',
      'Twin': '/images/habitacion-twin.jpg',
      'Triple': '/images/habitacion-triple.jpg',
      'Suite': '/images/suite-ejecutiva.jpg',
      'Presidencial': '/images/suite-presidencial.jpg'
    };
    return imageMap[categoryName] || '/images/habitacion-estandar.jpg';
  };

  useEffect(() => {
    if (user?.role !== 'recepcionista') {
      router.push('/login');
      return;
    }

    if (roomId) {
      loadRoomData();
    }
  }, [roomId, user]);

  // Cerrar calendarios al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.calendar-group')) {
        setShowCheckInCalendar(false);
        setShowCheckOutCalendar(false);
      }
    };

    if (showCheckInCalendar || showCheckOutCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showCheckInCalendar, showCheckOutCalendar]);

  // Actualizar contador en tiempo real
  useEffect(() => {
    if (!room?.pendingReservation || !room.pendingReservation.createdAt) {
      setRealTimeCounter(null);
      return;
    }

    const updateCounter = () => {
      // Calcular tiempo de expiración: 1 hora después de la creación (igual que el backend)
      const createdAt = new Date(room.pendingReservation.createdAt);
      const expirationTime = new Date(createdAt.getTime() + 60 * 60 * 1000); // 1 hora
      
      const now = new Date();
      const diff = expirationTime.getTime() - now.getTime();
      
      if (diff > 0) {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setRealTimeCounter({ minutes, seconds });
      } else {
        setRealTimeCounter({ minutes: 0, seconds: 0 });
      }
    };

    updateCounter();
    const interval = setInterval(updateCounter, 1000);
    return () => clearInterval(interval);
  }, [room?.pendingReservation]);

  const loadRoomData = async () => {
    try {
      setLoading(true);
      setError('');

      // Cargar habitación con reservas
      const response = await API.get('/recepcionista/rooms/with-reservations');
      const data = response.data?.data || [];
      
      // Buscar la habitación específica
      let foundRoom = null;
      for (const categoryGroup of data) {
        foundRoom = categoryGroup.rooms.find((r: any) => r._id === roomId);
        if (foundRoom) break;
      }

      if (!foundRoom) {
        // Si no se encuentra en la lista con reservas, buscar directamente
        const roomResponse = await API.get(`/rooms/${roomId}`);
        foundRoom = roomResponse.data?.data || roomResponse.data;
      }

      if (!foundRoom) {
        setError('Habitación no encontrada');
        return;
      }

      setRoom(foundRoom);

      // Cargar tipos de documento
      const docTypesResponse = await API.get('/document-types');
      setDocumentTypes(docTypesResponse.data?.data || docTypesResponse.data || []);

      // Obtener fechas ocupadas para encontrar la primera fecha disponible
      let occupiedDates: string[] = [];
      try {
        occupiedDates = await reservationService.getOccupiedDates(roomId);
        console.log('📅 Fechas ocupadas obtenidas:', occupiedDates);
      } catch (error) {
        console.warn('⚠️ No se pudieron obtener fechas ocupadas:', error);
      }

      // Inicializar fechas con la primera fecha disponible
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Encontrar la primera fecha disponible
      const firstAvailableDate = findFirstAvailableDate(occupiedDates, today);
      const firstAvailableCheckOut = new Date(firstAvailableDate);
      firstAvailableCheckOut.setDate(firstAvailableCheckOut.getDate() + 1);
      
      setCheckInDate(formatDateToString(firstAvailableDate));
      setCheckOutDate(formatDateToString(firstAvailableCheckOut));
      calculatePrice(formatDateToString(firstAvailableDate), formatDateToString(firstAvailableCheckOut), foundRoom.price);
      
      console.log('📅 Primera fecha disponible seleccionada:', formatDateToString(firstAvailableDate));

      // Inicializar huéspedes
      if (foundRoom.capacity) {
        setGuestCount(1);
        initializeGuests(1, foundRoom.capacity);
      }


    } catch (error: any) {
      console.error('Error cargando habitación:', error);
      setError(error.response?.data?.message || 'Error al cargar la habitación');
    } finally {
      setLoading(false);
    }
  };

  const initializeGuests = (count: number, maxCapacity: number) => {
    const initialGuests: GuestData[] = Array.from({ length: Math.min(count, maxCapacity) }, () => ({
      documentType: '',
      documentNumber: '',
      firstName: '',
      lastName: '',
      birthDate: '',
      nationality: '',
      phoneNumber: '',
      email: '',
      isCompleted: false
    }));
    setGuests(initialGuests);
  };

  const calculatePrice = (checkIn: string, checkOut: string, pricePerNight: number) => {
    if (!checkIn || !checkOut || !pricePerNight) return;
    
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (nights > 0) {
      setTotalPrice(nights * pricePerNight);
    } else {
      setTotalPrice(0);
    }
  };

  const handleCheckInChange = (date: string) => {
    console.log('📅 handleCheckInChange llamado con fecha:', date);
    console.log('📅 Fecha actual checkInDate:', checkInDate);
    setCheckInDate(date);
    setShowCheckInCalendar(false);
    if (checkOutDate && room?.price) {
      calculatePrice(date, checkOutDate, room.price);
    }
    // Si check-out es anterior o igual a check-in, actualizar check-out
    if (checkOutDate && parseLocalDate(date) >= parseLocalDate(checkOutDate)) {
      const nextDay = parseLocalDate(date);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayString = formatDateToString(nextDay);
      setCheckOutDate(nextDayString);
      calculatePrice(date, nextDayString, room.price);
    }
    console.log('📅 Nueva checkInDate establecida:', date);
  };

  const handleCheckOutChange = (date: string) => {
    setCheckOutDate(date);
    setShowCheckOutCalendar(false);
    if (checkInDate && room?.price) {
      calculatePrice(checkInDate, date, room.price);
    }
  };

  const handleGuestCountChange = (newCount: number) => {
    if (!room) return;
    
    const maxCapacity = room.capacity;
    const validCount = Math.min(Math.max(1, newCount), maxCapacity);
    
    setGuestCount(validCount);
    
    const newGuests = [...guests];
    if (validCount > guests.length) {
      for (let i = guests.length; i < validCount; i++) {
        newGuests.push({
          documentType: '',
          documentNumber: '',
          firstName: '',
          lastName: '',
          birthDate: '',
          nationality: '',
          phoneNumber: '',
          email: '',
          isCompleted: false
        });
      }
    } else if (validCount < guests.length) {
      newGuests.splice(validCount);
    }
    
    setGuests(newGuests);
  };

  const updateGuest = (index: number, updatedGuest: Partial<GuestData>) => {
    const newGuests = [...guests];
    newGuests[index] = { ...newGuests[index], ...updatedGuest };
    setGuests(newGuests);
  };

  const validateGuests = (): boolean => {
    for (let i = 0; i < guestCount; i++) {
      const guest = guests[i];
      // Si el formulario de huésped no está marcado como completo,
      // significa que hay errores de validación (documento, email, teléfono, etc.)
      if (!guest.isCompleted ||
          !guest.documentType || !guest.documentNumber || !guest.firstName || 
          !guest.lastName || !guest.birthDate || !guest.nationality || 
          !guest.phoneNumber || !guest.email) {
        setError(`Por favor completa y corrige todos los campos del huésped ${i + 1}`);
        return false;
      }
    }
    return true;
  };

  const handleCreateReservation = async () => {
    if (!validateGuests()) return;
    if (!checkInDate || !checkOutDate) {
      setError('Por favor selecciona fechas de check-in y check-out');
      return;
    }

    try {
      setSaving(true);
      setError('');

      // Obtener datos del huésped principal (primer huésped)
      const mainGuest = guests[0];
      
      if (!mainGuest.email || !mainGuest.firstName || !mainGuest.lastName) {
        setError('El huésped principal debe tener email, nombre y apellido');
        return;
      }

      // Buscar o crear el usuario cliente
      let clientUser;
      try {
        const clientResponse = await API.post('/recepcionista/clients/find-or-create', {
          email: mainGuest.email,
          firstName: mainGuest.firstName,
          lastName: mainGuest.lastName,
          phoneNumber: mainGuest.phoneNumber,
          documentType: mainGuest.documentType,
          documentNumber: mainGuest.documentNumber,
          nationality: mainGuest.nationality,
          birthDate: mainGuest.birthDate
        });
        clientUser = clientResponse.data?.data;
      } catch (error: any) {
        console.error('Error al buscar/crear cliente:', error);
        setError('Error al buscar/crear el cliente: ' + (error.response?.data?.message || error.message));
        return;
      }

      if (!clientUser || !clientUser._id) {
        setError('No se pudo obtener el ID del cliente');
        return;
      }

      // Crear reserva con el userId del cliente
      const reservationData = {
        userId: clientUser._id, // Usar el ID del cliente, no del recepcionista
        roomId: room._id,
        checkInDate,
        checkOutDate,
        guestCount,
        maxCapacity: room.capacity,
        totalPrice,
        specialRequests,
        guests: guests.slice(0, guestCount).map(g => ({
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

      const response = await API.post('/reservations', reservationData);
      
      if (response.data.success || response.data._id) {
        setSuccess('¡Reserva creada exitosamente! El cliente recibirá un correo de confirmación.');
        setTimeout(() => {
          router.push('/recepcionista/habitaciones');
        }, 2000);
      }
      
    } catch (error: any) {
      console.error('Error creando reserva:', error);
      setError(error.response?.data?.message || 'Error al crear la reserva');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmPendingReservation = async () => {
    if (!room?.pendingReservation || !paymentMethod) {
      setError('Por favor selecciona un método de pago');
      return;
    }

    try {
      setSaving(true);
      setError('');

      await API.patch(`/recepcionista/reservations/${room.pendingReservation._id}/confirm`, {
        paymentMethod,
        notes: paymentNotes
      });

      setSuccess('Reserva confirmada exitosamente');
      setTimeout(() => {
        loadRoomData(); // Recargar datos
      }, 1500);
      
    } catch (error: any) {
      console.error('Error confirmando reserva:', error);
      setError(error.response?.data?.message || 'Error al confirmar la reserva');
    } finally {
      setSaving(false);
    }
  };

  const formatTimeRemaining = (timeUntilExpiration: any) => {
    // Usar contador en tiempo real si está disponible
    if (realTimeCounter) {
      if (realTimeCounter.minutes <= 0 && realTimeCounter.seconds <= 0) {
        return 'Expirada';
      }
      return `${realTimeCounter.minutes}m ${realTimeCounter.seconds}s`;
    }
    
    // Fallback al tiempo del servidor
    if (!timeUntilExpiration || timeUntilExpiration.total <= 0) {
      return 'Expirada';
    }
    return `${timeUntilExpiration.minutes}m ${timeUntilExpiration.seconds}s`;
  };

  const handleCancelReservation = async () => {
    if (!room?.pendingReservation) return;

    try {
      setSaving(true);
      setError('');

      await API.patch(`/recepcionista/reservations/${room.pendingReservation._id}/cancel`, {
        reason: 'Cancelada por recepcionista'
      });

      setShowCancelModal(false);
      showSuccessToast('Reservación cancelada correctamente');
      setTimeout(() => {
        loadRoomData(); // Recargar datos
      }, 1500);
      
    } catch (error: any) {
      console.error('Error cancelando reserva:', error);
      setError(error.response?.data?.message || 'Error al cancelar la reserva');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="recepcionista-loading">
        <div className="loading-spinner"></div>
        <p>Cargando información de la habitación...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error || 'Habitación no encontrada'}</p>
        <button onClick={() => router.push('/recepcionista/habitaciones')} className="btn-primary">
          Volver a Habitaciones
        </button>
      </div>
    );
  }

  return (
    <div className="recepcionista-habitacion-detalle">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      
      {/* Modal de Confirmación de Cancelación */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>¿Estás seguro de cancelar la reserva?</h2>
            <p>Esta acción no se puede deshacer.</p>
            <div className="modal-buttons">
              <button
                onClick={() => setShowCancelModal(false)}
                className="btn-cancel-modal"
                disabled={saving}
              >
                No, mantener
              </button>
              <button
                onClick={handleCancelReservation}
                className="btn-confirm-cancel"
                disabled={saving}
              >
                {saving ? 'Cancelando...' : 'Sí, cancelar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="page-header">
        <h1>{room.name}</h1>
        <button onClick={() => router.push('/recepcionista/habitaciones')} className="btn-back-professional">
          <span className="btn-icon">←</span>
          <span className="btn-text">Volver a Habitaciones</span>
        </button>
      </div>

      {error && (
        <div className="error-alert">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="success-alert">
          <p>{success}</p>
        </div>
      )}

      <div className="room-detail-container">
        {/* Información de la Habitación */}
        <div className="room-info-section">
          <div className="room-details">
            <div className="room-header-info">
              <h2>{room.name}</h2>
              <span className={`room-status-badge ${room.currentStatus}`}>
                {room.currentStatus === 'occupied' ? 'Ocupada' : 
                 room.currentStatus === 'maintenance' ? 'Mantenimiento' : 
                 room.currentStatus === 'pending' ? 'Pendiente' :
                 room.currentStatus === 'expired' ? 'Expirada' :
                 'Disponible'}
              </span>
            </div>

            <div className="room-specs">
              <p><strong>Categoría:</strong> {room.categoryId?.name || 'N/A'}</p>
              <p><strong>Precio por noche:</strong> ${room.price}</p>
              <p><strong>Capacidad:</strong> {room.capacity} personas</p>
              <p><strong>Piso:</strong> {room.floor}</p>
              <p><strong>Tipo de cama:</strong> {room.bedType}</p>
              {room.view && <p><strong>Vista:</strong> {room.view}</p>}
            </div>

            {room.description && (
              <div className="room-description">
                <h3>Descripción</h3>
                <p>{room.description}</p>
              </div>
            )}

            {room.amenities && room.amenities.length > 0 && (
              <div className="room-amenities">
                <h3>Amenidades</h3>
                <ul>
                  {room.amenities.map((amenity: string, index: number) => (
                    <li key={index}>{amenity}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Sección de Reserva Pendiente */}
        {room.currentStatus === 'pending' && room.pendingReservation && (
          <div className="reservation-pending-section">
            <h2>Reserva Pendiente</h2>
            
            <div className="reservation-info-card">
              <h3>Información del Cliente</h3>
              <p><strong>Nombre:</strong> {room.pendingReservation.userId?.firstName} {room.pendingReservation.userId?.lastName}</p>
              <p><strong>Email:</strong> {room.pendingReservation.userId?.email || 'N/A'}</p>
              <p><strong>Teléfono:</strong> {room.pendingReservation.userId?.phoneNumber || 'N/A'}</p>

              <h3 style={{ marginTop: '1.5rem' }}>Detalles de la Reserva</h3>
              <p><strong>Check-in:</strong> {new Date(room.pendingReservation.checkInDate).toLocaleDateString('es-CO')}</p>
              <p><strong>Check-out:</strong> {new Date(room.pendingReservation.checkOutDate).toLocaleDateString('es-CO')}</p>
              <p><strong>Total:</strong> ${room.pendingReservation.totalPrice}</p>
              {(realTimeCounter && (realTimeCounter.minutes > 0 || realTimeCounter.seconds > 0)) || (room.timeUntilExpiration && room.timeUntilExpiration.total > 0) ? (
                <p><strong>⏱️ Tiempo restante:</strong> {formatTimeRemaining(room.timeUntilExpiration)}</p>
              ) : (
                <p className="expired-warning">⚠️ Esta reserva ha expirado</p>
              )}
            </div>

            <div className="confirm-reservation-form">
              <h3>Confirmar Reserva</h3>
              
              <div className="form-group">
                <label>Método de Pago *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  required
                >
                  <option value="">Seleccione método de pago *</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                </select>
              </div>

              <div className="form-group">
                <label>Notas de Pago (opcional)</label>
                <textarea
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  rows={3}
                  placeholder="Notas adicionales sobre el pago..."
                />
              </div>

              <div className="reservation-actions">
                <button
                  onClick={handleConfirmPendingReservation}
                  className="btn-primary"
                  disabled={saving || !paymentMethod}
                >
                  {saving ? 'Confirmando...' : 'Confirmar Reserva'}
                </button>
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="btn-cancel"
                  disabled={saving}
                >
                  Cancelar Reserva
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sección de Reserva Ocupada */}
        {room.currentStatus === 'occupied' && !showReservationForm && (
          <div className="reservation-occupied-section">
            <h2>Habitación Ocupada</h2>
            <p>Esta habitación tiene una reserva confirmada y está ocupada.</p>
            {room.pendingReservation && room.pendingReservation.status === 'confirmed' && (
              <div className="check-in-out-info-small" style={{ marginTop: '1rem', padding: '1rem', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                <p style={{ margin: '0.5rem 0', color: '#1e40af' }}>
                  <strong>Check-in:</strong> {new Date(room.pendingReservation.checkInDate).toLocaleDateString('es-CO')}
                </p>
                <p style={{ margin: '0.5rem 0', color: '#1e40af' }}>
                  <strong>Check-out:</strong> {new Date(room.pendingReservation.checkOutDate).toLocaleDateString('es-CO')}
                </p>
              </div>
            )}
            <button
              onClick={async () => {
                // Obtener fechas ocupadas para encontrar la primera fecha disponible
                let occupiedDates: string[] = [];
                try {
                  occupiedDates = await reservationService.getOccupiedDates(roomId);
                  console.log('📅 Fechas ocupadas obtenidas para nueva reserva:', occupiedDates);
                } catch (error) {
                  console.warn('⚠️ No se pudieron obtener fechas ocupadas:', error);
                }

                // Encontrar la primera fecha disponible después de hoy
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const firstAvailableDate = findFirstAvailableDate(occupiedDates, today);
                const firstAvailableCheckOut = new Date(firstAvailableDate);
                firstAvailableCheckOut.setDate(firstAvailableCheckOut.getDate() + 1);
                
                const checkInString = formatDateToString(firstAvailableDate);
                const checkOutString = formatDateToString(firstAvailableCheckOut);
                
                console.log('📅 Primera fecha disponible encontrada:', checkInString);
                console.log('📅 Check-out inicial:', checkOutString);
                
                setCheckInDate(checkInString);
                setCheckOutDate(checkOutString);
                if (room.price) {
                  calculatePrice(checkInString, checkOutString, room.price);
                }
                
                setShowReservationForm(true);
              }}
              className="btn-primary"
              style={{ marginTop: '1.5rem' }}
            >
              📅 Reservar para otra fecha
            </button>
          </div>
        )}

        {/* Sección de Mantenimiento */}
        {room.currentStatus === 'maintenance' && (
          <div className="reservation-maintenance-section">
            <h2>Habitación en Mantenimiento</h2>
            <p>Esta habitación está actualmente en mantenimiento y no está disponible para reservas.</p>
          </div>
        )}

        {/* Formulario de Nueva Reserva (disponible o cuando se solicita para otra fecha) */}
        {(room.currentStatus === 'available' || showReservationForm) && (
          <div className="new-reservation-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>Crear Nueva Reserva</h2>
              {showReservationForm && room.currentStatus === 'occupied' && (
                <button
                  onClick={() => setShowReservationForm(false)}
                  className="btn-secondary"
                  style={{ background: '#6b7280', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
              )}
            </div>
            {showReservationForm && room.currentStatus === 'occupied' && (
              <div className="info-alert" style={{ marginBottom: '1.5rem', padding: '1rem', background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px' }}>
                <p style={{ margin: 0, color: '#92400e' }}>
                  ⚠️ <strong>Nota:</strong> Esta habitación tiene una reserva confirmada. Puedes crear una nueva reserva para otras fechas disponibles.
                </p>
              </div>
            )}
            
            <div className="reservation-form">
              <div className="form-row">
                <div className="form-group calendar-group">
                  <label>Check-in *</label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCheckInCalendar(!showCheckInCalendar);
                      setShowCheckOutCalendar(false);
                    }}
                    className="calendar-button"
                  >
                    {formatDateForDisplay(checkInDate)}
                    <span className="calendar-icon">📅</span>
                  </button>
                  {showCheckInCalendar && room?._id && (
                    <div className="calendar-popup">
                      <AvailabilityCalendar
                        key={`checkin-${showReservationForm ? 'new' : 'default'}-${room._id}`}
                        roomId={room._id}
                        onDateSelect={handleCheckInChange}
                        selectedDate={checkInDate}
                      />
                    </div>
                  )}
                </div>

                <div className="form-group calendar-group">
                  <label>Check-out *</label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCheckOutCalendar(!showCheckOutCalendar);
                      setShowCheckInCalendar(false);
                    }}
                    className="calendar-button"
                    disabled={!checkInDate}
                  >
                    {formatDateForDisplay(checkOutDate)}
                    <span className="calendar-icon">📅</span>
                  </button>
                  {showCheckOutCalendar && room?._id && (
                    <div className="calendar-popup">
                      <AvailabilityCalendar
                        key={`checkout-${showReservationForm ? 'new' : 'default'}-${room._id}`}
                        roomId={room._id}
                        onDateSelect={handleCheckOutChange}
                        selectedDate={checkOutDate}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Número de Huéspedes *</label>
                <input
                  type="number"
                  min="1"
                  max={room.capacity}
                  value={guestCount}
                  onChange={(e) => handleGuestCountChange(parseInt(e.target.value) || 1)}
                  required
                />
                <span className="form-hint">Máximo: {room.capacity} personas</span>
              </div>

              <div className="form-group">
                <label>Precio Total</label>
                <input
                  type="text"
                  value={`$${totalPrice.toFixed(2)}`}
                  readOnly
                  className="readonly-input"
                />
              </div>

              <div className="form-group">
                <label>Solicitudes Especiales (opcional)</label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  rows={3}
                  placeholder="Camas adicionales, cuna, etc."
                />
              </div>

              <div className="guests-section">
                <h3>Información de los Huéspedes</h3>
                {guests.slice(0, guestCount).map((guest, index) => (
                  <div key={index} className="guest-form-card">
                    <div className="guest-form-header">
                      <h4>Huésped {index + 1}</h4>
                    </div>
                    <GuestForm
                      guest={guest}
                      documentTypes={documentTypes}
                      onUpdate={(updatedGuest) => updateGuest(index, updatedGuest)}
                      index={index}
                    />
                  </div>
                ))}
              </div>

              <div className="reservation-form-actions">
                <button
                  onClick={handleCreateReservation}
                  className="btn-primary btn-large"
                  disabled={saving}
                >
                  {saving ? '⏳ Creando Reserva...' : '✅ Crear Reserva'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

