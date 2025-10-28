'use client';
import "../styles/Reservations.css";
import Link from "next/link";
import { useEffect, useState } from 'react';
import { roomCategoryService } from '../services';
import { useRouter } from 'next/navigation';


export default function ReservasPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
      try {
        // Cargar solo categorías
        const categoriesData = await roomCategoryService.getAllCategories();
        
        console.log('🏷️ Datos de categorías obtenidos:', categoriesData);
        
        const normalizedCategories = normalizeCategories(categoriesData);
        
        console.log('🏷️ Categorías normalizadas:', normalizedCategories);
        
        setCategories(normalizedCategories);
      } catch (error) {
        console.error('❌ Error al cargar categorías:', error);
        setCategories([]);
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
      <h2 style={{marginBottom:'1rem', marginTop:'0', color:'#1a365d', fontSize:'2rem', fontWeight:'600', textAlign:'center'}}>Categorías de Habitaciones</h2>
      <section className="reservas-grid">
        {loading ? (
          <div style={{textAlign:'center', gridColumn:'1/-1', padding:'1rem'}}>
            Cargando categorías...
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