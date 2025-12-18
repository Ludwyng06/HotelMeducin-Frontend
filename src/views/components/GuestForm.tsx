'use client';

import { useState, useEffect, useRef } from 'react';
import { documentService } from '@services/documentService';
import API from '@services/api';
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
  const [phoneError, setPhoneError] = useState<string>('');
  const [validatingDocument, setValidatingDocument] = useState<boolean>(false);
  const [validatingPhone, setValidatingPhone] = useState<boolean>(false);
  const [loadingUser, setLoadingUser] = useState<boolean>(false);
  const [userFound, setUserFound] = useState<boolean>(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const documentTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const phoneTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
        setDocumentError('⚠️ Este documento ya está registrado en el sistema');
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

  // Función para buscar usuario por email
  const searchUserByEmail = async (email: string) => {
    if (!email || !validateEmail(email)) {
      setUserFound(false);
      return;
    }

    setLoadingUser(true);
    try {
      const response = await API.get(`/recepcionista/clients/search?email=${encodeURIComponent(email)}`);
      
      if (response.data.success && response.data.data) {
        const userData = response.data.data;
        
        // Verificar si el email actual del formulario es diferente al email encontrado
        // Si es diferente, significa que el usuario cambió el email y debemos limpiar y actualizar todos los campos
        const emailChanged = guest.email && guest.email.toLowerCase() !== email.toLowerCase();
        
        const updates: Partial<GuestData> = {};
        
        // Actualizar el email con el valor correcto del backend (siempre para corregir posibles errores de tipeo)
        if (userData.email) {
          updates.email = userData.email;
        }
        
        // Si el email cambió, limpiar todos los campos y autocompletar solo con los datos del nuevo usuario
        if (emailChanged) {
          // Limpiar todos los campos primero (establecerlos como vacíos o undefined)
          updates.firstName = userData.firstName || '';
          updates.lastName = userData.lastName || '';
          updates.phoneNumber = userData.phoneNumber || '';
          updates.documentType = userData.documentType || '';
          updates.documentNumber = userData.documentNumber || '';
          updates.nationality = userData.nationality || '';
          updates.birthDate = userData.birthDate || '';
        } else {
          // Si el email es el mismo, solo autocompletar campos vacíos para no sobrescribir datos ya ingresados
          if (!guest.firstName && userData.firstName) {
            updates.firstName = userData.firstName;
          }
          if (!guest.lastName && userData.lastName) {
            updates.lastName = userData.lastName;
          }
          if (!guest.phoneNumber && userData.phoneNumber) {
            updates.phoneNumber = userData.phoneNumber;
          }
          if (!guest.documentType && userData.documentType) {
            updates.documentType = userData.documentType;
          }
          if (!guest.documentNumber && userData.documentNumber) {
            updates.documentNumber = userData.documentNumber;
          }
          if (!guest.nationality && userData.nationality) {
            updates.nationality = userData.nationality;
          }
          if (!guest.birthDate && userData.birthDate) {
            updates.birthDate = userData.birthDate;
          }
        }
        
        // Aplicar actualizaciones si hay alguna
        if (Object.keys(updates).length > 0) {
          onUpdate(updates);
        }
        
        setUserFound(true);
        // Ocultar mensaje después de 3 segundos
        setTimeout(() => setUserFound(false), 3000);
      } else {
        setUserFound(false);
      }
    } catch (error: any) {
      // Usuario no encontrado o error - no hacer nada
      setUserFound(false);
    } finally {
      setLoadingUser(false);
    }
  };

  const handleDocumentNumberChange = (value: string) => {
    onUpdate({ documentNumber: value });
    
    // Limpiar timeout anterior si existe
    if (documentTimeoutRef.current) {
      clearTimeout(documentTimeoutRef.current);
    }
    
    // Limpiar error mientras el usuario escribe (solo si hay tipo seleccionado)
    // Si no hay tipo, no mostrar error de formato aún
    if (guest.documentType) {
      setDocumentError('');
      setValidatingDocument(false);
      
      if (value) {
        // Validar formato inmediatamente solo si hay tipo seleccionado
        if (!validateDocumentFormat(value, guest.documentType)) {
          setDocumentError('Formato de documento inválido');
          return;
        }
        
        // Validar duplicados después de que el usuario termine de escribir (debounce)
        documentTimeoutRef.current = setTimeout(() => {
          validateDocument(value, guest.documentType);
        }, 800); // Esperar 800ms después de que el usuario deje de escribir
      }
    } else {
      // Si no hay tipo seleccionado, limpiar errores para permitir seleccionar tipo
      setDocumentError('');
      setValidatingDocument(false);
    }
  };

  const handleEmailChange = (value: string) => {
    onUpdate({ email: value });
    setUserFound(false); // Resetear indicador cuando cambia el email
    
    if (value && !validateEmail(value)) {
      setEmailError('Formato de email inválido');
    } else {
      setEmailError('');
    }

    // Limpiar timeout anterior si existe
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Buscar usuario después de que el usuario termine de escribir (debounce)
    if (validateEmail(value)) {
      searchTimeoutRef.current = setTimeout(() => {
        searchUserByEmail(value);
      }, 800); // Esperar 800ms después de que el usuario deje de escribir
    }
  };

  // Función para limpiar el formulario
  const handleClearForm = () => {
    // Limpiar todos los campos del formulario
    onUpdate({
      documentType: '',
      documentNumber: '',
      firstName: '',
      lastName: '',
      birthDate: '',
      nationality: '',
      phoneNumber: '',
      email: '',
      isCompleted: false
    });
    
    // Limpiar estados de validación
    setDocumentError('');
    setEmailError('');
    setPhoneError('');
    setUserFound(false);
    
    // Limpiar timeouts
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (documentTimeoutRef.current) {
      clearTimeout(documentTimeoutRef.current);
    }
    if (phoneTimeoutRef.current) {
      clearTimeout(phoneTimeoutRef.current);
    }
  };

  // Limpiar timeouts al desmontar el componente
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (documentTimeoutRef.current) {
        clearTimeout(documentTimeoutRef.current);
      }
      if (phoneTimeoutRef.current) {
        clearTimeout(phoneTimeoutRef.current);
      }
    };
  }, []);

  const handleDocumentTypeChange = (value: string) => {
    // Limpiar errores primero para permitir el cambio
    setDocumentError('');
    setValidatingDocument(false);
    
    // Limpiar timeout anterior si existe
    if (documentTimeoutRef.current) {
      clearTimeout(documentTimeoutRef.current);
    }
    
    // Actualizar el tipo de documento
    onUpdate({ documentType: value });
    
    // Re-validar número si existe y hay un nuevo tipo seleccionado
    if (guest.documentNumber && value) {
      // Validar formato con el nuevo tipo
      if (!validateDocumentFormat(guest.documentNumber, value)) {
        setDocumentError('Formato de documento inválido para el tipo seleccionado');
        return;
      }
      
      // Validar duplicados después de un breve delay
      documentTimeoutRef.current = setTimeout(() => {
        validateDocument(guest.documentNumber, value);
      }, 800);
    }
  };

  // Validar teléfono contra backend (usuario/cliente existente)
  const validatePhone = async (phoneNumber: string) => {
    setPhoneError('');
    if (!phoneNumber) {
      setValidatingPhone(false);
      return;
    }

    setValidatingPhone(true);
    try {
      // Pasamos también el email actual para permitir el mismo teléfono
      // si pertenece al mismo cliente (mismo email)
      const response = await API.get(
        `/recepcionista/clients/check-phone?phoneNumber=${encodeURIComponent(
          phoneNumber,
        )}&email=${encodeURIComponent(guest.email || '')}`,
      );

      if (response.data?.exists) {
        setPhoneError(
          response.data.message ||
            '⚠️ Este teléfono ya está registrado en el sistema para otro cliente',
        );
      } else {
        setPhoneError('');
      }
    } catch (error: any) {
      // En caso de error de red u otro, no bloqueamos, solo mostramos mensaje genérico
      console.error('Error validando teléfono:', error);
      if (error.response?.status !== 404) {
        setPhoneError('Error al validar el teléfono. Intenta nuevamente.');
      }
    } finally {
      setValidatingPhone(false);
    }
  };

  const handlePhoneChange = (value: string) => {
    onUpdate({ phoneNumber: value });
    
    // Limpiar timeout anterior si existe
    if (phoneTimeoutRef.current) {
      clearTimeout(phoneTimeoutRef.current);
    }
    
    // Limpiar error mientras el usuario escribe
    setPhoneError('');
    setValidatingPhone(false);

    // Validar solo si tiene una longitud mínima razonable
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length >= 7) {
      // Validar después de que el usuario termine de escribir (debounce)
      phoneTimeoutRef.current = setTimeout(() => {
        validatePhone(value);
      }, 800); // Esperar 800ms después de que el usuario deje de escribir
    }
  };

  const isFormValid = (): boolean => {
    return !documentError && !emailError && !phoneError &&
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
  }, [guest, documentError, emailError, phoneError, onUpdate]);

  return (
    <div className="guest-form">
      <div className="form-row">
        <div className="form-group">
          <label htmlFor={`documentType-${index}`}>Tipo de Documento *</label>
          <select
            id={`documentType-${index}`}
            value={guest.documentType || ''}
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
            <div className="validation-spinner">🔍 Validando documento...</div>
          )}
          {documentError && (
            <div className="error-text">{documentError}</div>
          )}
          {!validatingDocument && !documentError && guest.documentNumber && guest.documentType && validateDocumentFormat(guest.documentNumber, guest.documentType) && (
            <div className="success-text">✅ Documento válido</div>
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
            onChange={(e) => handlePhoneChange(e.target.value)}
            className={`form-input ${phoneError ? 'error' : ''}`}
            placeholder="Ej: +57 300 123 4567"
            required
          />
          {validatingPhone && (
            <div className="validation-spinner">🔍 Validando teléfono...</div>
          )}
          {phoneError && (
            <div className="error-text">{phoneError}</div>
          )}
          {!validatingPhone && !phoneError && guest.phoneNumber && guest.phoneNumber.replace(/\D/g, '').length >= 7 && (
            <div className="success-text">✅ Teléfono válido</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor={`email-${index}`}>Email *</label>
          <div className="email-input-wrapper">
            <input
              id={`email-${index}`}
              type="email"
              value={guest.email}
              onChange={(e) => handleEmailChange(e.target.value)}
              className={`form-input ${emailError ? 'error' : ''} ${userFound ? 'user-found' : ''}`}
              placeholder="ejemplo@correo.com"
              required
            />
            {loadingUser && (
              <span className="email-status-indicator loading">🔍 Buscando...</span>
            )}
            {userFound && !loadingUser && (
              <span className="email-status-indicator found">✅ Usuario encontrado - Campos autocompletados</span>
            )}
          </div>
          {emailError && (
            <div className="error-text">{emailError}</div>
          )}
        </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          onClick={handleClearForm}
          className="btn-clear-form"
          title="Limpiar todos los campos del formulario"
        >
          🗑️ Limpiar Formulario
        </button>
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
