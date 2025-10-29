// Controlador de Documentos - Orquesta validaciones y lógica de documentos
import { documentService } from '@services/documentService';
import type { DocumentType, DocumentValidationResult } from '@models/Document';

export class DocumentController {
  /**
   * Valida un documento completo (formato + existencia)
   */
  static async validateDocumentComplete(
    documentNumber: string,
    documentType: DocumentType
  ): Promise<DocumentValidationResult> {
    try {
      // Validar formato primero
      const isValidFormat = await documentService.validateDocumentFormat(
        documentNumber,
        documentType
      );

      if (!isValidFormat) {
        return {
          isValid: false,
          isDuplicate: false,
          error: `El formato del documento no es válido para ${documentType.name}`
        };
      }

      // Validar existencia/duplicado
      const validationResult = await documentService.validateDocument(
        documentNumber,
        documentType.code
      );

      return validationResult;
    } catch (error: any) {
      return {
        isValid: false,
        isDuplicate: false,
        error: error.message || 'Error validando documento'
      };
    }
  }

  /**
   * Verifica si un documento existe en el sistema
   */
  static async checkDocumentExists(
    documentNumber: string,
    documentType: string
  ): Promise<boolean> {
    try {
      return await documentService.checkDocumentExists(documentNumber, documentType);
    } catch (error: any) {
      console.error('Error verificando existencia de documento:', error);
      return false;
    }
  }

  /**
   * Obtiene todos los tipos de documento activos
   */
  static async getDocumentTypes(): Promise<DocumentType[]> {
    try {
      return await documentService.getDocumentTypes();
    } catch (error: any) {
      throw new Error(`Error obteniendo tipos de documento: ${error.message}`);
    }
  }
}

