'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ReservationSimpleForm from '../../components/ReservationSimpleForm';
import { roomService, roomCategoryService } from '../../services';

function ReservationFormContent() {
  const searchParams = useSearchParams();
  const tipoParam = searchParams.get('tipo');
  
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [rooms, setRooms] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Función helper para normalizar datos de habitaciones
  const normalizeRooms = (data: any): any[] => {
    if (Array.isArray(data)) {
      return data;
    } else if (data && data.data && Array.isArray(data.data)) {
      return data.data;
    } else if (data && Array.isArray(data.rooms)) {
      return data.rooms;
    } else {
      console.warn('⚠️ Formato de habitaciones no esperado:', data);
      return [];
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      
      try {
        if (tipoParam) {
          // Si hay un tipo específico, cargar solo habitaciones de esa categoría
          console.log('🎯 Cargando habitaciones para categoría:', tipoParam);
          const roomsData = await roomService.getRoomsByCategory(tipoParam);
          const normalizedRooms = normalizeRooms(roomsData);
          
          console.log('🏨 Habitaciones de categoría:', normalizedRooms);
          setRooms(normalizedRooms);
          
          // Seleccionar automáticamente la primera habitación disponible
          if (normalizedRooms.length > 0) {
            const firstAvailableRoom = normalizedRooms.find(room => room.isAvailable && !room.isMaintenance);
            if (firstAvailableRoom) {
              console.log('🎯 Seleccionando primera habitación disponible:', firstAvailableRoom._id);
              setSelectedRoomId(firstAvailableRoom._id);
            }
          }
        } else {
          // Si no hay tipo específico, cargar todas las habitaciones
          console.log('🔍 Cargando todas las habitaciones...');
          const roomsData = await roomService.getAllRooms();
          const normalizedRooms = normalizeRooms(roomsData);
          
          console.log('🏨 Todas las habitaciones:', normalizedRooms);
          setRooms(normalizedRooms);
        }
      } catch (error) {
        console.error('❌ Error al cargar datos:', error);
        setError('No se pudieron cargar las habitaciones');
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [tipoParam]);

  return (
    <div style={{ padding: '2rem' }}>
      {loading ? (
        <div style={{ textAlign: 'center', margin: 40 }}>Cargando habitaciones...</div>
      ) : error ? (
        <div style={{ color: 'red', textAlign: 'center', margin: 40 }}>{error}</div>
      ) : (
        <>
          {tipoParam && selectedRoomId && (
            <div style={{ 
              background: '#e6f3ff', 
              border: '1px solid #3182ce', 
              borderRadius: '8px', 
              padding: '16px', 
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              <h3 style={{ color: '#2c5282', margin: '0 0 8px 0' }}>
                🎯 Habitación Preseleccionada
              </h3>
              <p style={{ color: '#4a5568', margin: 0 }}>
                Has seleccionado una habitación específica. Puedes cambiar de habitación si lo deseas.
              </p>
            </div>
          )}
        <div
          className="reservas-grid"
          style={{
            display: 'flex',
            gap: 24,
            marginBottom: 32,
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'flex-start',
          }}
        >
          {Array.isArray(rooms) ? rooms.map((habitacion) => {
            let imageUrl = '/images/habitacion-estandar.jpg';
            if (Array.isArray(habitacion.imageUrls)) {
              imageUrl = habitacion.imageUrls[0] || imageUrl;
            } else if (typeof habitacion.imageUrls === 'string' && habitacion.imageUrls.startsWith('[')) {
              try {
                const arr = JSON.parse(habitacion.imageUrls);
                if (Array.isArray(arr) && arr.length > 0) imageUrl = arr[0];
              } catch {}
            }
            const isAvailable = habitacion.isAvailable && !habitacion.isMaintenance;
            const isSelected = selectedRoomId === habitacion._id;
            
            return (
              <div
                key={habitacion._id}
                className="reserva-card"
                style={{ 
                  border: isSelected ? '3px solid #007bff' : isAvailable ? '1px solid #ddd' : '1px solid #ff6b6b',
                  borderRadius: 8, 
                  cursor: isAvailable ? 'pointer' : 'not-allowed',
                  width: 320,
                  opacity: isAvailable ? 1 : 0.6,
                  transition: 'all 0.3s ease',
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                  boxShadow: isSelected ? '0 8px 25px rgba(0,123,255,0.3)' : '0 4px 15px rgba(0,0,0,0.1)',
                }}
                onClick={() => isAvailable && setSelectedRoomId(habitacion._id)}
              >
                <img
                  src={imageUrl}
                  alt={habitacion.name}
                  className="reserva-img"
                  style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: '8px 8px 0 0' }}
                />
                <div className="reserva-content" style={{ padding: 16 }}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem'}}>
                    <h2 style={{ fontSize: 20, marginBottom: 8 }}>{habitacion.name}</h2>
                    <span style={{
                      background: isAvailable ? '#28a745' : '#dc3545',
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold'
                    }}>
                      {isAvailable ? 'Disponible' : habitacion.isMaintenance ? 'Mantenimiento' : 'No disponible'}
                    </span>
                  </div>
                  
                  <p className="reserva-desc" style={{ fontSize: 15, marginBottom: 8 }}>{habitacion.description}</p>
                  
                  <div style={{marginBottom:'1rem'}}>
                    <p className="reserva-precio" style={{ fontWeight: 600, fontSize: '1.2rem', color: '#007bff' }}>
                      ${habitacion.price}/noche
                    </p>
                    <p style={{fontSize: '0.9rem', margin: '0.25rem 0'}}><strong>Habitación:</strong> {habitacion.roomNumber}</p>
                    <p style={{fontSize: '0.9rem', margin: '0.25rem 0'}}><strong>Piso:</strong> {habitacion.floor}</p>
                    <p style={{fontSize: '0.9rem', margin: '0.25rem 0'}}><strong>Vista:</strong> {habitacion.view || 'No especificada'}</p>
                    <p style={{fontSize: '0.9rem', margin: '0.25rem 0'}}><strong>Capacidad:</strong> {habitacion.capacity} persona{habitacion.capacity > 1 ? 's' : ''}</p>
                    <p style={{fontSize: '0.9rem', margin: '0.25rem 0'}}><strong>Cama:</strong> {habitacion.bedType}</p>
                  </div>
                  
                  {habitacion.amenities && habitacion.amenities.length > 0 && (
                    <div style={{marginBottom:'1rem'}}>
                      <p style={{fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.5rem'}}>Incluye:</p>
                      <div style={{display:'flex', flexWrap:'wrap', gap:'0.25rem'}}>
                        {habitacion.amenities.slice(0, 3).map((amenity: any, index: number) => (
                          <span key={index} style={{
                            background:'#f8f9fa',
                            padding:'0.2rem 0.4rem',
                            borderRadius:'3px',
                            fontSize:'0.75rem',
                            border:'1px solid #dee2e6'
                          }}>
                            {amenity}
                          </span>
                        ))}
                        {habitacion.amenities.length > 3 && (
                          <span style={{
                            background:'#e9ecef',
                            padding:'0.2rem 0.4rem',
                            borderRadius:'3px',
                            fontSize:'0.75rem',
                            color:'#6c757d'
                          }}>
                            +{habitacion.amenities.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {isSelected && (
                    <div style={{ 
                      color: '#007bff', 
                      fontWeight: 'bold', 
                      marginTop: 8,
                      textAlign: 'center',
                      background: '#e3f2fd',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.9rem'
                    }}>
                      ✓ Habitación Seleccionada
                    </div>
                  )}
                </div>
              </div>
            );
          }) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
              No hay habitaciones disponibles
            </div>
          )}
        </div>
        </>
      )}
      <ReservationSimpleForm roomId={selectedRoomId} rooms={rooms} />
    </div>
  );
}

export default function ReservationFormPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ReservationFormContent />
    </Suspense>
  );
} 