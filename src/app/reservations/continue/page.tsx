'use client';

import { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import GuestForm from '../../components/GuestForm';
import API from '../../services/api';
import '../../styles/ReservationContinue.css';

interface Room {
  _id: string;
  roomNumber: string;
  name: string;
  price: number;
  capacity: number;
  categoryId: {
    _id: string;
    name: string;
  };
}

interface DocumentType {
  _id: string;
  name: string;
  code: string;
  validationPattern: string;
}

interface GuestData {
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

function ReservationContinueContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const [room, setRoom] = useState<Room | null>(null);
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
  const [showSuccessOptions, setShowSuccessOptions] = useState<boolean>(false);
  const [reservationId, setReservationId] = useState<string>('');
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  
  // Refs para evitar bucles y fugas de timers
  const saveDraftTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const requestAbortControllerRef = useRef<AbortController | null>(null);
  const fetchLockRef = useRef<boolean>(false);

  // Obtener parámetros de la URL
  const roomId = searchParams.get('roomId');
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');

  const initializeGuests = useCallback((maxCapacity: number) => {
    const initialGuests: GuestData[] = Array.from({ length: Math.min(guestCount, maxCapacity) }, (_, index) => ({
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
  }, [guestCount]);

  // Mantener refs de callbacks para evitar que su cambio re-cree loadInitialData
  const initializeGuestsRef = useRef(initializeGuests);
  useEffect(() => { initializeGuestsRef.current = initializeGuests; }, [initializeGuests]);

  const loadExistingDraft = useCallback(async () => {
    try {
      const response = await API.get(`/reservation-drafts/user/${user?._id}`);
      if (response.data) {
        const draft = response.data;
        setGuestCount(draft.guestCount);
        setGuests(draft.guests || []);
        setSpecialRequests(draft.specialRequests || '');
        console.log('✅ Borrador cargado:', draft);
      }
    } catch (error) {
      console.log('ℹ️ No hay borrador existente');
    }
  }, [user?._id]);

  const loadExistingDraftRef = useRef(loadExistingDraft);
  useEffect(() => { loadExistingDraftRef.current = loadExistingDraft; }, [loadExistingDraft]);

  const loadInitialData = useCallback(async () => {
    // Evitar llamadas múltiples simultáneas
    if (isLoadingData) {
      console.log('🔄 Ya se está cargando datos, omitiendo llamada duplicada');
      return;
    }
    
    try {
      // Cancelar request previo si existiera
      if (requestAbortControllerRef.current) {
        requestAbortControllerRef.current.abort();
      }
      requestAbortControllerRef.current = new AbortController();

      setIsLoadingData(true);
      setError('');
      
      // Validar parámetros requeridos ANTES de activar loading
      if (!roomId || !checkIn || !checkOut) {
        setLoading(false);
        setError('Faltan parámetros de reserva. Por favor, regresa y selecciona una habitación y fechas.');
        return;
      }
      
      setLoading(true);
      
      console.log('🔄 Cargando datos iniciales...');
      console.log('🏨 Room ID:', roomId);
      console.log('📅 Check-in:', checkIn);
      console.log('📅 Check-out:', checkOut);
      
      // Cargar datos de la habitación con reintentos
      let roomResponse;
      let currentRetryCount = 0;
      const maxRetries = 3;
      
      while (currentRetryCount < maxRetries) {
        try {
          console.log(`🔄 Intento ${currentRetryCount + 1} de cargar habitación...`);
          setRetryCount(currentRetryCount + 1);
          roomResponse = await API.get(`/rooms/${roomId}`, { signal: requestAbortControllerRef.current.signal as any });
          setRetryCount(0); // Resetear contador en éxito
          break;
        } catch (error: any) {
          currentRetryCount++;
          if (error.code === 'ERR_NETWORK' && currentRetryCount < maxRetries) {
            console.log(`⚠️ Error de red, reintentando en ${currentRetryCount * 1000}ms...`);
            await new Promise(resolve => setTimeout(resolve, currentRetryCount * 1000));
            continue;
          }
          throw error;
        }
      }
      
      console.log('🏨 Respuesta de habitación:', roomResponse?.data);
      const roomData = roomResponse?.data?.data || roomResponse?.data; // Manejar ambas estructuras
      console.log('🏨 Datos de habitación procesados:', roomData);
      setRoom(roomData);
      setGuestCount(1); // Inicializar con 1 huésped
      
      // Cargar tipos de documento con reintentos
      let docTypesResponse;
      currentRetryCount = 0;
      
      while (currentRetryCount < maxRetries) {
        try {
          console.log(`🔄 Intento ${currentRetryCount + 1} de cargar tipos de documento...`);
          setRetryCount(currentRetryCount + 1);
          docTypesResponse = await API.get('/document-types/public', { signal: requestAbortControllerRef.current.signal as any });
          setRetryCount(0); // Resetear contador en éxito
          break;
        } catch (error: any) {
          currentRetryCount++;
          if (error.code === 'ERR_NETWORK' && currentRetryCount < maxRetries) {
            console.log(`⚠️ Error de red, reintentando en ${currentRetryCount * 1000}ms...`);
            await new Promise(resolve => setTimeout(resolve, currentRetryCount * 1000));
            continue;
          }
          throw error;
        }
      }
      
      console.log('📄 Respuesta de tipos de documento:', docTypesResponse?.data);
      const docTypesData = docTypesResponse?.data?.data || docTypesResponse?.data; // Manejar ambas estructuras
      console.log('📄 Tipos de documento procesados:', docTypesData);
      setDocumentTypes(docTypesData);
      
      // Configurar fechas
      setCheckInDate(checkIn!);
      setCheckOutDate(checkOut!);
      
      // Calcular precio total
      const nights = Math.ceil((new Date(checkOut!).getTime() - new Date(checkIn!).getTime()) / (1000 * 60 * 60 * 24));
      console.log('💰 Cálculo de precios:', {
        roomPrice: roomData.price,
        nights: nights,
        checkIn: checkIn,
        checkOut: checkOut
      });
      
      if (roomData.price && !isNaN(roomData.price)) {
        const total = roomData.price * nights;
        console.log('💰 Total calculado:', total);
        setTotalPrice(total);
      } else {
        console.error('❌ Precio de habitación inválido:', roomData.price);
        setError('Error: No se pudo obtener el precio de la habitación');
      }
      
      // Inicializar array de huéspedes
      console.log('👥 Capacidad de habitación:', roomData.capacity);
      if (roomData.capacity && !isNaN(roomData.capacity)) {
        initializeGuestsRef.current(roomData.capacity);
      } else {
        console.error('❌ Capacidad de habitación inválida:', roomData.capacity);
        setError('Error: No se pudo obtener la capacidad de la habitación');
      }
      
      // Intentar cargar borrador existente
      await loadExistingDraftRef.current();
      
    } catch (error: any) {
      console.error('❌ Error cargando datos iniciales:', error);
      
      // Manejo específico de errores
      if (error?.code === 'ERR_CANCELED') {
        // Request cancelado: salir silenciosamente
        return;
      }
      if (error.response?.status === 500) {
        setError('Error interno del servidor. Por favor, verifica que el backend esté ejecutándose.');
      } else if (error.response?.status === 404) {
        setError('Habitación no encontrada. Por favor, regresa y selecciona una habitación válida.');
      } else if (error.code === 'ERR_NETWORK') {
        setError('No se pudo conectar con el servidor. Por favor, verifica que el backend esté ejecutándose.');
      } else {
        setError('Error al cargar los datos. Por favor, inténtalo de nuevo.');
      }
    } finally {
      requestAbortControllerRef.current = null;
      setLoading(false);
      setIsLoadingData(false);
    }
  }, [roomId, checkIn, checkOut]);

  useEffect(() => {
    if (!roomId || !checkIn || !checkOut) {
      router.push('/reservations');
      return;
    }

    // Bloquear ejecuciones paralelas (evita bucles por re-render)
    if (fetchLockRef.current) return;
    fetchLockRef.current = true;
    loadInitialData().finally(() => {
      fetchLockRef.current = false;
    });
  }, [roomId, checkIn, checkOut, router]);

  const handleGuestCountChange = (newCount: number) => {
    if (!room) return;
    
    const maxCapacity = room.capacity;
    const validCount = Math.min(Math.max(1, newCount), maxCapacity);
    
    setGuestCount(validCount);
    
    // Ajustar array de huéspedes
    const newGuests = [...guests];
    if (validCount > guests.length) {
      // Agregar huéspedes vacíos
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
      // Remover huéspedes extra
      newGuests.splice(validCount);
    }
    
    setGuests(newGuests);
  };

  const saveDraft = useCallback(async () => {
    if (!user || !room) return;
    
    try {
      const draftData = {
        userId: user._id,
        roomId: room._id,
        checkInDate,
        checkOutDate,
        guestCount,
        maxCapacity: room.capacity,
        guests: guests.slice(0, guestCount).map(g => ({
          documentType: g.documentType,
          documentNumber: g.documentNumber,
          firstName: g.firstName,
          lastName: g.lastName,
          birthDate: g.birthDate,
          nationality: g.nationality,
          phoneNumber: g.phoneNumber,
          email: g.email,
        })),
        totalPrice,
        specialRequests
      };

      await API.post('/reservation-drafts', draftData);
      console.log('✅ Borrador guardado automáticamente');
    } catch (error) {
      console.error('Error guardando borrador:', error);
    }
  }, [user, room, checkInDate, checkOutDate, guestCount, guests, totalPrice, specialRequests]);

  const scheduleSaveDraft = useCallback(() => {
    if (saveDraftTimeoutRef.current) {
      clearTimeout(saveDraftTimeoutRef.current);
    }
    saveDraftTimeoutRef.current = setTimeout(saveDraft, 30000); // Guardar después de 30 segundos de inactividad
  }, [saveDraft]);

  // Limpiar timeout de auto-guardado al desmontar
  useEffect(() => {
    return () => {
      if (saveDraftTimeoutRef.current) {
        clearTimeout(saveDraftTimeoutRef.current);
      }
    };
  }, []);

  const updateGuest = useCallback((index: number, updatedGuest: Partial<GuestData>) => {
    const newGuests = [...guests];
    newGuests[index] = { ...newGuests[index], ...updatedGuest };
    setGuests(newGuests);
    
    // Auto-guardar borrador cada 30 segundos
    scheduleSaveDraft();
  }, [guests, scheduleSaveDraft]);

  const validateGuests = (): boolean => {
    for (let i = 0; i < guestCount; i++) {
      const guest = guests[i];
      if (!guest.documentType || !guest.documentNumber || !guest.firstName || 
          !guest.lastName || !guest.birthDate || !guest.nationality || 
          !guest.phoneNumber || !guest.email) {
        setError(`Por favor completa todos los campos del huésped ${i + 1}`);
        return false;
      }
    }
    return true;
  };

  const downloadPDF = async () => {
    if (!reservationId) return;
    
    try {
      const response = await API.get(`/reservations/${reservationId}/pdf`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reserva-${reservationId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error descargando PDF:', error);
      setError('Error al descargar el PDF');
    }
  };

  const handleContinueReservation = async () => {
    if (!validateGuests()) return;
    
    try {
      setSaving(true);
      setError('');
      
      // Crear reserva final (sin campos extra como isCompleted)
      const reservationData = {
        userId: user?._id,
        roomId: room?._id,
        checkInDate,
        checkOutDate,
        guestCount,
        maxCapacity: room?.capacity,
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
      
      if (response.data.success) {
        // Eliminar borrador
        try {
          await API.delete(`/reservation-drafts/user/${user?._id}`);
        } catch (error) {
          console.log('Error eliminando borrador:', error);
        }
        
        // Guardar ID de reserva y mostrar opciones
        setReservationId(response.data.data._id);
        setSuccess('¡Reserva creada exitosamente! Se ha enviado un email de confirmación con PDF.');
        setSaving(false);
        
        // Ocultar formulario y mostrar opciones
        setTimeout(() => {
          setShowSuccessOptions(true);
        }, 1000);
      }
      
    } catch (error: any) {
      console.error('Error creando reserva:', error);
      setError(error.response?.data?.message || 'Error al crear la reserva');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando datos de la reserva...</p>
        {retryCount > 0 && (
          <div className="retry-indicator">
            <p>⚠️ Error de conexión, reintentando... (Intento {retryCount}/3)</p>
            <div className="retry-progress">
              <div 
                className="retry-bar" 
                style={{ width: `${(retryCount / 3) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!room) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>No se pudo cargar la información de la habitación</p>
        <button onClick={() => router.push('/reservations')} className="btn-primary">
          Volver a Reservas
        </button>
      </div>
    );
  }

  return (
    <div className="reservation-continue-container">
      <div className="reservation-header">
        <h1>Continuar con la Reserva</h1>
        <button 
          onClick={() => router.push('/reservations')} 
          className="btn-secondary"
        >
          ← Volver a Reservas
        </button>
      </div>

      <div className="reservation-summary">
        <div className="summary-card">
          <h3>Resumen de la Reserva</h3>
          <div className="summary-details">
            <p><strong>Habitación:</strong> {room?.name || 'Cargando...'}</p>
            <p><strong>Número:</strong> {room?.roomNumber || 'Cargando...'}</p>
            <p><strong>Capacidad:</strong> {room?.capacity || 'Cargando...'} personas</p>
            <p><strong>Check-in:</strong> {checkInDate ? new Date(checkInDate).toLocaleDateString() : 'Cargando...'}</p>
            <p><strong>Check-out:</strong> {checkOutDate ? new Date(checkOutDate).toLocaleDateString() : 'Cargando...'}</p>
            <p><strong>Precio por noche:</strong> ${room?.price || 'Cargando...'}</p>
            <p><strong>Total:</strong> ${totalPrice || 'Cargando...'}</p>
          </div>
        </div>
      </div>

      <div className="guest-selection">
        <h2>Información de los Huéspedes</h2>
        <div className="guest-count-selector">
          <label htmlFor="guestCount">Número de huéspedes:</label>
          <select
            id="guestCount"
            value={guestCount}
            onChange={(e) => handleGuestCountChange(parseInt(e.target.value))}
            className="guest-count-select"
            disabled={!room || !room.capacity}
          >
            {room && room.capacity ? (
              Array.from({ length: room.capacity }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} {i === 0 ? 'persona' : 'personas'}
                </option>
              ))
            ) : (
              <option value="1">Cargando...</option>
            )}
          </select>
        </div>
      </div>

      <div className="guests-forms">
        {guests.slice(0, guestCount).map((guest, index) => (
          <div key={index} className="guest-form-container">
            <h3>
              Huésped {index + 1} 
              {index === 0 && <span className="main-guest-badge">(Principal)</span>}
            </h3>
            <GuestForm
              guest={guest}
              documentTypes={documentTypes}
              onUpdate={(updatedGuest) => updateGuest(index, updatedGuest)}
              index={index}
            />
          </div>
        ))}
      </div>

      <div className="special-requests">
        <h3>Solicitudes Especiales</h3>
        <textarea
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
          placeholder="Menciona cualquier solicitud especial para tu estadía..."
          className="special-requests-textarea"
        />
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {!showSuccessOptions ? (
        <div className="reservation-actions">
          <button
            onClick={handleContinueReservation}
            disabled={saving}
            className="btn-primary btn-continue"
          >
            {saving ? 'Procesando...' : 'Finalizar Reserva'}
          </button>
          
          <button
            onClick={saveDraft}
            className="btn-secondary"
          >
            Guardar Borrador
          </button>
        </div>
      ) : (
        <div className="success-options">
          <div className="success-message">
            <h2>🎉 ¡Reserva Confirmada!</h2>
            <p>Tu reserva ha sido creada exitosamente y se ha enviado un email de confirmación con PDF a tu correo.</p>
          </div>
          
          <div className="success-actions">
            <button
              onClick={downloadPDF}
              className="btn-primary"
            >
              📄 Descargar PDF
            </button>
            
            <button
              onClick={() => router.push('/user/profile')}
              className="btn-secondary"
            >
              📋 Ver Mis Reservas
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="btn-secondary"
            >
              🏠 Volver al Inicio
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReservationContinue() {
  return (
    <Suspense fallback={<div className="loading-spinner">Cargando página de reserva...</div>}>
      <ReservationContinueContent />
    </Suspense>
  );
}
