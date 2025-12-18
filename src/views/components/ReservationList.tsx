import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ConfirmDialog from './ConfirmDialog';
import { FaEdit, FaTrash, FaSearch } from 'react-icons/fa';

interface ReservationListProps {
  reservas: any[];
  loading: boolean;
  onDelete: (id: number) => void;
}

const ReservationList: React.FC<ReservationListProps> = ({ reservas, loading, onDelete }) => {
  const [search, setSearch] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const router = useRouter();


  const filtered = reservas.filter(r => {
    // Manejar diferentes estructuras de datos del backend
    const roomName = r.room?.name || r.roomId?.name || 'Habitación';
    const matchNombre = roomName.toLowerCase().includes(search.toLowerCase());
    const matchFecha = searchDate ? r.checkInDate?.slice(0,10) === searchDate : true;
    return matchNombre && matchFecha;
  });

  // Debug de las reservas filtradas
  console.log('🔍 Reservas filtradas:', filtered);
  console.log('🔍 Cantidad de reservas filtradas:', filtered.length);

  const handleAskDelete = (id: number) => {
    setSelectedId(id);
    setDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedId !== null) {
      onDelete(selectedId);
    }
    setDialogOpen(false);
    setSelectedId(null);
  };

  // Función helper para verificar si se puede cancelar (más de 24 horas antes del check-in)
  const canCancelReservation = (checkInDate: string): boolean => {
    if (!checkInDate) return false;
    const checkIn = new Date(checkInDate);
    const now = new Date();
    const hoursUntilCheckIn = (checkIn.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilCheckIn >= 24;
  };

  return (
    <div>
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap'
      }}>
        <input
          type="text"
          placeholder="Buscar por habitación..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            minWidth: '220px',
            padding: '0.5rem',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            fontSize: '1rem',
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            outline: 'none'
          }}
        />
        <input
          type="date"
          value={searchDate}
          onChange={e => setSearchDate(e.target.value)}
          style={{
            padding: '0.5rem',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            fontSize: '1rem',
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            outline: 'none'
          }}
        />
      </div>
      <div style={{
        width: '100%',
        overflowX: 'auto',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        background: 'var(--color-surface)',
        boxShadow: 'var(--shadow-md)'
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          backgroundColor: 'var(--color-surface)'
        }}>
          <thead>
            <tr style={{ 
              backgroundColor: 'var(--color-primary)',
              background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)'
            }}>
              <th style={{
                padding: '1rem',
                textAlign: 'left',
                fontWeight: '700',
                color: 'white',
                borderBottom: '2px solid var(--color-primary-dark)',
                fontSize: '0.95rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>Habitación</th>
              <th style={{
                padding: '1rem',
                textAlign: 'left',
                fontWeight: '700',
                color: 'white',
                borderBottom: '2px solid var(--color-primary-dark)',
                fontSize: '0.95rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>Check-in</th>
              <th style={{
                padding: '1rem',
                textAlign: 'left',
                fontWeight: '700',
                color: 'white',
                borderBottom: '2px solid var(--color-primary-dark)',
                fontSize: '0.95rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>Check-out</th>
              <th style={{
                padding: '1rem',
                textAlign: 'left',
                fontWeight: '700',
                color: 'white',
                borderBottom: '2px solid var(--color-primary-dark)',
                fontSize: '0.95rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>Estado</th>
              <th style={{
                padding: '1rem',
                textAlign: 'left',
                fontWeight: '700',
                color: 'white',
                borderBottom: '2px solid var(--color-primary-dark)',
                fontSize: '0.95rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>Total</th>
              <th style={{
                padding: '1rem',
                textAlign: 'left',
                fontWeight: '700',
                color: 'white',
                borderBottom: '2px solid var(--color-primary-dark)',
                fontSize: '0.95rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: 'var(--color-text-light)',
                  fontStyle: 'italic',
                  background: 'var(--color-surface)'
                }}>Cargando...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: 'var(--color-text-light)',
                  fontStyle: 'italic',
                  background: 'var(--color-surface)'
                }}>No hay reservas.</td>
              </tr>
            ) : filtered.map((res, idx) => (
              <tr key={res._id || res.id} style={{
                backgroundColor: idx % 2 === 0 ? 'var(--color-surface)' : 'var(--color-bg)',
                borderBottom: '1px solid var(--color-border)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(49, 130, 206, 0.1)';
                e.currentTarget.style.transform = 'scale(1.01)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = idx % 2 === 0 ? 'var(--color-surface)' : 'var(--color-bg)';
                e.currentTarget.style.transform = 'scale(1)';
              }}>
                <td style={{
                  padding: '1rem',
                  color: 'var(--color-text)',
                  fontWeight: '600'
                }}>{res.room?.name || res.roomId?.name || 'Habitación'}</td>
                <td style={{
                  padding: '1rem',
                  color: 'var(--color-text-light)'
                }}>{res.checkInDate?.slice(0,10) || '-'}</td>
                <td style={{
                  padding: '1rem',
                  color: 'var(--color-text-light)'
                }}>{res.checkOutDate?.slice(0,10) || '-'}</td>
                <td style={{ padding: '1rem' }}>
                  {/* COMPLETED - Verde oscuro como en el grafo */}
                  {(res.status === 'COMPLETED' || res.status === 'completed') && (
                    <span style={{
                      padding: '0.4rem 0.9rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      backgroundColor: '#059669',
                      color: '#ffffff',
                      display: 'inline-block',
                      boxShadow: '0 2px 4px rgba(5, 150, 105, 0.3)'
                    }}>Completada</span>
                  )}
                  {/* EXPIRED - Amarillo como en el grafo */}
                  {(res.status === 'EXPIRED' || res.status === 'expired') && (
                    <span style={{
                      padding: '0.4rem 0.9rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      backgroundColor: '#f59e0b',
                      color: '#1f2937',
                      display: 'inline-block',
                      boxShadow: '0 2px 4px rgba(245, 158, 11, 0.3)'
                    }}>Expirada</span>
                  )}
                  {/* CANCELLED - Rojo como en el grafo */}
                  {(res.status === 'CANCELLED' || res.status === 'cancelled') && (
                    <span style={{
                      padding: '0.4rem 0.9rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      backgroundColor: '#ef4444',
                      color: '#ffffff',
                      display: 'inline-block',
                      boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)'
                    }}>Cancelada</span>
                  )}
                  {/* PENDING - Azul como en el grafo */}
                  {(res.status === 'PENDING' || res.status === 'pending') && (
                    <span style={{
                      padding: '0.4rem 0.9rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      backgroundColor: '#3b82f6',
                      color: '#ffffff',
                      display: 'inline-block',
                      boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
                    }}>Pendiente</span>
                  )}
                  {/* CONFIRMED - Verde como en el grafo */}
                  {(res.status === 'CONFIRMED' || res.status === 'confirmed') && (
                    <span style={{
                      padding: '0.4rem 0.9rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      display: 'inline-block',
                      boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)'
                    }}>Confirmada</span>
                  )}
                  {/* Estado desconocido - solo mostrar si no coincide con ningún estado conocido */}
                  {!['COMPLETED', 'EXPIRED', 'CANCELLED', 'PENDING', 'CONFIRMED', 'completed', 'expired', 'cancelled', 'pending', 'confirmed'].includes(res.status) && (
                    <span style={{
                      padding: '0.4rem 0.9rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      backgroundColor: '#6b7280',
                      color: '#ffffff',
                      display: 'inline-block',
                      boxShadow: '0 2px 4px rgba(107, 114, 128, 0.3)'
                    }}>{res.status || 'Sin estado'}</span>
                  )}
                </td>
                <td style={{
                  padding: '1rem',
                  color: 'var(--color-text)',
                  fontWeight: '700',
                  fontSize: '1.05rem'
                }}>${res.totalPrice}</td>
                <td style={{
                  padding: '1rem',
                  display: 'flex',
                  gap: '0.5rem',
                  alignItems: 'center'
                }}>
                  {/* Botón Ver detalles - siempre visible para todas las reservas */}
                  <button
                    onClick={() => router.push(`/reservations/confirmacion?id=${res._id || res.id}`)}
                    title="Ver detalles"
                    style={{
                      background: '#38a169',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.5rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2f855a'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#38a169'}
                  >
                    <FaSearch size={16} />
                  </button>

                  {/* Acciones solo para reservas PENDIENTES */}
                  {(['PENDING', 'pending'].includes(res.status) && new Date(res.checkOutDate) >= new Date()) && (
                    <>
                      {/* Botón Editar - solo para pendientes */}
                      <button
                        onClick={() => router.push(`/reservations/formulario?edit=${res._id || res.id}`)}
                        title="Editar reserva"
                        style={{
                          background: '#3182ce',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.5rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2c5aa0'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3182ce'}
                      >
                        <FaEdit size={16} />
                      </button>

                      {/* Botón Cancelar - solo si faltan más de 24 horas */}
                      {canCancelReservation(res.checkInDate) ? (
                        <button
                          onClick={() => handleAskDelete(res._id || res.id)}
                          title="Cancelar reserva"
                          style={{
                            background: '#e53e3e',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.5rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c53030'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#e53e3e'}
                        >
                          <FaTrash size={16} />
                        </button>
                      ) : (
                        <button
                          disabled
                          title="No se puede cancelar: faltan menos de 24 horas para el check-in"
                          style={{
                            background: '#9ca3af',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.5rem',
                            cursor: 'not-allowed',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0.6
                          }}
                        >
                          <FaTrash size={16} />
                        </button>
                      )}
                    </>
                  )}

                  {/* Reservas CONFIRMADAS: solo ver, sin editar ni cancelar */}
                  {(['CONFIRMED', 'confirmed'].includes(res.status) && new Date(res.checkOutDate) >= new Date()) && (
                    <span style={{
                      fontSize: '0.85rem',
                      color: '#6b7280',
                      fontStyle: 'italic',
                      padding: '0.25rem 0.5rem'
                    }}>
                      Solo lectura
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ConfirmDialog
        open={dialogOpen}
        title="Cancelar Reserva"
        message="¿Estás seguro de que deseas cancelar esta reserva? El estado de la reserva cambiará a 'Cancelada'."
        onCancel={() => setDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        confirmText="Sí, cancelar"
        cancelText="No, mantener"
      />
    </div>
  );
};

export default ReservationList; 