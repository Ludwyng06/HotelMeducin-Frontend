'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@context/AuthContext';
import API from '@services/api';
import { useToast } from '../../../hooks/useToast';
import ToastContainer from '../../../components/Toast/ToastContainer';
import '@styles/RecepcionistaHabitaciones.css';

export default function RecepcionistaHabitaciones() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [roomsByCategory, setRoomsByCategory] = useState<any[]>([]);
  const { toasts, success, removeToast } = useToast();
  const [realTimeCounters, setRealTimeCounters] = useState<{ [key: string]: { minutes: number; seconds: number } }>({});

  useEffect(() => {
    if (user?.role === 'recepcionista') {
      loadRooms();
      const interval = setInterval(loadRooms, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Actualizar contadores en tiempo real
  useEffect(() => {
    const updateCounters = () => {
      const newCounters: { [key: string]: { minutes: number; seconds: number } } = {};
      
      roomsByCategory.forEach((categoryGroup) => {
        categoryGroup.rooms.forEach((room: any) => {
          if (room.pendingReservation && room.pendingReservation.createdAt) {
            // Calcular tiempo de expiración: 1 hora después de la creación (igual que el backend)
            const createdAt = new Date(room.pendingReservation.createdAt);
            const expirationTime = new Date(createdAt.getTime() + 60 * 60 * 1000); // 1 hora
            
            const now = new Date();
            const diff = expirationTime.getTime() - now.getTime();
            
            if (diff > 0) {
              const minutes = Math.floor(diff / 60000);
              const seconds = Math.floor((diff % 60000) / 1000);
              newCounters[room._id] = { minutes, seconds };
            } else {
              newCounters[room._id] = { minutes: 0, seconds: 0 };
            }
          }
        });
      });
      
      setRealTimeCounters(newCounters);
    };

    updateCounters();
    const interval = setInterval(updateCounters, 1000);
    return () => clearInterval(interval);
  }, [roomsByCategory]);

  if (user?.role !== 'recepcionista') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  const loadRooms = async () => {
    try {
      const response = await API.get('/recepcionista/rooms/with-reservations');
      const data = response.data?.data || [];
      setRoomsByCategory(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error cargando habitaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función helper para obtener imagen correcta según categoría
  const getRoomImage = (room: any) => {
    // Siempre usar la imagen de la categoría, no las imageUrls de la habitación
    const categoryName = room.categoryId?.name || '';
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

  // Función helper para formatear tiempo restante
  const formatTimeRemaining = (roomId: string, timeUntilExpiration: any) => {
    // Usar contador en tiempo real si está disponible
    if (realTimeCounters[roomId]) {
      const { minutes, seconds } = realTimeCounters[roomId];
      if (minutes <= 0 && seconds <= 0) {
        return 'Expirada';
      }
      return `${minutes}m ${seconds}s`;
    }
    
    // Fallback al tiempo del servidor
    if (!timeUntilExpiration || timeUntilExpiration.total <= 0) {
      return 'Expirada';
    }
    return `${timeUntilExpiration.minutes}m ${timeUntilExpiration.seconds}s`;
  };

  const handleRoomClick = (room: any) => {
    // Navegar a la página de detalles de la habitación
    router.push(`/recepcionista/habitaciones/${room._id}`);
  };


  if (loading) {
    return (
      <div className="recepcionista-loading">
        <div className="loading-spinner"></div>
        <p>Cargando habitaciones...</p>
      </div>
    );
  }

  return (
    <div className="recepcionista-habitaciones-page">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      {/* Contenido Principal - Habitaciones */}
      <main className="habitaciones-main">
        <div className="habitaciones-header">
          <h1>Habitaciones</h1>
          <button onClick={loadRooms} className="btn-refresh-small">
            🔄 Actualizar
          </button>
        </div>

        {roomsByCategory.length > 0 ? (
          <div className="rooms-columns-layout">
            {roomsByCategory.map((categoryGroup) => (
              <div key={categoryGroup.categoryName} className="category-column">
                <div className="category-header-column">
                  <h2>{categoryGroup.categoryName}</h2>
                </div>
                <div className="rooms-in-column">
                  {categoryGroup.rooms
                    .sort((a: any, b: any) => parseInt(a.roomNumber) - parseInt(b.roomNumber))
                    .map((room: any) => (
                    <div 
                      key={room._id} 
                      className={`room-card-square ${room.currentStatus} clickable`}
                      onClick={() => handleRoomClick(room)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="room-image-container">
                        <img 
                          src={getRoomImage(room)} 
                          alt={room.name}
                          className="room-image"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/habitacion-estandar.jpg';
                          }}
                        />
                      </div>
                      <div className="room-card-content">
                        <div className="room-number-badge">#{room.roomNumber}</div>
                        <h3 className="room-name-small">{room.name}</h3>
                        <div className="room-status-badge-small">
                          <span className={`status-dot ${room.currentStatus}`}></span>
                          {room.currentStatus === 'occupied' ? 'Ocupada' : 
                           room.currentStatus === 'maintenance' ? 'Mantenimiento' : 
                           room.currentStatus === 'pending' ? 'Pendiente' :
                           room.currentStatus === 'expired' ? 'Expirada' :
                           'Disponible'}
                        </div>
                        {room.pendingReservation && (
                          <div className="room-pending-info">
                            <p className="client-name">{room.pendingReservation.userId?.firstName} {room.pendingReservation.userId?.lastName}</p>
                            <p className="room-price">${room.pendingReservation.totalPrice}</p>
                            {/* Solo mostrar tiempo de expiración para reservas pendientes, no confirmadas */}
                            {room.currentStatus === 'pending' && (
                              <>
                                {realTimeCounters[room._id] && (realTimeCounters[room._id].minutes > 0 || realTimeCounters[room._id].seconds > 0) && (
                                  <p className="time-remaining-small">
                                    ⏱️ {formatTimeRemaining(room._id, room.timeUntilExpiration)}
                                  </p>
                                )}
                                {(!realTimeCounters[room._id] || (realTimeCounters[room._id].minutes <= 0 && realTimeCounters[room._id].seconds <= 0)) && (
                                  <p className="expired-badge-small">⚠️ Reserva pendiente expirada</p>
                                )}
                              </>
                            )}
                            {/* Para reservas confirmadas, mostrar información de fechas */}
                            {room.currentStatus === 'occupied' && room.pendingReservation.status === 'confirmed' && (
                              <p className="check-in-out-info-small">
                                📅 {new Date(room.pendingReservation.checkInDate).toLocaleDateString()} - {new Date(room.pendingReservation.checkOutDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No hay habitaciones disponibles</p>
          </div>
        )}
      </main>
    </div>
  );
}

