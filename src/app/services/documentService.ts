import API from './api';

export interface DocumentType {
  _id: string;
  name: string;
  code: string;
  validationPattern: string;
  description?: string;
  isActive: boolean;
}

export interface DocumentValidationResult {
  isValid: boolean;
  isDuplicate: boolean;
  error?: string;
}

export const documentService = {
  async getDocumentTypes(): Promise<DocumentType[]> {
    const response = await API.get('/document-types/public');
    return response.data;
  },

  async validateDocument(documentNumber: string, documentType: string): Promise<DocumentValidationResult> {
    try {
      const response = await API.get(`/guests/document/${documentNumber}/${documentType}`);
      
      // Si el documento existe, es duplicado
      if (response.data) {
        return {
          isValid: false,
          isDuplicate: true,
          error: 'Este documento ya está registrado en el sistema'
        };
      }
      
      return {
        isValid: true,
        isDuplicate: false
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Documento no encontrado = válido
        return {
          isValid: true,
          isDuplicate: false
        };
      }
      
      return {
        isValid: false,
        isDuplicate: false,
        error: 'Error validando documento'
      };
    }
  },

  async validateDocumentFormat(documentNumber: string, documentType: DocumentType): Promise<boolean> {
    if (!documentType.validationPattern) {
      return true; // Si no hay patrón, considerar válido
    }
    
    const regex = new RegExp(documentType.validationPattern);
    return regex.test(documentNumber);
  },

  async checkDocumentExists(documentNumber: string, documentType: string): Promise<boolean> {
    try {
      const response = await API.get(`/guests/public/check-document?documentNumber=${documentNumber}&documentType=${documentType}`);
      return response.data.exists;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  }
};
