'use client';

// Forzar renderizado dinámico (no SSR)
export const dynamic = 'force-dynamic';
import React, { useEffect, useState } from 'react';
import { userService } from '@services/userService';
import { reservationService } from '@services/reservationService';
import API from '@services/api';
import './profile.css';
import { useRouter } from 'next/navigation';
import ReservationList from '@components/ReservationList';
import ProtectedRoute from '@components/ProtectedRoute';
import GraphVisualization from '@components/GraphVisualization';
import { useToast } from '../../../hooks/useToast';
import ToastContainer from '../../../components/Toast/ToastContainer';

const UserProfilePage = () => {
  const [profile, setProfile] = useState<any>(null);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [graphRefreshKey, setGraphRefreshKey] = useState(0);
  const router = useRouter();
  const { toasts, success, error: showError, removeToast } = useToast();

  // Función helper para normalizar datos de reservaciones
  const normalizeReservations = (data: any): any[] => {
    console.log('🔧 Normalizando datos:', data);
    
    if (Array.isArray(data)) {
      console.log('✅ Es array directo');
      return data;
    } else if (data && data.data && Array.isArray(data.data)) {
      console.log('✅ Es objeto con propiedad data (array)');
      return data.data;
    } else if (data && Array.isArray(data.reservations)) {
      console.log('✅ Es objeto con propiedad reservations (array)');
      return data.reservations;
    } else {
      console.warn('⚠️ Formato de reservas no esperado:', data);
      console.warn('⚠️ Propiedades disponibles:', Object.keys(data || {}));
      return [];
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      // Limpiar estado previo
      setReservations([]);
      setProfile(null);
      setLoading(true);
      setError(null);
      try {
        console.log('🔍 Obteniendo perfil del usuario...');
        const userResponse = await userService.getProfile();
        console.log('✅ Perfil obtenido:', userResponse);
        
        // El backend devuelve { success: true, data: user }
        const user = userResponse.data || userResponse;
        console.log('👤 Datos del usuario extraídos:', {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role
        });
        
        setProfile(user);
        console.log('👤 Profile establecido:', {
          _id: user._id,
          id: user.id,
          email: user.email,
          _idString: user._id?.toString(),
          idString: user.id?.toString()
        });
        setForm({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phoneNumber: user.phoneNumber || '',
        });
        
        console.log('🔍 Obteniendo reservas del usuario...');
        console.log('🚀 LLAMANDO getUserReservations DIRECTAMENTE');
        const res = await reservationService.getUserReservations();
        console.log('✅ Reservas obtenidas:', res);
        console.log('📊 Tipo de respuesta:', typeof res);
        console.log('📊 Es array?', Array.isArray(res));
        console.log('📊 Estructura completa:', JSON.stringify(res, null, 2));
        
        const reservationsArray = normalizeReservations(res);
        console.log('📋 Array de reservas procesado:', reservationsArray);
        console.log('📋 Cantidad de reservas:', reservationsArray.length);
        
        // Debug de cada reserva
        reservationsArray.forEach((reservation, index) => {
          console.log(`📋 Reserva ${index}:`, {
            id: reservation._id || reservation.id,
            room: reservation.room,
            roomId: reservation.roomId,
            checkInDate: reservation.checkInDate,
            checkOutDate: reservation.checkOutDate,
            status: reservation.status,
            totalPrice: reservation.totalPrice
          });
          
          // Debug específico de la estructura
          console.log(`🔍 Estructura completa de reserva ${index}:`, reservation);
          console.log(`🏨 roomId.name:`, reservation.roomId?.name);
          console.log(`🏨 room.name:`, reservation.room?.name);
        });
        
        setReservations(reservationsArray);
        
        // 🕸️ SINCRONIZAR AUTOMÁTICAMENTE CON NEO4J después de cargar el perfil
        if (user && (user._id || user.id)) {
          try {
            const userId = user._id?.toString() || user.id?.toString();
            if (userId) {
              console.log('🕸️ Sincronizando automáticamente al cargar perfil:', userId);
              // Sincronizar en segundo plano sin bloquear la UI
              API.post(`/neo4j/sync/user-reservations/${userId}`).then(() => {
                console.log('✅ Usuario sincronizado automáticamente con Neo4j');
                // Refrescar el grafo después de sincronizar
                setGraphRefreshKey(prev => prev + 1);
              }).catch(err => {
                console.warn('⚠️ Error sincronizando al cargar perfil (no crítico):', err);
              });
            }
          } catch (syncErr) {
            console.warn('⚠️ Error en sincronización automática (no crítico):', syncErr);
          }
        }
      } catch (err: any) {
        console.error('❌ Error al cargar datos del perfil:', err);
        setError(`Error al cargar los datos del perfil: ${err.response?.data?.message || err.message || 'Error desconocido'}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Limpiar estado al desmontar el componente
  useEffect(() => {
    return () => {
      setReservations([]);
      setProfile(null);
      setLoading(false);
      setError(null);
    };
  }, []);

  // Eliminado useEffect que causaba bucles de re-render

  // Efecto para refrescar las reservas cuando se crea una nueva (optimizado)
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    
    const handleStorageChange = async () => {
      if (!isMounted) return;
      
      // Debounce para evitar llamadas múltiples
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        try {
          const res = await reservationService.getUserReservations();
          const reservationsArray = normalizeReservations(res);
          if (isMounted) {
            setReservations(reservationsArray);
          }
        } catch (err) {
          console.error('Error al actualizar reservas:', err);
        }
      }, 500);
    };

    // Solo escuchar cambios específicos
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'reservation_created' && e.newValue) {
        handleStorageChange();
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('reservationsUpdated', handleStorageChange);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('reservationsUpdated', handleStorageChange);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      console.log('💾 Guardando perfil:', form);
      const response = await userService.updateProfile(form);
      console.log('✅ Perfil actualizado:', response);
      
      // Actualizar el perfil local con los datos actualizados
      const updatedProfile = response.data || response;
      setProfile({ ...profile, ...updatedProfile });
      setForm({ ...form, ...updatedProfile });
      setEditMode(false);
      
      // 🕸️ SINCRONIZAR AUTOMÁTICAMENTE CON NEO4J después de actualizar
      try {
        const userId = updatedProfile._id?.toString() || profile._id?.toString() || profile.id?.toString();
        if (userId) {
          console.log('🕸️ Sincronizando usuario con Neo4j después de actualizar:', userId);
          await API.post(`/neo4j/sync/user-reservations/${userId}`);
          console.log('✅ Usuario sincronizado con Neo4j');
          // Refrescar el grafo
          setGraphRefreshKey(prev => prev + 1);
        }
      } catch (syncError: any) {
        console.warn('⚠️ Error sincronizando con Neo4j (no crítico):', syncError);
        // No mostrar error al usuario, solo loguear
      }
      
      // Mostrar mensaje de éxito
      success('Perfil actualizado exitosamente');
    } catch (err: any) {
      console.error('❌ Error al guardar perfil:', err);
      setError(`Error al guardar los cambios: ${err.response?.data?.message || err.message || 'Error desconocido'}`);
    } finally {
      setSaving(false);
    }
  };

  // Botón para actualizar reservas manualmente
  const handleRefreshReservations = async () => {
    setLoading(true);
    try {
      const res = await reservationService.getUserReservations();
      const reservationsArray = normalizeReservations(res);
      setReservations(reservationsArray);
    } catch (err: any) {
      setError('Error al actualizar las reservas.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReservation = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await reservationService.cancelReservation(id);
      console.log('✅ Reserva cancelada:', result);
      
      // Actualizar la lista de reservas localmente cambiando el status
      setReservations(reservations.map((r) => 
        r.id === id || r._id === id 
          ? { ...r, status: 'CANCELLED' }
          : r
      ));
      
      // Limpiar error si había uno previo
      setError(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al cancelar la reserva';
      console.error('❌ Error al cancelar reserva:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Asegurar que reservations sea un array antes de filtrar
  const reservationsArray = Array.isArray(reservations) ? reservations : [];
  
  const filtered = reservationsArray.filter((res) => {
    const roomMatch = res.room?.name.toLowerCase().includes(search.toLowerCase());
    const dateMatch = searchDate === '' || (res.checkInDate && res.checkOutDate &&
      res.checkInDate.slice(0, 10) <= searchDate && res.checkOutDate.slice(0, 10) >= searchDate);
    return roomMatch && dateMatch;
  });

  if (loading) return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'var(--color-bg)',
      fontFamily: 'var(--font-main)'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        background: 'var(--color-surface)',
        borderRadius: '12px',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid var(--color-border)',
          borderTop: '4px solid var(--color-primary-light)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem'
        }}></div>
        <p style={{ color: 'var(--color-text-light)', fontSize: '1.1rem' }}>Cargando perfil...</p>
      </div>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
  
  if (error) return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'var(--color-bg)',
      fontFamily: 'var(--font-main)'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        background: 'var(--color-surface)',
        borderRadius: '12px',
        boxShadow: 'var(--shadow-lg)',
        color: 'var(--color-danger)',
        fontSize: '1.1rem'
      }}>
        ❌ {error}
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      <div style={{width:'100vw',minHeight:'100vh',background:'var(--color-bg)',fontFamily:'var(--font-main)'}}>
        <div className="profile-container" style={{maxWidth:'1200px',margin:'40px auto',padding:'40px 32px',background:'var(--color-surface)',borderRadius:20,boxShadow:'var(--shadow-lg)'}}>
          <h2 className="profile-title" style={{fontSize:'2.3rem',marginBottom:32,color:'var(--color-primary-dark)',fontWeight:800,letterSpacing:'-1px'}}>Perfil de Usuario</h2>
          {editMode ? (
            <form onSubmit={handleSave} className="profile-form">
              <div className="form-group">
                <label>Nombre:</label>
                <input name="firstName" value={form.firstName} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Apellido:</label>
                <input name="lastName" value={form.lastName} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input name="email" value={form.email} onChange={handleChange} required type="email" />
              </div>
              <div className="form-group">
                <label>Teléfono:</label>
                <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} />
              </div>
              <div className="form-actions">
                <button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
                <button type="button" onClick={() => setEditMode(false)} disabled={saving}>Cancelar</button>
              </div>
            </form>
          ) : (
            <div className="profile-info" style={{marginBottom:32,background:'var(--color-surface)',padding:24,borderRadius:12,boxShadow:'var(--shadow-md)',border:'1px solid var(--color-border)'}}>
              <p style={{fontWeight:600,fontSize:'1.1rem',color:'var(--color-text)',marginBottom:12}}><b style={{color:'var(--color-primary-light)'}}>Nombre:</b> <span style={{color:'var(--color-text-light)'}}>{profile?.firstName}</span></p>
              <p style={{fontWeight:600,fontSize:'1.1rem',color:'var(--color-text)',marginBottom:12}}><b style={{color:'var(--color-primary-light)'}}>Apellido:</b> <span style={{color:'var(--color-text-light)'}}>{profile?.lastName}</span></p>
              <p style={{fontWeight:600,fontSize:'1.1rem',color:'var(--color-text)',marginBottom:12}}><b style={{color:'var(--color-primary-light)'}}>Email:</b> <span style={{color:'var(--color-text-light)'}}>{profile?.email}</span></p>
              <p style={{fontWeight:600,fontSize:'1.1rem',color:'var(--color-text)',marginBottom:12}}><b style={{color:'var(--color-primary-light)'}}>Teléfono:</b> <span style={{color:'var(--color-text-light)'}}>{profile?.phoneNumber || '-'}</span></p>
              <div style={{display:'flex',gap:'1rem',marginTop:18,flexWrap:'wrap'}}>
                <button className="edit-btn" onClick={() => setEditMode(true)} style={{background:'var(--color-accent)',color:'var(--color-surface)',fontWeight:700,fontSize:'1.1rem',padding:'10px 28px',border:'none',borderRadius:'8px',cursor:'pointer',transition:'background-color 0.2s'}} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-accent-dark)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--color-accent)'}>Editar perfil</button>
              </div>
            </div>
          )}
          <h3 className="profile-subtitle" style={{fontSize:'1.5rem',marginBottom:18,color:'var(--color-primary-dark)',fontWeight:700}}>Visualización de Relaciones</h3>
          <div style={{width:'100%',marginBottom:32,background:'var(--color-surface)',padding:24,borderRadius:12,boxShadow:'var(--shadow-md)',border:'1px solid var(--color-border)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16,gap:'1rem',flexWrap:'wrap'}}>
              <p style={{margin:0,color:'var(--color-text-light)',fontSize:'0.95rem',flex:1}}>
                Este grafo muestra tus relaciones con las reservaciones y habitaciones. 
                Los nodos azules representan usuarios, los verdes reservaciones y los amarillos habitaciones.
              </p>
              {profile && (
                <button
                  onClick={async (e) => {
                    try {
                      const userId = profile._id?.toString() || profile.id?.toString();
                      if (!userId) {
                        showError('No se pudo obtener el ID del usuario');
                        return;
                      }
                      
                      setSyncing(true);
                      const button = e.currentTarget;
                      button.disabled = true;
                      button.textContent = '⏳ Sincronizando...';
                      
                      const response = await API.post(`/neo4j/sync/user-reservations/${userId}`);
                      if (response.data.success) {
                        success('Reservaciones sincronizadas exitosamente', 3000);
                        // Recargar solo el grafo sin recargar toda la página
                        setGraphRefreshKey(prev => prev + 1);
                        setSyncing(false);
                        button.disabled = false;
                        button.textContent = '🔄 Sincronizar Reservaciones';
                      } else {
                        showError('Error al sincronizar: ' + (response.data.message || 'Error desconocido'));
                        setSyncing(false);
                        button.disabled = false;
                        button.textContent = '🔄 Sincronizar Reservaciones';
                      }
                    } catch (err: any) {
                      console.error('Error sincronizando:', err);
                      showError('Error al sincronizar reservaciones: ' + (err.response?.data?.message || err.message || 'Error desconocido'));
                      setSyncing(false);
                      const button = e.currentTarget;
                      button.disabled = false;
                      button.textContent = '🔄 Sincronizar Reservaciones';
                    }
                  }}
                  disabled={syncing}
                  style={{
                    background: 'var(--color-primary)',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseOver={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                    }
                  }}
                >
                  🔄 Sincronizar Reservaciones
                </button>
              )}
            </div>
            {profile && (
              <GraphVisualization 
                userId={profile._id?.toString() || profile.id?.toString() || (profile._id ? String(profile._id) : undefined)} 
                height="500px"
                showControls={true}
                refreshKey={graphRefreshKey}
              />
            )}
            {!profile && (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-light)' }}>
                Cargando información del usuario...
              </div>
            )}
          </div>
          <h3 className="profile-subtitle" style={{fontSize:'1.5rem',marginBottom:18,color:'var(--color-primary-dark)',fontWeight:700}}>Historial de Reservas</h3>
          <div style={{width:'100%',overflowX:'auto',marginBottom:24}}>
            <ReservationList reservas={reservations} loading={loading} onDelete={handleDeleteReservation} />
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ProtectedRoute>
  );
};

export default UserProfilePage; 