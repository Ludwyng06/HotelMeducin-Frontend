'use client';
import Link from "next/link";
import "@styles/Login.css";
import { useState, useEffect } from "react";
import { useAuth } from "@context/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isRedirectingToGoogle, setIsRedirectingToGoogle] = useState(false);
  const { login, isLoading } = useAuth();
  const router = useRouter();

  // Limpiar estado al montar el componente
  useEffect(() => {
    setEmail("");
    setPassword("");
    setError("");
    
    // Verificar si hay un error en la URL (por ejemplo, de OAuth)
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get('error');
    
    if (errorParam === 'google_oauth_not_configured') {
      setError('Google OAuth no está configurado en el servidor. Por favor, use el método de inicio de sesión tradicional.');
    } else if (errorParam === 'google_auth_failed') {
      setError('Error al autenticar con Google. Por favor, intente de nuevo o use el método de inicio de sesión tradicional.');
    }
    
    // Limpiar el parámetro de error de la URL
    if (errorParam) {
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setShowSuccess(false);
    
    try {
      await login(email, password);
      
      // Mostrar mensaje de éxito
      setShowSuccess(true);
      
      // Esperar 1.5 segundos para mostrar el mensaje de éxito
      setTimeout(() => {
        setIsRedirecting(true);
        
        // Esperar 300ms para la animación de fade-out antes de redirigir
        setTimeout(() => {
          // Redirección inteligente según parámetro 'redirect'
          const params = new URLSearchParams(window.location.search);
          const redirect = params.get("redirect");
          
          // Si hay un redirect específico y no es el perfil, redirigir ahí
          if (redirect && !redirect.includes('user/profile')) {
            router.push("/" + redirect.replace(/^\//, ""));
          } else {
            // Por defecto, siempre ir al home después del login
            router.push("/");
          }
        }, 300);
      }, 1500);
    } catch (err: any) {
      // Mostrar mensaje de error más específico
      if (err?.message?.includes('No se pudo conectar') || err?.code === 'ERR_NETWORK' || err?.code === 'ECONNREFUSED') {
        setError('No se pudo conectar con el servidor. Verifica que el backend esté corriendo en http://localhost:3000');
      } else if (err?.response?.status === 401) {
        setError('Credenciales incorrectas. Verifica tu email y contraseña.');
      } else if (err?.response?.status === 404) {
        setError('El endpoint de autenticación no fue encontrado. Verifica la configuración del backend.');
      } else {
        setError(err?.message || err?.response?.data?.message || "Error al iniciar sesión. Verifica tus credenciales.");
      }
    }
  };

  const handleGoogleLogin = (e?: React.MouseEvent) => {
    // Prevenir cualquier comportamiento por defecto
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Mostrar estado de carga inmediatamente para mejor UX
    setIsRedirectingToGoogle(true);
    
    // FORZAR HTTP explícitamente - NO usar variables de entorno
    // Esto previene cualquier problema de caché o configuración
    const backendUrl = 'http://localhost:3000';
    let googleAuthUrl = `${backendUrl}/auth/google`;
    
    // Logs para debugging
    console.log('🔐 [Google Login] Iniciando redirección...');
    console.log('🔐 [Google Login] URL construida:', googleAuthUrl);
    console.log('🔍 [Google Login] Verificando que sea HTTP...');
    
    // Validación y corrección agresiva: asegurar que nunca sea HTTPS
    if (googleAuthUrl.includes('https://')) {
      console.error('❌ ERROR: Detectado HTTPS en URL, corrigiendo...');
      googleAuthUrl = googleAuthUrl.replace('https://', 'http://');
    }
    if (googleAuthUrl.includes(':3443')) {
      console.error('❌ ERROR: Detectado puerto 3443, corrigiendo...');
      googleAuthUrl = googleAuthUrl.replace(':3443', ':3000');
    }
    
    // Validación final
    if (!googleAuthUrl.startsWith('http://localhost:3000')) {
      console.error('❌ ERROR: URL no válida, forzando corrección...');
      googleAuthUrl = 'http://localhost:3000/auth/google';
    }
    
    console.log('✅ [Google Login] URL final:', googleAuthUrl);
    console.log('✅ [Google Login] Redirigiendo ahora...');
    
    // Pequeño delay para mostrar el estado de carga antes de redirigir
    // Esto mejora la percepción del usuario de que algo está pasando
    setTimeout(() => {
      // Usar replace en lugar de href para evitar que el navegador guarde en historial
      // Esto también puede ayudar a evitar problemas de caché
      window.location.replace(googleAuthUrl);
    }, 100);
  };

  return (
    <div className={`login-container ${isRedirecting ? 'fade-out' : ''}`}>
      <div className="login-overlay"></div>
      {/* Botón para cerrar y volver al inicio */}
      <Link href="/" className="close-button">✖</Link>
      <div className="login-card">
        {isRedirectingToGoogle ? (
          <div className="success-message">
            <div className="success-icon" style={{ background: 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeDasharray="62.83" strokeDashoffset="62.83">
                  <animate attributeName="stroke-dashoffset" dur="1.5s" values="62.83;0" fill="freeze" />
                </circle>
              </svg>
            </div>
            <h2 className="success-title" style={{ color: '#4285F4' }}>Redirigiendo a Google</h2>
            <p className="success-text">Por favor, espera mientras te redirigimos a la página de autenticación de Google...</p>
            <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#6b7280' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  background: '#4285F4',
                  animation: 'pulse 1.5s ease-in-out infinite'
                }}></div>
                <span>Esto puede tomar unos segundos</span>
              </div>
            </div>
          </div>
        ) : showSuccess ? (
          <div className="success-message">
            <div className="success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="success-title">¡Inicio de sesión exitoso!</h2>
            <p className="success-text">Redirigiendo...</p>
          </div>
        ) : (
          <>
            <h1 className="login-title">Iniciar Sesión</h1>
            <p className="login-subtitle">Bienvenido a Hotel Meducin</p>
            {error && <div className="login-error">{error}</div>}
            <form className="login-form" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Correo electrónico"
                className="login-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
              <input
                type="password"
                placeholder="Contraseña"
                className="login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <button 
                type="submit" 
                className="login-button" 
                disabled={isLoading}
              >
                {isLoading ? "Procesando..." : "Entrar"}
              </button>
            </form>
            
            {/* Divider */}
            <div className="login-divider">
              <span>o</span>
            </div>
            
            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleGoogleLogin(e);
              }}
              className="google-login-button"
              disabled={isLoading || isRedirectingToGoogle}
              style={{
                opacity: isRedirectingToGoogle ? 0.7 : 1,
                cursor: isRedirectingToGoogle ? 'wait' : 'pointer',
                position: 'relative'
              }}
            >
              {isRedirectingToGoogle ? (
                <>
                  <div style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '20px',
                    height: '20px',
                    border: '2px solid #4285F4',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }}></div>
                  <span style={{ opacity: 0 }}>Continuar con Google</span>
                </>
              ) : (
                <>
                  <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continuar con Google
                </>
              )}
            </button>
            
            <p className="login-footer">
              ¿No tiene una cuenta? <Link href="/register">Regístrese</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
