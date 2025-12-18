'use client';

// Forzar renderizado dinámico (no SSR)
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@context/AuthContext';
import '@styles/Login.css';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Procesando autenticación con Google...');
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    // Evitar procesar múltiples veces
    if (hasProcessed) return;

    const handleCallback = async () => {
      try {
        const token = searchParams.get('token');
        const userParam = searchParams.get('user');

        if (!token) {
          const error = searchParams.get('error');
          if (error) {
            setStatus('error');
            setMessage('Error al autenticar con Google. Por favor, intenta de nuevo.');
            setHasProcessed(true);
            setTimeout(() => {
              router.push('/login');
            }, 3000);
            return;
          }
          throw new Error('No se recibió el token de autenticación');
        }

        // Marcar como procesado inmediatamente para evitar bucles
        setHasProcessed(true);

          // Guardar token y usuario
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
            
            if (userParam) {
              try {
                const user = JSON.parse(decodeURIComponent(userParam));
                localStorage.setItem('user', JSON.stringify(user));
                sessionStorage.setItem('auth_user', JSON.stringify(user));
                
                // OPTIMIZACIÓN: Ya tenemos el usuario completo del callback
                // No necesitamos refrescar - el AuthContext detectará el token automáticamente
                // Eliminar refreshUser() ahorra una llamada HTTP innecesaria (~50-100ms)
              } catch (e) {
                console.warn('No se pudo parsear el usuario, se obtendrá del servidor');
              }
            }

            // OPTIMIZACIÓN: Eliminar refreshUser() - ya tenemos todos los datos
            // El AuthContext manejará la autenticación cuando detecte el token
            // Esto ahorra una llamada HTTP adicional y mejora la velocidad
          }

          setStatus('success');
          setMessage('¡Autenticación exitosa! Redirigiendo...');

          // OPTIMIZACIÓN: Redirigir más rápido y usar replace para no guardar en historial
          setTimeout(() => {
            router.replace('/'); // replace en lugar de push para no guardar en historial
          }, 200); // Reducido de 500ms a 200ms para mejor UX
      } catch (error: any) {
        console.error('Error en callback de Google:', error);
        setStatus('error');
        setMessage(error.message || 'Error al procesar la autenticación con Google');
        setHasProcessed(true);
        
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    };

    handleCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div className="login-container">
      <div className="login-overlay"></div>
      <div className="login-card">
        {status === 'loading' && (
          <div className="success-message">
            <div className="success-icon" style={{ background: 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeDasharray="62.83" strokeDashoffset="62.83">
                  <animate attributeName="stroke-dashoffset" dur="1.5s" values="62.83;0" fill="freeze" />
                </circle>
              </svg>
            </div>
            <h2 className="success-title" style={{ color: '#4285F4' }}>Autenticando con Google</h2>
            <p className="success-text">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="success-message">
            <div className="success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="success-title">¡Autenticación exitosa!</h2>
            <p className="success-text">{message}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="success-message">
            <div className="success-icon" style={{ background: 'linear-gradient(135deg, #EA4335 0%, #DC2626 100%)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="success-title" style={{ color: '#EA4335' }}>Error de autenticación</h2>
            <p className="success-text">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}

