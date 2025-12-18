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
  const checkInDate = searchParams.get('checkInDate');
  
  // Función helper para determinar si es reserva del mismo día
  const isSameDayReservation = (): boolean => {
    if (!checkInDate) return false;
    const checkIn = new Date(checkInDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    checkIn.setHours(0, 0, 0, 0);
    return checkIn.getTime() === today.getTime();
  };
  
  const isSameDay = isSameDayReservation();

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
          
          {/* Información sobre estado de la reserva */}
          <div className={`reservation-status-info ${isSameDay ? 'same-day-alert' : 'future-alert'}`}>
            <h3>
              {isSameDay ? '⏰ ¡ATENCIÓN - Reserva del Mismo Día!' : '📋 Estado de tu Reserva'}
            </h3>
            
            {isSameDay ? (
              <div className="status-content warning">
                <p><strong>Tu reserva está en estado PENDIENTE</strong></p>
                <p>
                  Como reservaste para hoy, tienes <strong>1 hora desde ahora</strong> para 
                  acercarte a recepción y confirmar tu reserva con el pago.
                </p>
                <div className="status-actions">
                  <p><strong>⚠️ Importante:</strong></p>
                  <ul>
                    <li>Si no confirmas en recepción dentro de 1 hora, tu reserva se cancelará automáticamente</li>
                    <li>Debes presentarte en recepción con tu documento de identidad y el pago</li>
                    <li>El recepcionista confirmará tu reserva al recibir el pago</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="status-content info">
                <p><strong>Tu reserva está en estado PENDIENTE</strong></p>
                <p>
                  Tu reserva quedará pendiente hasta que la confirmes en recepción con el pago 
                  el día de tu check-in.
                </p>
                <div className="status-rules">
                  <p><strong>📋 Reglas importantes:</strong></p>
                  <ul>
                    <li>✅ Puedes cancelar tu reserva hasta <strong>24 horas antes</strong> del check-in desde tu perfil</li>
                    <li>🚫 Si faltan menos de 24 horas, ya no podrás cancelar por tu cuenta</li>
                    <li>💳 Debes confirmar en recepción el día del check-in con el pago</li>
                    <li>📧 Recibirás recordatorios por email antes de tu fecha de check-in</li>
                  </ul>
                </div>
              </div>
            )}
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