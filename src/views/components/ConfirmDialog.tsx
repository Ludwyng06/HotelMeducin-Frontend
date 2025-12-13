'use client';

import React, { useEffect } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  onCancel,
  onConfirm,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
}) => {
  // Inyectar estilos CSS en el head cuando el componente se monta
  useEffect(() => {
    const styleId = 'confirm-dialog-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .confirm-dialog-overlay {
          animation: fadeIn 0.2s ease-out;
        }
        .confirm-dialog-content {
          animation: slideUp 0.3s ease-out;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  if (!open) return null;
  
  return (
    <div 
      className="confirm-dialog-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={(e) => {
        // Cerrar al hacer click fuera del modal
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <div 
        className="confirm-dialog-content"
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
          padding: '2rem 2.5rem',
          minWidth: '400px',
          maxWidth: '90vw',
          textAlign: 'center',
          border: '1px solid #e5e7eb',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icono de advertencia */}
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
        }}>
          <svg 
            width="32" 
            height="32" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="#d97706" 
            strokeWidth="2"
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>

        <h3 style={{
          marginBottom: '1rem',
          fontWeight: 700,
          fontSize: '1.5rem',
          color: '#1f2937',
          letterSpacing: '-0.5px',
        }}>
          {title}
        </h3>
        
        <p style={{
          marginBottom: '2rem',
          color: '#6b7280',
          fontSize: '1rem',
          lineHeight: '1.6',
        }}>
          {message}
        </p>
        
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.75rem',
          marginTop: '2rem',
        }}>
          <button 
            onClick={onCancel}
            style={{
              background: '#f3f4f6',
              color: '#374151',
              border: 'none',
              borderRadius: '8px',
              padding: '0.625rem 1.5rem',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#e5e7eb';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#f3f4f6';
            }}
          >
            {cancelText}
          </button>
          
          <button 
            onClick={onConfirm}
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.625rem 1.5rem',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #d97706 0%, #b45309 100%)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(245, 158, 11, 0.3)';
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog; 