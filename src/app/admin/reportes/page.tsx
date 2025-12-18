'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@context/AuthContext';
import { reportsService } from '@services/reportsService';
import API from '@services/api';
import GraphVisualization from '@components/GraphVisualization';
import '@styles/ReportesDashboard.css';

interface ReportData {
  reservationsByRoom?: any[];
  activeUsers?: any[];
  monthlyReservations?: any[];
  reservationsToday?: any;
  roomOccupancy?: any[];
  popularServices?: any[];
  reservationsStats?: any[];
}

export default function AdminReportesDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<ReportData>({});
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'superadmin') {
      loadReports();
    }
  }, [user]);

  // Verificar permisos
  if (user?.role !== 'admin' && user?.role !== 'superadmin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);

      // Calcular fechas para reporte mensual (últimos 30 días)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      // Cargar todos los reportes en paralelo
      const [
        reservationsByRoom,
        activeUsers,
        monthlyReservations,
        reservationsToday,
        roomOccupancy,
        popularServices,
        reservationsStats
      ] = await Promise.all([
        reportsService.getReservationsByRoom().catch(() => []),
        reportsService.getActiveUsers().catch(() => []),
        API.get(`/reports/reservations-monthly?startDate=${startDateStr}&endDate=${endDateStr}`)
          .then(res => res.data)
          .catch(() => []),
        API.get('/reports/reservations-today')
          .then(res => {
            // El TransformInterceptor envuelve la respuesta en { success: true, data: {...} }
            // Necesitamos extraer el data interno que contiene los datos reales
            return res.data?.data || res.data || null;
          })
          .catch(() => null),
        reportsService.getRoomOccupancy().catch(() => []),
        reportsService.getPopularServices().catch(() => []),
        reportsService.getReservationsStats().catch(() => [])
      ]);

      // Normalizar respuestas (algunas vienen con data, otras directas)
      const normalizeData = (data: any): any[] => {
        if (Array.isArray(data)) return data;
        if (data?.data && Array.isArray(data.data)) return data.data;
        return [];
      };

      setReports({
        reservationsByRoom: normalizeData(reservationsByRoom),
        activeUsers: normalizeData(activeUsers),
        monthlyReservations: normalizeData(monthlyReservations),
        reservationsToday: reservationsToday || null,
        roomOccupancy: normalizeData(roomOccupancy),
        popularServices: normalizeData(popularServices),
        reservationsStats: normalizeData(reservationsStats)
      });
    } catch (error: any) {
      console.error('Error al cargar reportes:', error);
      setError(error.message || 'Error al cargar los reportes');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  const handleDownloadExcel = async () => {
    try {
      setRefreshing(true);
      
      // Calcular fechas para reporte mensual (últimos 30 días)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      // Descargar el archivo Excel
      const response = await API.get(
        `/reports/export-excel?startDate=${startDateStr}&endDate=${endDateStr}`,
        {
          responseType: 'blob' // Importante para descargar archivos binarios
        }
      );
      
      // Crear un enlace temporal para descargar el archivo
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Obtener el nombre del archivo del header o usar uno por defecto
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'reporte-metricas-hotel.xlsx';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setRefreshing(false);
    } catch (error: any) {
      console.error('Error al descargar Excel:', error);
      setError('Error al descargar el archivo Excel. Por favor, intenta nuevamente.');
      setRefreshing(false);
    }
  };

  const handleDownloadNetworkAnalysisPDF = async () => {
    try {
      setRefreshing(true);
      
      // Descargar el PDF de análisis de red
      const response = await API.get(
        '/reports/export-network-analysis-pdf',
        {
          responseType: 'blob'
        }
      );
      
      // Crear un enlace temporal para descargar el archivo
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Obtener el nombre del archivo del header o usar uno por defecto
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'analisis-red-relaciones.pdf';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setRefreshing(false);
    } catch (error: any) {
      console.error('Error al descargar PDF de análisis de red:', error);
      setError('Error al descargar el PDF de análisis de red. Asegúrate de que Neo4j esté configurado y sincronizado.');
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando reportes...</p>
        </div>
      </div>
    );
  }

  // Calcular totales generales para el header
  const totalReservations = reports.reservationsStats?.reduce((sum: number, stat: any) => sum + (stat.totalReservations || 0), 0) || 0;
  const totalRevenue = reports.reservationsStats?.reduce((sum: number, stat: any) => sum + (stat.totalRevenue || 0), 0) || 0;
  const totalUsers = reports.activeUsers?.reduce((sum: number, user: any) => sum + (user.totalUsers || 0), 0) || 0;
  const totalRooms = reports.reservationsByRoom?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="reportes-dashboard">
        {/* Header Mejorado */}
        <div className="reportes-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1>📊 Reportes del Hotel</h1>
              <p>Análisis completo de estadísticas y métricas operativas</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={handleDownloadExcel}
                className="btn-refresh"
                disabled={refreshing}
                style={{ 
                  background: '#10b981', 
                  color: 'white', 
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
              >
                📊 Descargar Excel
              </button>
              <button
                onClick={handleDownloadNetworkAnalysisPDF}
                className="btn-refresh"
                disabled={refreshing}
                style={{ 
                  background: '#6366f1', 
                  color: 'white', 
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6366f1'}
              >
                🕸️ Análisis de Red (PDF)
              </button>
              <button
                onClick={handleRefresh}
                className="btn-refresh"
                disabled={refreshing}
              >
                {refreshing ? '⏳ Actualizando...' : '🔄 Actualizar Reportes'}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="report-card" style={{ gridColumn: '1 / -1', background: '#fee2e2', borderColor: '#f87171' }}>
            <p style={{ color: '#991b1b', margin: 0 }}>❌ {error}</p>
          </div>
        )}

        {/* Grid Principal - Diseño de 2 Columnas */}
        <div className="reportes-grid">
          {/* TOP ROW: Estadísticas Generales + Usuarios Activos (Combinados en 1 fila) */}
          <div className="report-card report-card-full report-card-compact">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {/* Columna Izquierda: Estadísticas de Reservaciones */}
              <div>
                <h2>📈 Estadísticas de Reservaciones</h2>
                <div className="report-stats-grid">
                  {reports.reservationsStats?.map((stat: any, index: number) => {
                    const bgClass = index % 4 === 0 ? 'secondary' : index % 4 === 1 ? 'success' : index % 4 === 2 ? 'warning' : 'info';
                    return (
                      <div key={index} className={`report-stat-card ${bgClass}`}>
                        <h3>{stat.status || 'Sin estado'}</h3>
                        <p>{stat.totalReservations || 0}</p>
                        <div style={{ marginTop: '0.25rem', fontSize: '0.65rem', color: '#64748b' }}>
                          <div>${(stat.totalRevenue || 0).toLocaleString()}</div>
                        </div>
                      </div>
                    );
                  })}
                  {/* Card de Total General */}
                  {reports.reservationsStats && reports.reservationsStats.length > 0 && (
                    <div className="report-stat-card info">
                      <h3>Total</h3>
                      <p>{totalReservations}</p>
                      <div style={{ marginTop: '0.25rem', fontSize: '0.65rem', color: '#64748b' }}>
                        <div>${totalRevenue.toLocaleString()}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Columna Derecha: Usuarios Activos */}
              {reports.activeUsers && reports.activeUsers.length > 0 && (
                <div>
                  <h2>👥 Usuarios Activos por Rol</h2>
                  <div className="report-stats-grid">
                    {reports.activeUsers.map((userGroup: any, index: number) => {
                      const bgClass = index % 3 === 0 ? 'secondary' : index % 3 === 1 ? 'success' : 'info';
                      return (
                        <div key={index} className={`report-stat-card ${bgClass}`}>
                          <h3>{userGroup._id || 'Sin rol'}</h3>
                          <p>{userGroup.totalUsers || 0}</p>
                          <div style={{ marginTop: '0.25rem', fontSize: '0.65rem', color: '#64748b' }}>
                            <div>Activos: {userGroup.activeUsers || 0}</div>
                            <div>Recientes: {userGroup.recentlyCreated || 0}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* FILA CENTRAL: Reservaciones por Habitación y Ocupación (Separados, 50% cada uno) */}
          {(reports.reservationsByRoom && reports.reservationsByRoom.length > 0) || (reports.roomOccupancy && reports.roomOccupancy.length > 0) ? (
            <div className="report-card-pair">
              {/* COLUMNA IZQUIERDA: Reservaciones por Habitación */}
              {reports.reservationsByRoom && reports.reservationsByRoom.length > 0 && (
                <div className="report-card">
                  <h2>🏨 Reservaciones por Habitación</h2>
                  <div className="overflow-x-auto">
                    <table className="report-table">
                      <thead>
                        <tr>
                          <th>Habitación</th>
                          <th>Reservas</th>
                          <th>Ingresos</th>
                          <th>Promedio</th>
                          <th>Ocupación</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reports.reservationsByRoom.slice(0, 10).map((room: any, index: number) => (
                          <tr key={index}>
                            <td style={{ fontWeight: 600 }}>{room.roomName || 'N/A'}</td>
                            <td>{room.totalReservations || 0}</td>
                            <td>${(room.totalRevenue || 0).toLocaleString()}</td>
                            <td>${(room.averagePrice || 0).toFixed(2)}</td>
                            <td>
                              <span className={`occupancy-badge ${
                                room.occupancyRate === 'Alta' 
                                  ? 'occupancy-high'
                                  : room.occupancyRate === 'Media'
                                  ? 'occupancy-medium'
                                  : 'occupancy-low'
                              }`}>
                                {room.occupancyRate || 'Baja'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {reports.reservationsByRoom.length > 10 && (
                      <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#6b7280', textAlign: 'center' }}>
                        Mostrando 10 de {reports.reservationsByRoom.length} habitaciones
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* COLUMNA DERECHA: Ocupación de Habitaciones */}
              {reports.roomOccupancy && reports.roomOccupancy.length > 0 && (
                <div className="report-card">
                  <h2>📋 Ocupación de Habitaciones</h2>
                  <div className="overflow-x-auto">
                    <table className="report-table">
                      <thead>
                        <tr>
                          <th>Habitación</th>
                          <th>Reservas</th>
                          <th>Tasa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reports.roomOccupancy.slice(0, 10).map((room: any, index: number) => (
                          <tr key={index}>
                            <td style={{ fontWeight: 600 }}>{room._id || 'N/A'}</td>
                            <td>{room.totalReservations || 0}</td>
                            <td>
                              <span className={`occupancy-badge ${
                                room.occupancyRate === 'Alta' 
                                  ? 'occupancy-high'
                                  : room.occupancyRate === 'Media'
                                  ? 'occupancy-medium'
                                  : 'occupancy-low'
                              }`}>
                                {room.occupancyRate || 'Baja'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* FILA: Servicios Populares */}
          {reports.popularServices && reports.popularServices.length > 0 && (
            <div className="report-card">
              <h2>⭐ Servicios Más Populares</h2>
              <div className="overflow-x-auto">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Categoría</th>
                      <th>Reservas</th>
                      <th>Ingresos</th>
                      <th>Popularidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.popularServices.map((service: any, index: number) => (
                      <tr key={index}>
                        <td style={{ fontWeight: 600 }}>{service._id || 'Sin categoría'}</td>
                        <td>{service.totalBookings || 0}</td>
                        <td>${(service.totalRevenue || 0).toLocaleString()}</td>
                        <td>
                          <span className={`popularity-badge ${
                            service.popularity === 'Muy Popular' 
                              ? 'popularity-very'
                              : service.popularity === 'Popular'
                              ? 'popularity-popular'
                              : 'popularity-low'
                          }`}>
                            {service.popularity || 'Baja'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* FULL WIDTH: Visualización de Grafo de Relaciones */}
          <div className="report-card report-card-full">
            <h2>🕸️ Visualización de Red de Relaciones (Neo4j)</h2>
            <p style={{ marginBottom: '1rem', color: '#6b7280', fontSize: '0.95rem' }}>
              Este grafo muestra las relaciones entre usuarios, reservaciones y habitaciones del <strong>día actual</strong>.
              Los nodos azules representan usuarios, los verdes reservaciones confirmadas, los azules reservaciones pendientes, 
              los rojos reservaciones canceladas y los amarillos habitaciones.
            </p>
            <GraphVisualization 
              limit={150}
              height="600px"
              showControls={true}
            />
          </div>

          {/* FULL WIDTH: Reservaciones del Día */}
          {reports.reservationsToday && (
            <div className="report-card report-card-full">
              <h2>📊 Reservaciones del Día (Hoy)</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', padding: '1.5rem', borderRadius: '12px', color: 'white' }}>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Total Reservaciones</div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{reports.reservationsToday.total || 0}</div>
                </div>
                <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '1.5rem', borderRadius: '12px', color: 'white' }}>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Confirmadas</div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{reports.reservationsToday.byStatus?.confirmed || 0}</div>
                </div>
                <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', padding: '1.5rem', borderRadius: '12px', color: 'white' }}>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Pendientes</div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{reports.reservationsToday.byStatus?.pending || 0}</div>
                </div>
                <div style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', padding: '1.5rem', borderRadius: '12px', color: 'white' }}>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Canceladas</div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{reports.reservationsToday.byStatus?.cancelled || 0}</div>
                </div>
                <div style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', padding: '1.5rem', borderRadius: '12px', color: 'white' }}>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Ingresos del Día</div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>${(reports.reservationsToday.totalRevenue || 0).toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}

          {/* FULL WIDTH: Reservaciones Mensuales */}
          {reports.monthlyReservations && reports.monthlyReservations.length > 0 && (
            <div className="report-card report-card-full">
              <h2>📅 Reservaciones Mensuales (Últimos 30 días)</h2>
              <div className="overflow-x-auto">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Mes</th>
                      <th>Año</th>
                      <th>Total Reservaciones</th>
                      <th>Ingresos Totales</th>
                      <th>Precio Promedio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.monthlyReservations.map((month: any, index: number) => (
                      <tr key={index}>
                        <td style={{ fontWeight: 600 }}>{month.month || 'N/A'}</td>
                        <td>{month.year || 'N/A'}</td>
                        <td>{month.totalReservations || 0}</td>
                        <td>${(month.totalRevenue || 0).toLocaleString()}</td>
                        <td>${(month.averagePrice || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Mensaje si no hay reportes */}
          {Object.keys(reports).length === 0 && !loading && (
            <div className="report-card report-card-full">
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ fontSize: '1.125rem', color: '#6b7280', marginBottom: '1rem' }}>
                  No hay reportes disponibles en este momento.
                </p>
                <button
                  onClick={handleRefresh}
                  className="btn-refresh"
                  style={{ background: '#667eea', color: 'white', border: 'none' }}
                >
                  🔄 Intentar Cargar Nuevamente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
