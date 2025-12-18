'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@context/AuthContext';
import API from '@services/api';
import '@styles/RecepcionistaDashboard.css';
import { TemporalUtils } from '@/utils/temporal.utils';

interface DashboardData {
  date?: string; // Fecha para la cual se muestran las métricas
  pendingReservations: number;
  todayReservations: number;
  todayPending: number;
  todayConfirmed: number;
  todayCancelled: number;
  reservations: any[];
}

interface CashRegisterData {
  date: string;
  summary: {
    totalReservations: number;
    grandTotal: number;
    refundsTotal: number;
    netTotal: number;
  };
  byPaymentMethod: {
    efectivo: { count: number; total: number; reservations: any[] };
    transferencia: { count: number; total: number; reservations: any[] };
  };
  cancelledReservations: any[];
  confirmedReservations: any[];
}

export default function RecepcionistaDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [cashRegisterData, setCashRegisterData] = useState<CashRegisterData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showCashRegister, setShowCashRegister] = useState(false);
  const [cashRegisterDate, setCashRegisterDate] = useState(() => {
    const { TemporalUtils } = require('@/utils/temporal.utils');
    return TemporalUtils.formatDate(TemporalUtils.today());
  });
  
  // Referencia para mantener el valor actual de la fecha en el intervalo
  const cashRegisterDateRef = React.useRef(cashRegisterDate);
  
  // Actualizar la referencia cuando cambie la fecha
  React.useEffect(() => {
    cashRegisterDateRef.current = cashRegisterDate;
  }, [cashRegisterDate]);

  useEffect(() => {
    if (user?.role === 'recepcionista') {
      const initialDate = cashRegisterDate;
      loadDashboard(initialDate);
      loadCashRegister(initialDate);
      const interval = setInterval(() => {
        // Usar la referencia para obtener el valor actual sin recrear el intervalo
        loadDashboard(cashRegisterDateRef.current);
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

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

  const loadDashboard = async (date?: string) => {
    try {
      setError(null);
      const params = date ? { date } : {};
      const response = await API.get('/recepcionista/dashboard', { params });
      setDashboardData(response.data?.data || response.data);
    } catch (error: any) {
      console.error('Error cargando dashboard:', error);
      setError(error.response?.data?.message || 'Error al cargar el dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadCashRegister = async (date?: string) => {
    try {
      const params = date ? { date } : {};
      const response = await API.get('/recepcionista/cash-register', { params });
      setCashRegisterData(response.data?.data || response.data);
    } catch (error: any) {
      console.error('Error cargando cierre de caja:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboard(cashRegisterDate); // Usar la fecha del cierre de caja
    loadCashRegister(cashRegisterDate);
  };

  const handleCashRegisterDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setCashRegisterDate(newDate);
    loadCashRegister(newDate);
    // Sincronizar las métricas con la fecha seleccionada
    loadDashboard(newDate);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: string | Date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };


  if (loading) {
    return (
      <div className="recepcionista-loading">
        <div className="loading-spinner"></div>
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="recepcionista-dashboard-simple">
      {/* Contenido Principal - Solo Métricas */}
      <main className="recepcionista-main-simple">
        <div className="dashboard-header-simple">
          <div>
            <h2>Dashboard Recepcionista</h2>
            <p>
              Métricas diarias de reservas
              {dashboardData?.date && dashboardData.date !== TemporalUtils.formatDate(TemporalUtils.today()) && (
                <span style={{ marginLeft: '0.5rem', color: '#059669', fontWeight: 600 }}>
                  - {formatDate(dashboardData.date)}
                </span>
              )}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button
              onClick={() => setShowCashRegister(!showCashRegister)}
              className="btn-cash-register"
              style={{
                background: '#059669',
                color: 'white',
                border: 'none',
                padding: '0.6rem 1.2rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem',
                transition: 'background 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#047857'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#059669'}
            >
              {showCashRegister ? '📊 Ocultar Cierre de Caja' : '💰 Ver Cierre de Caja'}
            </button>
            <button onClick={handleRefresh} className="btn-refresh" disabled={refreshing}>
              {refreshing ? '🔄 Actualizando...' : '🔄 Actualizar'}
            </button>
          </div>
        </div>

        {error && (
          <div className="error-alert">
            <p>{error}</p>
          </div>
        )}

        {/* Métricas */}
        {dashboardData && (
          <div className="metrics-grid">
            <div className="metric-card pending">
              <div className="metric-icon">⏳</div>
              <div className="metric-content">
                <h3>Pendientes</h3>
                <p className="metric-value">{dashboardData.todayPending}</p>
                <span className="metric-label">
                  {dashboardData.date && dashboardData.date !== TemporalUtils.formatDate(TemporalUtils.today())
                    ? 'Reservas del día seleccionado'
                    : 'Reservas del día'}
                </span>
              </div>
            </div>
            <div className="metric-card confirmed">
              <div className="metric-icon">✅</div>
              <div className="metric-content">
                <h3>Confirmadas</h3>
                <p className="metric-value">{dashboardData.todayConfirmed}</p>
                <span className="metric-label">
                  {dashboardData.date && dashboardData.date !== TemporalUtils.formatDate(TemporalUtils.today())
                    ? 'Día seleccionado'
                    : 'Hoy'}
                </span>
              </div>
            </div>
            <div className="metric-card cancelled">
              <div className="metric-icon">❌</div>
              <div className="metric-content">
                <h3>Canceladas</h3>
                <p className="metric-value">{dashboardData.todayCancelled}</p>
                <span className="metric-label">
                  {dashboardData.date && dashboardData.date !== TemporalUtils.formatDate(TemporalUtils.today())
                    ? 'Día seleccionado'
                    : 'Hoy'}
                </span>
              </div>
            </div>
            <div className="metric-card total">
              <div className="metric-icon">📋</div>
              <div className="metric-content">
                <h3>Total Pendientes</h3>
                <p className="metric-value">{dashboardData.pendingReservations}</p>
                <span className="metric-label">Todas las fechas</span>
              </div>
            </div>
          </div>
        )}

        {/* Cierre de Caja */}
        {showCashRegister && cashRegisterData && (
          <div className="cash-register-section">
            <div className="cash-register-header">
              <h2>💰 Cierre de Caja</h2>
              <div className="date-selector">
                <label htmlFor="cash-register-date">Fecha:</label>
                <input
                  id="cash-register-date"
                  type="date"
                  value={cashRegisterDate}
                  onChange={handleCashRegisterDateChange}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
            </div>

            {/* Resumen General */}
            <div className="cash-register-summary">
              <div className="summary-card">
                <h3>Resumen del Día</h3>
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="summary-label">Total Reservas:</span>
                    <span className="summary-value">{cashRegisterData.summary.totalReservations}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Ingresos Totales:</span>
                    <span className="summary-value positive">{formatCurrency(cashRegisterData.summary.grandTotal)}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Reembolsos:</span>
                    <span className="summary-value negative">{formatCurrency(cashRegisterData.summary.refundsTotal)}</span>
                  </div>
                  <div className="summary-item highlight">
                    <span className="summary-label">Total Neto:</span>
                    <span className="summary-value">{formatCurrency(cashRegisterData.summary.netTotal)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Por Método de Pago */}
            <div className="payment-methods-section">
              <h3>Por Método de Pago</h3>
              <div className="payment-methods-grid">
                <div className="payment-method-card efectivo">
                  <div className="payment-method-header">
                    <span className="payment-icon">💵</span>
                    <h4>Efectivo</h4>
                  </div>
                  <div className="payment-method-stats">
                    <div className="stat-item">
                      <span className="stat-label">Reservas:</span>
                      <span className="stat-value">{cashRegisterData.byPaymentMethod.efectivo.count}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Total:</span>
                      <span className="stat-value amount">{formatCurrency(cashRegisterData.byPaymentMethod.efectivo.total)}</span>
                    </div>
                  </div>
                </div>

                <div className="payment-method-card transferencia">
                  <div className="payment-method-header">
                    <span className="payment-icon">🏦</span>
                    <h4>Transferencia</h4>
                  </div>
                  <div className="payment-method-stats">
                    <div className="stat-item">
                      <span className="stat-label">Reservas:</span>
                      <span className="stat-value">{cashRegisterData.byPaymentMethod.transferencia.count}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Total:</span>
                      <span className="stat-value amount">{formatCurrency(cashRegisterData.byPaymentMethod.transferencia.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detalle de Reservas Confirmadas */}
            {cashRegisterData.confirmedReservations.length > 0 && (
              <div className="reservations-detail-section">
                <h3>Reservas Confirmadas ({cashRegisterData.confirmedReservations.length})</h3>
                <div className="reservations-table-container">
                  <table className="cash-register-table">
                    <thead>
                      <tr>
                        <th>Habitación</th>
                        <th>Huésped</th>
                        <th>Check-in</th>
                        <th>Check-out</th>
                        <th>Método</th>
                        <th>Total</th>
                        <th>Confirmado por</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cashRegisterData.confirmedReservations.map((res: any) => (
                        <tr key={res._id}>
                          <td>{res.room?.name || res.room?.roomNumber || 'N/A'}</td>
                          <td>{res.guest?.firstName} {res.guest?.lastName}</td>
                          <td>{formatDate(res.checkInDate)}</td>
                          <td>{formatDate(res.checkOutDate)}</td>
                          <td>
                            <span className={`payment-badge ${res.paymentMethod?.toLowerCase() || 'efectivo'}`}>
                              {res.paymentMethod === 'efectivo' ? '💵 Efectivo' : 
                               res.paymentMethod === 'transferencia' ? '🏦 Transferencia' : 
                               '💵 Efectivo'}
                            </span>
                          </td>
                          <td className="amount-cell">{formatCurrency(res.totalPrice)}</td>
                          <td>
                            {res.confirmedBy?.firstName} {res.confirmedBy?.lastName}
                            <br />
                            <small style={{ color: '#666' }}>
                              {res.confirmedAt ? new Date(res.confirmedAt).toLocaleTimeString('es-CO') : ''}
                            </small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Reservas Canceladas */}
            {cashRegisterData.cancelledReservations.length > 0 && (
              <div className="cancelled-reservations-section">
                <h3>Reservas Canceladas ({cashRegisterData.cancelledReservations.length})</h3>
                <div className="reservations-table-container">
                  <table className="cash-register-table">
                    <thead>
                      <tr>
                        <th>Habitación</th>
                        <th>Huésped</th>
                        <th>Check-in</th>
                        <th>Total</th>
                        <th>Motivo</th>
                        <th>Fecha Cancelación</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cashRegisterData.cancelledReservations.map((res: any) => (
                        <tr key={res._id} className="cancelled-row">
                          <td>{res.room?.name || res.room?.roomNumber || 'N/A'}</td>
                          <td>{res.guest?.firstName} {res.guest?.lastName}</td>
                          <td>{formatDate(res.checkInDate)}</td>
                          <td className="amount-cell negative">{formatCurrency(res.totalPrice)}</td>
                          <td>{res.cancellationReason || 'Sin motivo especificado'}</td>
                          <td>{res.cancelledAt ? formatDate(res.cancelledAt) : 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

