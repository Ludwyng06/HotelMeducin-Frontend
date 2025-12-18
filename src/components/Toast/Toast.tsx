'use client';

import React, { useEffect } from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiXCircle, FiX } from 'react-icons/fi';
import '../../styles/Toast.css';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, message, type, duration = 5000, onClose }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const icons = {
    success: <FiCheckCircle />,
    error: <FiXCircle />,
    warning: <FiAlertCircle />,
    info: <FiInfo />,
  };

  const icon = icons[type];

  return (
    <div className={`toast toast-${type}`} role="alert">
      <div className="toast-icon">{icon}</div>
      <div className="toast-message">{message}</div>
      <button
        className="toast-close"
        onClick={() => onClose(id)}
        aria-label="Cerrar notificación"
      >
        <FiX />
      </button>
    </div>
  );
};

export default Toast;

