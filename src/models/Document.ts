// Modelos de Documentos

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

