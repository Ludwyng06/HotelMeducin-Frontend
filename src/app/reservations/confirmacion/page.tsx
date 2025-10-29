'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import '@styles/Reservations.css';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const reservationId = searchParams.get('id');
  const nights = searchParams.get('nights');
  const total = searchParams.get('total');

  return (
    <div className="confirmation-container">
      <div className="confirmation-card">
        <div className="confirmation-header">
          <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
            <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
          </svg>
          <h1>¡Reserva Confirmada!</h1>
        </div>

        <div className="confirmation-details">
          <p className="confirmation-id">Número de reserva: <strong>#{reservationId}</strong></p>
          <p className="confirmation-message">
            Hemos recibido su reserva correctamente. Le hemos enviado un correo electrónico con todos los detalles.
          </p>

          <div className="confirmation-summary">
            <h3>Resumen de su reserva:</h3>
            <div className="summary-item">
              <span>Duración de la estancia:</span>
              <span><strong>{nights} {parseInt(nights || '1') === 1 ? 'noche' : 'noches'}</strong></span>
            </div>
            <div className="summary-item">
              <span>Total:</span>
              <span><strong>${total}</strong></span>
            </div>
          </div>

          <div className="confirmation-instructions">
            <h3>Instrucciones:</h3>
            <ul>
              <li>El check-in está disponible a partir de las 15:00 horas.</li>
              <li>El check-out debe realizarse antes de las 12:00 horas.</li>
              <li>Es necesario presentar un documento de identidad válido al momento del check-in.</li>
              <li>Si necesita realizar cambios en su reserva, por favor contacte con recepción con al menos 48 horas de antelación.</li>
            </ul>
          </div>
        </div>

        <div className="confirmation-actions">
          <Link href="/user/profile" className="btn-primary" onClick={() => { window.location.href = '/user/profile'; }}>
            Ver mis reservas
          </Link>
          <Link href="/" className="btn-secondary">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

function LoadingComponent() {
  return (
    <div className="confirmation-container">
      <div className="confirmation-loading">
        <h2>Procesando su reserva...</h2>
        <div className="loading-spinner"></div>
      </div>
    </div>
  );
}

export default function ConfirmacionPage() {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <ConfirmationContent />
    </Suspense>
  );
} 