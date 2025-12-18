'use client';
import "@styles/Reservations.css";
import Link from "next/link";
import { useEffect, useState } from 'react';
import { roomCategoryService } from '@services/roomCategoryService';
import { useRouter } from 'next/navigation';


export default function ReservasPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();


  // Función helper para normalizar datos de categorías
  const normalizeCategories = (data: any): any[] => {
    if (Array.isArray(data)) {
      return data;
    } else if (data && data.data && Array.isArray(data.data)) {
      return data.data;
    } else if (data && Array.isArray(data.categories)) {
      return data.categories;
    } else {
      console.warn('⚠️ Formato de categorías no esperado:', data);
      return [];
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('📦 Cargando categorías...');
        
        const categoriesData = await roomCategoryService.getAllCategories();
        
        console.log('🏷️ Datos de categorías obtenidos (raw):', categoriesData);
        console.log('🏷️ Tipo de datos:', typeof categoriesData);
        console.log('🏷️ Es array?:', Array.isArray(categoriesData));
        
        const normalizedCategories = normalizeCategories(categoriesData);
        
        console.log('🏷️ Categorías normalizadas:', normalizedCategories);
        console.log('🏷️ Cantidad de categorías:', normalizedCategories.length);
        
        if (normalizedCategories.length === 0) {
          console.warn('⚠️ No se encontraron categorías después de normalizar');
          setError('No hay categorías disponibles en el sistema.');
        } else {
          console.log('✅ Categorías cargadas exitosamente:', normalizedCategories.length);
          setCategories(normalizedCategories);
        }
      } catch (error: any) {
        console.error('❌ Error al cargar categorías:', error);
        setCategories([]);
        
        // Mostrar mensaje de error más amigable y específico
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        
        // Determinar el tipo de error
        const isNetworkError = error?.isNetworkError || 
                              error?.code === 'ERR_NETWORK' || 
                              error?.code === 'ECONNREFUSED' ||
                              error?.code === 'ERR_INTERNET_DISCONNECTED' ||
                              error?.message?.includes('Network Error') ||
                              error?.message?.includes('Failed to fetch');
        
        const isTimeout = error?.name === 'AbortError' || 
                         error?.code === 'ECONNABORTED' ||
                         error?.message?.includes('timeout');
        
        if (isNetworkError) {
          if (error?.code === 'ECONNREFUSED') {
            setError(`No se pudo conectar con el backend en ${apiUrl}. El servidor no está corriendo o no está escuchando en ese puerto.`);
          } else {
            setError(`Error de conexión con el backend en ${apiUrl}. Verifica que el servidor esté corriendo y accesible.`);
          }
        } else if (isTimeout) {
          setError(`El backend no respondió a tiempo. Verifica que esté corriendo en ${apiUrl} y que no esté sobrecargado.`);
        } else if (error?.response?.status === 404) {
          setError('El endpoint de categorías no fue encontrado en el backend. Verifica la configuración del servidor.');
        } else if (error?.response?.status === 403 || error?.response?.status === 401) {
          setError('No tienes permisos para acceder a las categorías. Verifica tu sesión.');
        } else if (error?.response?.status === 500) {
          setError('Error interno del servidor. Por favor, contacta al administrador o revisa los logs del backend.');
        } else if (error?.response?.status) {
          const message = error.response.data?.message || error.response.data?.error || 'Error desconocido';
          setError(`Error ${error.response.status}: ${message}`);
        } else {
          setError(`Error al cargar las categorías: ${error?.message || 'Error desconocido'}. Por favor, intenta recargar la página.`);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);


  // Mapeo de categorías a imágenes
  const getCategoryImage = (categoryName: string) => {
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

  return (
    <main className="main-reservas">
      <h2 style={{marginBottom:'1rem', marginTop:'0', color:'var(--color-primary-dark)', fontSize:'2rem', fontWeight:'600', textAlign:'center'}}>Categorías de Habitaciones</h2>
      <section className="reservas-grid">
        {loading ? (
          <div style={{textAlign:'center', gridColumn:'1/-1', padding:'1rem'}}>
            Cargando categorías...
          </div>
        ) : error ? (
          <div style={{
            textAlign:'center', 
            gridColumn:'1/-1', 
            padding:'2rem',
            backgroundColor:'#fff3cd',
            borderRadius:'8px',
            border:'1px solid #ffc107',
            color:'#856404'
          }}>
            <h3 style={{marginBottom:'1rem', color:'#856404', fontSize:'1.5rem'}}>⚠️ Error de Conexión</h3>
            <p style={{marginBottom:'1rem', fontSize:'1rem'}}>{error}</p>
            <div style={{marginBottom:'1rem', fontSize:'0.9rem', color:'#856404'}}>
              <p><strong>Pasos para solucionar:</strong></p>
              <ol style={{textAlign:'left', display:'inline-block', marginTop:'0.5rem'}}>
                <li>Verifica que el backend esté corriendo en <code style={{backgroundColor:'#fff', padding:'2px 6px', borderRadius:'3px'}}>http://localhost:3000</code></li>
                <li>Abre la consola del navegador (F12) para ver más detalles</li>
                <li>Intenta acceder directamente a <code style={{backgroundColor:'#fff', padding:'2px 6px', borderRadius:'3px'}}>http://localhost:3000/health</code></li>
              </ol>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              style={{
                padding:'0.75rem 1.5rem',
                backgroundColor:'#1a365d',
                color:'white',
                border:'none',
                borderRadius:'4px',
                cursor:'pointer',
                fontSize:'1rem',
                fontWeight:'600',
                transition:'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2c5282'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1a365d'}
            >
              🔄 Reintentar
            </button>
          </div>
        ) : categories.length > 0 ? (
          categories.map((category) => (
            <div key={category._id} className="reserva-card">
              <div className="category-image" style={{
                width: '100%',
                height: '250px',
                backgroundImage: `url(${getCategoryImage(category.name)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '8px',
                marginBottom: '0.8rem',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  padding: '0.5rem',
                  borderRadius: '20px',
                  fontSize: '1.5rem'
                }}>
                  {category.icon}
                </div>
              </div>
              <div className="reserva-content">
                <h2>{category.name}</h2>
                <p className="reserva-desc">{category.description}</p>
                <div style={{marginBottom:'0.8rem'}}>
                  <p style={{margin:'0.3rem 0', fontSize:'0.85rem'}}><strong>Capacidad:</strong> {category.maxCapacity} persona{category.maxCapacity > 1 ? 's' : ''}</p>
                  <p style={{margin:'0.3rem 0', fontSize:'0.85rem'}}><strong>Precio base:</strong> ${category.basePrice}/noche</p>
                  <p style={{margin:'0.3rem 0', fontSize:'0.85rem'}}><strong>Camas:</strong> {category.bedTypes.join(', ')}</p>
                </div>
                <div style={{marginBottom:'0.8rem'}}>
                  <p style={{margin:'0.3rem 0', fontSize:'0.85rem'}}><strong>Incluye:</strong></p>
                  <ul style={{fontSize:'0.8rem', marginLeft:'1rem', marginTop:'0.3rem'}}>
                    {category.standardAmenities.slice(0, 3).map((amenity: any, index: number) => (
                      <li key={index} style={{margin:'0.2rem 0'}}>{amenity}</li>
                    ))}
                    {category.standardAmenities.length > 3 && (
                      <li style={{margin:'0.2rem 0'}}>+{category.standardAmenities.length - 3} más</li>
                    )}
                  </ul>
                </div>
                <button 
                  onClick={() => router.push(`/reservations/formulario?tipo=${category._id}`)} 
                  className="btn-reserva"
                >
                  Ver Habitaciones Disponibles
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={{textAlign:'center', gridColumn:'1/-1', padding:'1rem', color:'#666'}}>
            No hay categorías disponibles
          </div>
        )}
      </section>

      <section className="reserva-beneficios">
        <h2>Beneficios exclusivos</h2>
        <div className="beneficios-grid">
          <div className="beneficio-card">
            <h3>Cancelación gratuita</h3>
            <p>Cambios o cancelaciones sin costo hasta 48 horas antes.</p>
          </div>
          <div className="beneficio-card">
            <h3>Desayuno incluido</h3>
            <p>Buffet gourmet todas las mañanas para nuestros huéspedes.</p>
          </div>
          <div className="beneficio-card">
            <h3>Upgrade gratuito</h3>
            <p>Sujeto a disponibilidad al momento del check-in.</p>
          </div>
        </div>
      </section>
    </main>
  );
}