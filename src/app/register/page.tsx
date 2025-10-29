'use client';
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@context/AuthContext";
import { useRouter } from "next/navigation";
import "@styles/Register.css";

export default function RegisterPage() {

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });
  const [error, setError] = useState("");
  const auth = useAuth();
  console.log('useAuth() en RegisterPage:', auth);
  const { register, isLoading } = auth;
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
      });
      router.push("/login"); // Redirigir al login después del registro exitoso
    } catch (err: any) {
      setError(err.message || "Error al registrar usuario");
    }
  };

  return (
    <div className="register-container">
      <div className="register-overlay"></div>
      {/* Botón para cerrar y volver al inicio */}
      <Link href="/" className="close-button">✖</Link>
      <div className="register-card">
        <h1 className="register-title">Registro</h1>
        <p className="register-subtitle">Crea tu cuenta en Hotel Meducin</p>
        {error && <div className="register-error">{error}</div>}
        <form className="register-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="firstName"
            placeholder="Nombre"
            className="register-input"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="lastName"
            placeholder="Apellido"
            className="register-input"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="phoneNumber"
            placeholder="Teléfono"
            className="register-input"
            value={formData.phoneNumber}
            onChange={handleChange}
          />
          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            className="register-input"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            className="register-input"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirmar contraseña"
            className="register-input"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          <button 
            type="submit" 
            className="register-button"
            disabled={isLoading}
          >
            {isLoading ? "Procesando..." : "Registrarse"}
          </button>
        </form>
        <p className="register-footer">
          ¿Ya tiene una cuenta? <Link href="/login">Inicie sesión</Link>
        </p>
      </div>
    </div>
  );
}
