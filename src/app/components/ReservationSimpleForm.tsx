'use client';
import React from 'react';
import { useState, useEffect } from 'react';
import { reservationService } from '../services';
import { useAuth } from '../context/AuthContext';
import AvailabilityCalendar from './AvailabilityCalendar';

interface Props {
  roomId?: string;
  rooms?: any[];
}

export default function ReservationSimpleForm({ roomId, rooms }: Props) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    checkInDate: '',
    checkOutDate: '',
    specialRequests: '',
    guestCount: 1
  });
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [nights, setNights] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarType, setCalendarType] = useState<'checkin' | 'checkout'>('checkin');

  // Encontrar la habitación seleccionada
  useEffect(() => {
    if (roomId && rooms) {
      const room = rooms.find(r => r._id === roomId);
      if (room) {
        setSelectedRoom(room);
      }
    }
  }, [roomId, rooms]);

  // Calcular precio total automáticamente
  useEffect(() => {
    if (selectedRoom && form.checkInDate && form.checkOutDate) {
      const checkIn = new Date(form.checkInDate);
      const checkOut = new Date(form.checkOutDate);
      const nightsCount = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
      const total = nightsCount * Number(selectedRoom.price);
      setNights(nightsCount);
      setTotalPrice(total);
    }
  }, [selectedRoom, form.checkInDate, form.checkOutDate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCalendarDateSelect = (date: string) => {
    if (calendarType === 'checkin') {
      setForm({ ...form, checkInDate: date });
    } else {
      setForm({ ...form, checkOutDate: date });
    }
    setShowCalendar(false);
  };

  const openCalendar = (type: 'checkin' | 'checkout') => {
    setCalendarType(type);
    setShowCalendar(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      if (!user) {
        throw new Error('Debes iniciar sesión para hacer una reserva');
      }

      if (!selectedRoom) {
        throw new Error('Debes seleccionar una habitación');
      }

      if (!form.checkInDate || !form.checkOutDate) {
        throw new Error('Debes seleccionar las fechas de entrada y salida');
      }

      const checkIn = new Date(form.checkInDate);
      const checkOut = new Date(form.checkOutDate);
      
      if (checkOut <= checkIn) {
        throw new Error('La fecha de salida debe ser posterior a la fecha de entrada');
      }

      // Debug del usuario
      console.log('👤 Usuario completo:', user);
      console.log('👤 user._id:', user._id);
          console.log('👤 user.id:', (user as any).id);
      
      // Intentar obtener el ID del usuario de diferentes formas
      let userId = user?._id || (user as any)?.id;
      
      // Si no encontramos el ID, intentar obtenerlo del sessionStorage
      if (!userId) {
        const cachedUser = sessionStorage.getItem('auth_user');
        if (cachedUser) {
          try {
            const parsedUser = JSON.parse(cachedUser);
            userId = parsedUser._id || parsedUser.id;
            console.log('👤 ID desde sessionStorage:', userId);
          } catch (error) {
            console.error('Error al parsear usuario desde sessionStorage:', error);
          }
        }
      }
      
      // Validar que el userId sea válido
      if (!userId || userId === 'undefined' || userId === 'null') {
        console.error('❌ userId inválido:', userId);
        throw new Error('No se pudo obtener el ID del usuario. Por favor, inicia sesión nuevamente.');
      }
      
      // Asegurar que userId sea string
      userId = String(userId);
      console.log('✅ userId final:', userId);

      const data = {
        roomId: String(selectedRoom._id),
        checkInDate: form.checkInDate,
        checkOutDate: form.checkOutDate,
        totalPrice: Number(totalPrice),
        userId: String(userId),
        status: 'pending',
        specialRequests: form.specialRequests || '',
        serviceIds: []
      };

      console.log('📝 Creando reserva:', data);
      const res = await reservationService.createReservation(data);
      setSuccess('¡Reserva creada exitosamente!');
      
      // Limpiar formulario
      setForm({
        checkInDate: '',
        checkOutDate: '',
        specialRequests: '',
        guestCount: 1
      });
    } catch (err: any) {
      console.error('❌ Error al crear reserva:', err);
      setError(err?.response?.data?.message || err.message || 'Error al crear la reserva');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: '2rem',
        textAlign: 'center',
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: '#e53e3e', marginBottom: '1rem' }}>🔒 Acceso Requerido</h2>
        <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '1.5rem' }}>
          Debes iniciar sesión para hacer una reserva
        </p>
        <a 
          href="/login" 
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            background: '#3182ce',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: '600'
          }}
        >
          Iniciar Sesión
        </a>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      background: '#fff',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    }}>
      {/* Información de la habitación seleccionada */}
      {selectedRoom && (
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem' }}>
            🏨 {selectedRoom.name}
          </h2>
          <p style={{ margin: '0', opacity: 0.9 }}>
            Habitación {selectedRoom.roomNumber} • Piso {selectedRoom.floor} • ${selectedRoom.price}/noche
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          marginBottom: '1.5rem',
          color: '#2d3748',
          textAlign: 'center'
        }}>
          📅 Completa tu Reserva
        </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', color: '#4a5568' }}>
                  📅 Fecha de Entrada
                </label>
                <button
                  type="button"
                  onClick={() => openCalendar('checkin')}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    background: 'white',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'border-color 0.2s'
                  }}
                >
                  {form.checkInDate || 'Seleccionar fecha'}
                </button>
              </div>
              
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', color: '#4a5568' }}>
                  📅 Fecha de Salida
                </label>
                <button
                  type="button"
                  onClick={() => openCalendar('checkout')}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    background: 'white',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'border-color 0.2s'
                  }}
                >
                  {form.checkOutDate || 'Seleccionar fecha'}
                </button>
              </div>
            </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', color: '#4a5568' }}>
            💬 Solicitudes Especiales (Opcional)
          </label>
          <textarea
            name="specialRequests"
            value={form.specialRequests}
            onChange={handleChange}
            placeholder="Ej: Cama extra, vista al mar, piso alto..."
            rows={3}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '1rem',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Resumen de precio */}
        {totalPrice > 0 && (
          <div style={{
            background: '#f7fafc',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <h4 style={{ margin: '0 0 1rem 0', color: '#2d3748', fontSize: '1.1rem' }}>
              💰 Resumen de Precio
            </h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Precio por noche:</span>
              <span>${selectedRoom?.price}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Noches:</span>
              <span>{nights} noche{nights > 1 ? 's' : ''}</span>
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '0.5rem 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600', fontSize: '1.1rem', color: '#2d3748' }}>
              <span>Total:</span>
              <span>${totalPrice}</span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !selectedRoom || !form.checkInDate || !form.checkOutDate}
          style={{
            width: '100%',
            padding: '1rem',
            fontSize: '1.1rem',
            fontWeight: '600',
            borderRadius: '12px',
            border: 'none',
            background: loading || !selectedRoom || !form.checkInDate || !form.checkOutDate 
              ? '#a0aec0' 
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            cursor: loading || !selectedRoom || !form.checkInDate || !form.checkOutDate 
              ? 'not-allowed' 
              : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
          }}
        >
          {loading ? '⏳ Procesando...' : '✅ Confirmar Reserva'}
        </button>

        {error && (
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            background: '#fed7d7',
            color: '#c53030',
            borderRadius: '8px',
            border: '1px solid #feb2b2',
            textAlign: 'center',
            fontWeight: '500'
          }}>
            ❌ {error}
          </div>
        )}

            {success && (
              <div style={{
                marginTop: '1rem',
                padding: '1.5rem',
                background: '#c6f6d5',
                color: '#2f855a',
                borderRadius: '12px',
                border: '1px solid #9ae6b4',
                textAlign: 'center',
                fontWeight: '500'
              }}>
                <div style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
                  ✅ {success}
                </div>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => window.location.href = '/'}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: '#3182ce',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '1rem',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2c5aa0'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3182ce'}
                  >
                    🏠 Volver al Inicio
                  </button>
                  <button
                    onClick={() => window.location.href = '/user/profile'}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: '#38a169',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '1rem',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2f855a'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#38a169'}
                  >
                    📋 Ver Mis Reservas
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Calendario de disponibilidad */}
          {showCalendar && selectedRoom && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000
            }}>
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '1rem',
                maxWidth: '90vw',
                maxHeight: '90vh',
                overflow: 'auto',
                position: 'relative'
              }}>
                <button
                  onClick={() => setShowCalendar(false)}
                  style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    background: '#e53e3e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '2rem',
                    height: '2rem',
                    cursor: 'pointer',
                    fontSize: '1.2rem'
                  }}
                >
                  ×
                </button>
                <h3 style={{
                  marginBottom: '1rem',
                  textAlign: 'center',
                  color: '#2d3748'
                }}>
                  {calendarType === 'checkin' ? 'Seleccionar Fecha de Entrada' : 'Seleccionar Fecha de Salida'}
                </h3>
                <AvailabilityCalendar
                  roomId={selectedRoom._id}
                  onDateSelect={handleCalendarDateSelect}
                  selectedDate={calendarType === 'checkin' ? form.checkInDate : form.checkOutDate}
                />
              </div>
            </div>
          )}
        </div>
      );
    }