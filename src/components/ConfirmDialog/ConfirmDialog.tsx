'use client';

import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import '../../styles/ConfirmDialog.css';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  type = 'warning',
}) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-dialog-overlay" onClick={onCancel}>
      <div className={`confirm-dialog confirm-dialog-${type}`} onClick={(e) => e.stopPropagation()}>
        <div className="confirm-dialog-header">
          <FiAlertTriangle className="confirm-dialog-icon" />
          <h3 className="confirm-dialog-title">{title}</h3>
        </div>
        <div className="confirm-dialog-body">
          <p className="confirm-dialog-message">{message}</p>
        </div>
        <div className="confirm-dialog-footer">
          <button className="confirm-dialog-button confirm-dialog-button-cancel" onClick={onCancel}>
            {cancelText}
          </button>
          <button className="confirm-dialog-button confirm-dialog-button-confirm" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;

