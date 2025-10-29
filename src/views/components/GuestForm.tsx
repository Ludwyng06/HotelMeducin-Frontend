'use client';

import { useState, useEffect } from 'react';
import { documentService } from '@services/documentService';
import type { DocumentType } from '@models/Document';
import type { GuestData } from '@models/Reservation';

interface GuestFormProps {
  guest: GuestData;
  documentTypes: DocumentType[];
  onUpdate: (updatedGuest: Partial<GuestData>) => void;
  index: number;
}

export default function GuestForm({ guest, documentTypes, onUpdate, index }: GuestFormProps) {
  const [documentError, setDocumentError] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [validatingDocument, setValidatingDocument] = useState<boolean>(false);

  // Validar documento en tiempo real (usa endpoint público que devuelve { exists: boolean })
  const validateDocument = async (documentNumber: string, documentType: string) => {
    if (!documentNumber || !documentType) {
      setDocumentError('');
      return;
    }

    setValidatingDocument(true);
    try {
      const exists = await documentService.checkDocumentExists(documentNumber, documentType);
      if (exists) {
        setDocumentError('Este documento ya está registrado en el sistema');
      } else {
        setDocumentError('');
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        setDocumentError(''); // Documento no encontrado = válido
      } else {
        setDocumentError('Error validando documento');
      }
    } finally {
      setValidatingDocument(false);
    }
  };

  // Validar formato de documento según tipo
  const validateDocumentFormat = (documentNumber: string, documentType: string): boolean => {
    const docType = documentTypes.find(dt => dt._id === documentType);
    if (!docType) return false;

    const regex = new RegExp(docType.validationPattern);
    return regex.test(documentNumber);
  };

  // Validar email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleDocumentNumberChange = (value: string) => {
    onUpdate({ documentNumber: value });
    
    if (guest.documentType) {
      // Validar formato
      if (!validateDocumentFormat(value, guest.documentType)) {
        setDocumentError('Formato de documento inválido');
        return;
      }
      
      // Validar duplicados
      validateDocument(value, guest.documentType);
    }
  };

  const handleEmailChange = (value: string) => {
    onUpdate({ email: value });
    
    if (value && !validateEmail(value)) {
      setEmailError('Formato de email inválido');
    } else {
      setEmailError('');
    }
  };

  const handleDocumentTypeChange = (value: string) => {
    onUpdate({ documentType: value });
    setDocumentError(''); // Limpiar error al cambiar tipo
    
    // Re-validar número si existe
    if (guest.documentNumber) {
      handleDocumentNumberChange(guest.documentNumber);
    }
  };

  const isFormValid = (): boolean => {
    return !documentError && !emailError && 
           !!guest.documentType && !!guest.documentNumber && 
           !!guest.firstName && !!guest.lastName && 
           !!guest.birthDate && !!guest.nationality && 
           !!guest.phoneNumber && !!guest.email;
  };

  useEffect(() => {
    // Marcar como completado si todos los campos están llenos y válidos
    const isValid = isFormValid();
    if (isValid !== guest.isCompleted) {
      onUpdate({ isCompleted: isValid });
    }
  }, [guest, documentError, emailError, onUpdate]);

  return (
    <div className="guest-form">
      <div className="form-row">
        <div className="form-group">
          <label htmlFor={`documentType-${index}`}>Tipo de Documento *</label>
          <select
            id={`documentType-${index}`}
            value={guest.documentType}
            onChange={(e) => handleDocumentTypeChange(e.target.value)}
            className="form-select"
            required
          >
            <option value="">Seleccionar tipo</option>
            {documentTypes.map((docType) => (
              <option key={docType._id} value={docType._id}>
                {docType.name} ({docType.code})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor={`documentNumber-${index}`}>Número de Documento *</label>
          <input
            id={`documentNumber-${index}`}
            type="text"
            value={guest.documentNumber}
            onChange={(e) => handleDocumentNumberChange(e.target.value)}
            className={`form-input ${documentError ? 'error' : ''}`}
            placeholder="Ej: 12345678"
            required
          />
          {validatingDocument && (
            <div className="validation-spinner">Validando...</div>
          )}
          {documentError && (
            <div className="error-text">{documentError}</div>
          )}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor={`firstName-${index}`}>Nombre *</label>
          <input
            id={`firstName-${index}`}
            type="text"
            value={guest.firstName}
            onChange={(e) => onUpdate({ firstName: e.target.value })}
            className="form-input"
            placeholder="Nombre"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor={`lastName-${index}`}>Apellido *</label>
          <input
            id={`lastName-${index}`}
            type="text"
            value={guest.lastName}
            onChange={(e) => onUpdate({ lastName: e.target.value })}
            className="form-input"
            placeholder="Apellido"
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor={`birthDate-${index}`}>Fecha de Nacimiento *</label>
          <input
            id={`birthDate-${index}`}
            type="date"
            value={guest.birthDate}
            onChange={(e) => onUpdate({ birthDate: e.target.value })}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor={`nationality-${index}`}>Nacionalidad *</label>
          <input
            id={`nationality-${index}`}
            type="text"
            value={guest.nationality}
            onChange={(e) => onUpdate({ nationality: e.target.value })}
            className="form-input"
            placeholder="Ej: Colombiana"
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor={`phoneNumber-${index}`}>Teléfono *</label>
          <input
            id={`phoneNumber-${index}`}
            type="tel"
            value={guest.phoneNumber}
            onChange={(e) => onUpdate({ phoneNumber: e.target.value })}
            className="form-input"
            placeholder="Ej: +57 300 123 4567"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor={`email-${index}`}>Email *</label>
          <input
            id={`email-${index}`}
            type="email"
            value={guest.email}
            onChange={(e) => handleEmailChange(e.target.value)}
            className={`form-input ${emailError ? 'error' : ''}`}
            placeholder="ejemplo@correo.com"
            required
          />
          {emailError && (
            <div className="error-text">{emailError}</div>
          )}
        </div>
      </div>

      <div className="form-status">
        {guest.isCompleted ? (
          <div className="status-completed">
            ✅ Formulario completado correctamente
          </div>
        ) : (
          <div className="status-incomplete">
            ⚠️ Completa todos los campos requeridos
          </div>
        )}
      </div>
    </div>
  );
}
