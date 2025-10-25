'use client';
import Link from "next/link";
import "../styles/Login.css";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  // Prueba de Sentry en Login
  if (typeof window !== "undefined" && window.location.search.includes("sentryTest=login")) {
    throw new Error("Prueba de error Sentry en Login");
  }

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
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
    
    try {
      await login(email, password);
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
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión. Verifica tus credenciales.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-overlay"></div>
      {/* Botón para cerrar y volver al inicio */}
      <Link href="/" className="close-button">✖</Link>
      <div className="login-card">
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
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
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
      </div>
    </div>
  );
}
