'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@context/AuthContext';
import API from '@services/api';
import '@styles/RecepcionistaDashboard.css';

export default function ReservacionDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const reservationId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [reservation, setReservation] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('efectivo');
  const [paymentNotes, setPaymentNotes] = useState<string>('');

  useEffect(() => {
    if (user?.role === 'recepcionista' && reservationId) {
      loadReservation();
    }
  }, [user, reservationId]);

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

  const loadReservation = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await API.get(`/reservations/${reservationId}`);
      setReservation(response.data?.data || response.data);
    } catch (error: any) {
      console.error('Error cargando reserva:', error);
      setError(error.response?.data?.message || 'Error al cargar la reserva');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!paymentMethod) {
      setError('Por favor selecciona un método de pago');
      return;
    }

    try {
      setConfirming(true);
      setError(null);
      setSuccess(null);

      const response = await API.patch(`/recepcionista/reservations/${reservationId}/confirm`, {
        paymentMethod,
        notes: paymentNotes
      });

      if (response.data.success) {
        setSuccess('Reserva confirmada exitosamente');
        setTimeout(() => {
          router.push('/recepcionista/dashboard');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error confirmando reserva:', error);
      setError(error.response?.data?.message || 'Error al confirmar la reserva');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="recepcionista-loading">
        <div className="loading-spinner"></div>
        <p>Cargando detalles de la reserva...</p>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="error-container">
        <h2>Reserva no encontrada</h2>
        <button onClick={() => router.push('/recepcionista/dashboard')} className="btn-secondary">
          Volver al Dashboard
        </button>
      </div>
    );
  }

  const checkInDate = new Date(reservation.checkInDate);
  const checkOutDate = new Date(reservation.checkOutDate);
  const isSameDay = checkInDate.toDateString() === new Date().toDateString();
  const createdAt = new Date(reservation.createdAt);
  const oneHourLater = new Date(createdAt.getTime() + 60 * 60 * 1000);
  const isExpired = isSameDay && new Date() > oneHourLater;
  const isExpiringSoon = isSameDay && new Date() > new Date(oneHourLater.getTime() - 15 * 60 * 1000);

  return (
    <div className="recepcionista-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Detalle de Reserva</h1>
          <p>Confirmar reserva con pago</p>
        </div>
        <button onClick={() => router.push('/recepcionista/dashboard')} className="btn-secondary">
          ← Volver
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

      {isExpired && (
        <div className="warning-alert">
          <p>⚠️ Esta reserva ha expirado (más de 1 hora desde su creación). No se puede confirmar.</p>
        </div>
      )}

      {isExpiringSoon && !isExpired && (
        <div className="warning-alert">
          <p>⚠️ Esta reserva expira pronto. Confirma antes de que se cancele automáticamente.</p>
        </div>
      )}

      <div className="reservation-detail-container">
        {/* Información del cliente */}
        <div className="detail-section">
          <h2>Información del Cliente</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <strong>Nombre:</strong>
              <span>{reservation.userId?.firstName} {reservation.userId?.lastName}</span>
            </div>
            <div className="detail-item">
              <strong>Email:</strong>
              <span>{reservation.userId?.email || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <strong>Teléfono:</strong>
              <span>{reservation.userId?.phoneNumber || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Información de la reserva */}
        <div className="detail-section">
          <h2>Información de la Reserva</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <strong>Habitación:</strong>
              <span>{reservation.roomId?.name || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <strong>Check-in:</strong>
              <span>{checkInDate.toLocaleDateString('es-CO')}</span>
            </div>
            <div className="detail-item">
              <strong>Check-out:</strong>
              <span>{checkOutDate.toLocaleDateString('es-CO')}</span>
            </div>
            <div className="detail-item">
              <strong>Huéspedes:</strong>
              <span>{reservation.guestCount || 1}</span>
            </div>
            <div className="detail-item">
              <strong>Total:</strong>
              <span className="price">${reservation.totalPrice || 0}</span>
            </div>
            <div className="detail-item">
              <strong>Estado:</strong>
              <span className={`status-badge ${reservation.status}`}>{reservation.status}</span>
            </div>
          </div>
        </div>

        {/* Solicitudes especiales */}
        {reservation.specialRequests && (
          <div className="detail-section">
            <h2>Solicitudes Especiales</h2>
            <p>{reservation.specialRequests}</p>
          </div>
        )}

        {/* Formulario de confirmación */}
        {reservation.status === 'pending' && !isExpired && (
          <div className="detail-section confirmation-form">
            <h2>Confirmar Reserva con Pago</h2>
            <div className="form-group">
              <label htmlFor="paymentMethod">Método de Pago *</label>
              <select
                id="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="form-select"
                required
              >
                <option value="">Seleccione método de pago *</option>
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="paymentNotes">Notas del Pago (Opcional)</label>
              <textarea
                id="paymentNotes"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                className="form-textarea"
                placeholder="Ej: Pago recibido, referencia de transferencia, etc."
                rows={3}
              />
            </div>

            <button
              onClick={handleConfirm}
              disabled={confirming || !paymentMethod}
              className="btn-confirm-large"
            >
              {confirming ? 'Confirmando...' : '✅ Confirmar Reserva'}
            </button>
          </div>
        )}

        {reservation.status !== 'pending' && (
          <div className="detail-section">
            <div className="info-box">
              <p><strong>Estado:</strong> {reservation.status}</p>
              {reservation.confirmedAt && (
                <p><strong>Confirmada el:</strong> {new Date(reservation.confirmedAt).toLocaleString('es-CO')}</p>
              )}
              {reservation.paymentMethod && (
                <p><strong>Método de pago:</strong> {reservation.paymentMethod}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

