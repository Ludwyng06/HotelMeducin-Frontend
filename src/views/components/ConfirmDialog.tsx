import React from 'react';

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
  confirmText = 'Eliminar',
  cancelText = 'Cancelar',
}) => {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.18)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 10,
        boxShadow: '0 4px 24px rgba(0,0,0,0.13)',
        padding: '2.2rem 2.5rem',
        minWidth: 340,
        maxWidth: '90vw',
        textAlign: 'center',
      }}>
        <h3 style={{marginBottom: '1.2rem', fontWeight: 600, fontSize: '1.3rem'}}> {title} </h3>
        <p style={{marginBottom: '2rem', color: '#444'}}>{message}</p>
        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem'}}>
          <button onClick={onCancel} style={{background: 'none', border: 'none', color: '#444', fontWeight: 600, fontSize: '1rem', cursor: 'pointer'}}> {cancelText} </button>
          <button onClick={onConfirm} style={{background: '#c0392b', color: '#fff', border: 'none', borderRadius: 5, padding: '0.5rem 1.5rem', fontWeight: 600, fontSize: '1rem', cursor: 'pointer'}}> {confirmText} </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog; 