'use client';

import { useState, useCallback } from 'react';

interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
}

export const useConfirmDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmDialogOptions | null>(null);

  const showConfirm = useCallback((opts: ConfirmDialogOptions) => {
    setOptions(opts);
    setIsOpen(true);
  }, []);

  const hideConfirm = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => setOptions(null), 300); // Esperar a que termine la animación
  }, []);

  const handleConfirm = useCallback(() => {
    if (options?.onConfirm) {
      options.onConfirm();
    }
    hideConfirm();
  }, [options, hideConfirm]);

  return {
    isOpen,
    options,
    showConfirm,
    hideConfirm,
    handleConfirm,
  };
};

