'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@context/AuthContext';
import API from '@services/api';
import '@styles/RecepcionistaDashboard.css';

export default function ReservacionesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reservations, setReservations] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming'>('all');

  useEffect(() => {
    if (user?.role === 'recepcionista') {
      loadReservations();
    }
  }, [user, filter]);

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

  const loadReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await API.get('/recepcionista/reservations/pending');
      let data = response.data?.data || response.data || [];
      
      // Aplicar filtros
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (filter === 'today') {
        data = data.filter((r: any) => {
          const checkIn = new Date(r.checkInDate);
          checkIn.setHours(0, 0, 0, 0);
          return checkIn.getTime() === today.getTime();
        });
      } else if (filter === 'upcoming') {
        data = data.filter((r: any) => {
          const checkIn = new Date(r.checkInDate);
          checkIn.setHours(0, 0, 0, 0);
          return checkIn.getTime() > today.getTime();
        });
      }
      
      setReservations(data);
    } catch (error: any) {
      console.error('Error cargando reservas:', error);
      setError(error.response?.data?.message || 'Error al cargar las reservas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="recepcionista-loading">
        <div className="loading-spinner"></div>
        <p>Cargando reservas...</p>
      </div>
    );
  }

  return (
    <div className="recepcionista-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Reservas Pendientes</h1>
          <p>Gestiona y confirma las reservas pendientes</p>
        </div>
        <button onClick={() => router.push('/recepcionista/dashboard')} className="btn-secondary">
          ← Volver al Dashboard
        </button>
      </div>

      {error && (
        <div className="error-alert">
          <p>{error}</p>
        </div>
      )}

      {/* Filtros */}
      <div className="filters-section">
        <button
          onClick={() => setFilter('all')}
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
        >
          Todas
        </button>
        <button
          onClick={() => setFilter('today')}
          className={`filter-btn ${filter === 'today' ? 'active' : ''}`}
        >
          Hoy
        </button>
        <button
          onClick={() => setFilter('upcoming')}
          className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
        >
          Próximas
        </button>
      </div>

      {/* Lista de reservas */}
      {reservations.length > 0 ? (
        <div className="reservations-list">
          {reservations.map((reservation: any) => {
            const checkInDate = new Date(reservation.checkInDate);
            const isSameDay = checkInDate.toDateString() === new Date().toDateString();
            const createdAt = new Date(reservation.createdAt);
            const oneHourLater = new Date(createdAt.getTime() + 60 * 60 * 1000);
            const isExpiringSoon = isSameDay && new Date() > new Date(oneHourLater.getTime() - 15 * 60 * 1000);

            return (
              <div
                key={reservation._id}
                className={`reservation-card ${isExpiringSoon ? 'expiring-soon' : ''}`}
                onClick={() => router.push(`/recepcionista/reservaciones/${reservation._id}`)}
              >
                <div className="reservation-header">
                  <h3>
                    {reservation.userId?.firstName} {reservation.userId?.lastName}
                  </h3>
                  {isExpiringSoon && (
                    <span className="expiring-badge">⚠️ Expira pronto</span>
                  )}
                  {isSameDay && (
                    <span className="same-day-badge">Hoy</span>
                  )}
                </div>
                <div className="reservation-details">
                  <p><strong>Habitación:</strong> {reservation.roomId?.name || 'N/A'}</p>
                  <p><strong>Check-in:</strong> {checkInDate.toLocaleDateString('es-CO')}</p>
                  <p><strong>Check-out:</strong> {new Date(reservation.checkOutDate).toLocaleDateString('es-CO')}</p>
                  <p><strong>Total:</strong> ${reservation.totalPrice || 0}</p>
                  <p><strong>Email:</strong> {reservation.userId?.email || 'N/A'}</p>
                  <p><strong>Teléfono:</strong> {reservation.userId?.phoneNumber || 'N/A'}</p>
                </div>
                <div className="reservation-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/recepcionista/reservaciones/${reservation._id}`);
                    }}
                    className="btn-confirm"
                  >
                    Ver Detalles y Confirmar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <p>No hay reservas pendientes con el filtro seleccionado</p>
        </div>
      )}
    </div>
  );
}

