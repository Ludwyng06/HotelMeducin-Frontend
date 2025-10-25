'use client';

import { useRouter } from 'next/navigation';
import authService from '../../services/authService';

export default function TestAuthPage() {
  const router = useRouter();

  const handleCreateTestUser = () => {
    authService.createTestUser();
    alert('Usuario de prueba creado! Ahora puedes acceder a /user/profile');
    router.push('/user/profile');
  };

  const handleClearAuth = () => {
    authService.logout();
    alert('Autenticación eliminada');
    router.push('/');
  };

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '600px', 
      margin: '0 auto',
      textAlign: 'center'
    }}>
      <h1>Página de Prueba de Autenticación</h1>
      <p>Esta página es solo para pruebas. Te permite simular el login sin backend.</p>
      
      <div style={{ 
        marginTop: '2rem',
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center'
      }}>
        <button 
          onClick={handleCreateTestUser}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Crear Usuario de Prueba
        </button>

        <button 
          onClick={handleClearAuth}
          style={{
            padding: '10px 20px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Limpiar Autenticación
        </button>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <p><strong>Instrucciones:</strong></p>
        <ol style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
          <li>Haz clic en "Crear Usuario de Prueba"</li>
          <li>Serás redirigido automáticamente a /user/profile</li>
          <li>Si quieres probar el login nuevamente, usa "Limpiar Autenticación"</li>
        </ol>
      </div>
    </div>
  );
}
