'use client';

import { useState } from 'react';

export default function AdminToolsPage() {
  const [reservations, setReservations] = useState<any[]>([]);

  const loadReservations = () => {
    const userReservations = JSON.parse(localStorage.getItem('userReservations') || '[]');
    setReservations(userReservations);
  };

  const clearReservations = () => {
    localStorage.removeItem('userReservations');
    setReservations([]);
    window.dispatchEvent(new CustomEvent('reservationsUpdated'));
    alert('Reservas eliminadas');
  };

  const clearAllData = () => {
    localStorage.clear();
    sessionStorage.clear();
    setReservations([]);
    alert('Todos los datos eliminados. Recarga la página.');
  };

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '800px', 
      margin: '0 auto'
    }}>
      <h1>Herramientas de Administración</h1>
      <p>Panel de control para gestionar datos de prueba</p>
      
      <div style={{ 
        marginTop: '2rem',
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        <button 
          onClick={loadReservations}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Ver Reservas Guardadas
        </button>

        <button 
          onClick={clearReservations}
          style={{
            padding: '10px 20px',
            backgroundColor: '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Limpiar Reservas
        </button>

        <button 
          onClick={clearAllData}
          style={{
            padding: '10px 20px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Limpiar Todos los Datos
        </button>
      </div>

      {reservations.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Reservas Guardadas ({reservations.length})</h3>
          <div style={{ 
            background: '#f5f5f5', 
            padding: '1rem', 
            borderRadius: '5px',
            maxHeight: '300px',
            overflow: 'auto'
          }}>
            <pre>{JSON.stringify(reservations, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
