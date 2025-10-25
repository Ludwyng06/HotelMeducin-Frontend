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

  // Prueba de Sentry en Lista de Reservas
  if (typeof window !== "undefined" && window.location.search.includes("sentryTest=reservas")) {
    throw new Error("Prueba de error Sentry en Lista de Reservas");
  }

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
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1rem'
          }}
        />
        <input
          type="date"
          value={searchDate}
          onChange={e => setSearchDate(e.target.value)}
          style={{
            padding: '0.5rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1rem'
          }}
        />
      </div>
      <div style={{
        width: '100%',
        overflowX: 'auto',
        border: '1px solid #e2e8f0',
        borderRadius: '8px'
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          backgroundColor: 'white'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f7fafc' }}>
              <th style={{
                padding: '1rem',
                textAlign: 'left',
                fontWeight: '600',
                color: '#2d3748',
                borderBottom: '2px solid #e2e8f0'
              }}>Habitación</th>
              <th style={{
                padding: '1rem',
                textAlign: 'left',
                fontWeight: '600',
                color: '#2d3748',
                borderBottom: '2px solid #e2e8f0'
              }}>Check-in</th>
              <th style={{
                padding: '1rem',
                textAlign: 'left',
                fontWeight: '600',
                color: '#2d3748',
                borderBottom: '2px solid #e2e8f0'
              }}>Check-out</th>
              <th style={{
                padding: '1rem',
                textAlign: 'left',
                fontWeight: '600',
                color: '#2d3748',
                borderBottom: '2px solid #e2e8f0'
              }}>Estado</th>
              <th style={{
                padding: '1rem',
                textAlign: 'left',
                fontWeight: '600',
                color: '#2d3748',
                borderBottom: '2px solid #e2e8f0'
              }}>Total</th>
              <th style={{
                padding: '1rem',
                textAlign: 'left',
                fontWeight: '600',
                color: '#2d3748',
                borderBottom: '2px solid #e2e8f0'
              }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: '#666',
                  fontStyle: 'italic'
                }}>Cargando...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: '#666',
                  fontStyle: 'italic'
                }}>No hay reservas.</td>
              </tr>
            ) : filtered.map((res, idx) => (
              <tr key={res._id || res.id} style={{
                backgroundColor: idx % 2 === 0 ? '#f8f9fa' : 'white',
                borderBottom: '1px solid #e2e8f0'
              }}>
                <td style={{
                  padding: '1rem',
                  color: '#2d3748',
                  fontWeight: '500'
                }}>{res.room?.name || res.roomId?.name || 'Habitación'}</td>
                <td style={{
                  padding: '1rem',
                  color: '#4a5568'
                }}>{res.checkInDate?.slice(0,10) || '-'}</td>
                <td style={{
                  padding: '1rem',
                  color: '#4a5568'
                }}>{res.checkOutDate?.slice(0,10) || '-'}</td>
                <td style={{ padding: '1rem' }}>
                  {res.status === 'COMPLETED' && (
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      backgroundColor: '#c6f6d5',
                      color: '#22543d'
                    }}>Finalizada</span>
                  )}
                  {res.status === 'EXPIRED' && (
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      backgroundColor: '#fed7d7',
                      color: '#c53030'
                    }}>Caducada</span>
                  )}
                  {res.status === 'CANCELLED' && (
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      backgroundColor: '#fed7d7',
                      color: '#c53030'
                    }}>Cancelada</span>
                  )}
                  {res.status === 'PENDING' && (
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      backgroundColor: '#fef5e7',
                      color: '#c05621'
                    }}>Pendiente</span>
                  )}
                  {res.status === 'CONFIRMED' && (
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      backgroundColor: '#bee3f8',
                      color: '#2b6cb0'
                    }}>Activa</span>
                  )}
                  {res.status === 'pending' && (
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      backgroundColor: '#fef5e7',
                      color: '#c05621'
                    }}>Pendiente</span>
                  )}
                  {res.status === 'confirmed' && (
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      backgroundColor: '#bee3f8',
                      color: '#2b6cb0'
                    }}>Activa</span>
                  )}
                </td>
                <td style={{
                  padding: '1rem',
                  color: '#2d3748',
                  fontWeight: '600'
                }}>${res.totalPrice}</td>
                <td style={{
                  padding: '1rem',
                  display: 'flex',
                  gap: '0.5rem',
                  alignItems: 'center'
                }}>
                  {(['PENDING','CONFIRMED','pending','confirmed'].includes(res.status) && new Date(res.checkOutDate) >= new Date()) && (
                    <>
                      <button
                        onClick={() => router.push(`/reservations/formulario?edit=${res._id || res.id}`)}
                        title="Editar"
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
                      <button
                        onClick={() => handleAskDelete(res._id || res.id)}
                        title="Eliminar"
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
                    </>
                  )}
                  <button
                    onClick={() => router.push(`/reservations/confirmacion?id=${res._id || res.id}`)}
                    title="Ver"
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ConfirmDialog
        open={dialogOpen}
        title="Eliminar Reserva"
        message="¿Estás seguro? Esta acción no se puede deshacer."
        onCancel={() => setDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default ReservationList; 