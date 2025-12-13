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
  const { login, isLoading } = useAuth();
  const router = useRouter();

  // Limpiar estado al montar el componente
  useEffect(() => {
    setEmail("");
    setPassword("");
    setError("");
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
      setError(err.message || "Error al iniciar sesión. Verifica tus credenciales.");
    }
  };

  return (
    <div className={`login-container ${isRedirecting ? 'fade-out' : ''}`}>
      <div className="login-overlay"></div>
      {/* Botón para cerrar y volver al inicio */}
      <Link href="/" className="close-button">✖</Link>
      <div className="login-card">
        {showSuccess ? (
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
            <p className="login-footer">
              ¿No tiene una cuenta? <Link href="/register">Regístrese</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
