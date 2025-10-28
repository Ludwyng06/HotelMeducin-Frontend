'use client';
import React, { useEffect, useState } from 'react';
import { userService } from '../../services/userService';
import { reservationService } from '../../services/reservationService';
import './profile.css';
import { useRouter } from 'next/navigation';
import ReservationList from '../../components/ReservationList';
import ProtectedRoute from '../../components/ProtectedRoute';

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
  const router = useRouter();

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
      
      // Mostrar mensaje de éxito
      alert('Perfil actualizado exitosamente');
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
    try {
      await reservationService.cancelReservation(id);
      setReservations(reservations.filter((r) => r.id !== id));
    } catch (err) {
      setError('Error al eliminar la reserva.');
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
      background: '#f5f7fa',
      fontFamily: "'Inter','Segoe UI',sans-serif"
    }}>
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e2e8f0',
          borderTop: '4px solid #3182ce',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem'
        }}></div>
        <p style={{ color: '#4a5568', fontSize: '1.1rem' }}>Cargando perfil...</p>
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
      background: '#f5f7fa',
      fontFamily: "'Inter','Segoe UI',sans-serif"
    }}>
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        color: '#e53e3e',
        fontSize: '1.1rem'
      }}>
        ❌ {error}
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      <div style={{width:'100vw',minHeight:'100vh',background:'#f5f7fa',fontFamily:"'Inter','Segoe UI',sans-serif"}}>
        <div className="profile-container" style={{maxWidth:'1200px',margin:'40px auto',padding:'40px 32px',background:'#fff',borderRadius:20,boxShadow:'0 2px 24px rgba(44,82,130,0.10)'}}>
          <h2 className="profile-title" style={{fontSize:'2.3rem',marginBottom:32,color:'#1a365d',fontWeight:800,letterSpacing:'-1px'}}>Perfil de Usuario</h2>
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
            <div className="profile-info" style={{marginBottom:32,background:'#f7fafc',padding:24,borderRadius:12,boxShadow:'0 1px 6px rgba(44,82,130,0.04)'}}>
              <p style={{fontWeight:600,fontSize:'1.1rem',color:'#2c5282',marginBottom:8}}><b>Nombre:</b> {profile?.firstName}</p>
              <p style={{fontWeight:600,fontSize:'1.1rem',color:'#2c5282',marginBottom:8}}><b>Apellido:</b> {profile?.lastName}</p>
              <p style={{fontWeight:600,fontSize:'1.1rem',color:'#2c5282',marginBottom:8}}><b>Email:</b> {profile?.email}</p>
              <p style={{fontWeight:600,fontSize:'1.1rem',color:'#2c5282',marginBottom:8}}><b>Teléfono:</b> {profile?.phoneNumber || '-'}</p>
              <button className="edit-btn" onClick={() => setEditMode(true)} style={{marginTop:18,background:'#38a169',fontWeight:700,fontSize:'1.1rem',padding:'10px 28px'}}>Editar perfil</button>
            </div>
          )}
          <h3 className="profile-subtitle" style={{fontSize:'1.5rem',marginBottom:18,color:'#2c5282',fontWeight:700}}>Historial de Reservas</h3>
          <div style={{width:'100%',overflowX:'auto',marginBottom:24}}>
            <ReservationList reservas={reservations} loading={loading} onDelete={handleDeleteReservation} />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default UserProfilePage; 