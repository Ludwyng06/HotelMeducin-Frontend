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


  return (
    <main className="main-reservas">
      <section className="reservas-grid">
        <h2 style={{marginBottom:'1rem', gridColumn:'1/-1'}}>Categorías de Habitaciones</h2>
        {loading ? (
          <div style={{textAlign:'center', gridColumn:'1/-1', padding:'2rem'}}>
            Cargando categorías...
          </div>
        ) : categories.length > 0 ? (
          categories.map((category) => (
            <div key={category._id} className="reserva-card">
              <div className="category-icon" style={{fontSize:'3rem', textAlign:'center', marginBottom:'1rem'}}>
                {category.icon}
              </div>
              <div className="reserva-content">
                <h2>{category.name}</h2>
                <p className="reserva-desc">{category.description}</p>
                <div style={{marginBottom:'1rem'}}>
                  <p><strong>Capacidad:</strong> {category.maxCapacity} persona{category.maxCapacity > 1 ? 's' : ''}</p>
                  <p><strong>Precio base:</strong> ${category.basePrice}/noche</p>
                  <p><strong>Camas:</strong> {category.bedTypes.join(', ')}</p>
                </div>
                <div style={{marginBottom:'1rem'}}>
                  <p><strong>Incluye:</strong></p>
                  <ul style={{fontSize:'0.9rem', marginLeft:'1rem'}}>
                    {category.standardAmenities.slice(0, 3).map((amenity: any, index: number) => (
                      <li key={index}>{amenity}</li>
                    ))}
                    {category.standardAmenities.length > 3 && (
                      <li>+{category.standardAmenities.length - 3} más</li>
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
          <div style={{textAlign:'center', gridColumn:'1/-1', padding:'2rem', color:'#666'}}>
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