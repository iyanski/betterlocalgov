import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import * as path from 'path';

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fileInfo: {
    size: number;
    mimeType: string;
    extension: string;
    hash: string;
    isImage: boolean;
    isDocument: boolean;
    isVideo: boolean;
    isAudio: boolean;
  };
}

export interface FileSecurityCheck {
  isSafe: boolean;
  threats: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

@Injectable()
export class FileValidationService {
  private readonly logger = new Logger(FileValidationService.name);

  // Allowed file types with their MIME types and extensions
  private readonly allowedTypes = {
    images: {
      mimeTypes: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
      ],
      extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
      maxSize: 10 * 1024 * 1024, // 10MB
    },
    documents: {
      mimeTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'text/csv',
      ],
      extensions: [
        '.pdf',
        '.doc',
        '.docx',
        '.xls',
        '.xlsx',
        '.ppt',
        '.pptx',
        '.txt',
        '.csv',
      ],
      maxSize: 25 * 1024 * 1024, // 25MB
    },
    videos: {
      mimeTypes: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
      extensions: ['.mp4', '.webm', '.ogv', '.mov'],
      maxSize: 100 * 1024 * 1024, // 100MB
    },
    audio: {
      mimeTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'],
      extensions: ['.mp3', '.wav', '.ogg', '.m4a'],
      maxSize: 50 * 1024 * 1024, // 50MB
    },
  };

  // Dangerous file extensions that should never be allowed
  private readonly dangerousExtensions = [
    '.exe',
    '.bat',
    '.cmd',
    '.com',
    '.pif',
    '.scr',
    '.vbs',
    '.js',
    '.jar',
    '.php',
    '.asp',
    '.jsp',
    '.py',
    '.rb',
    '.pl',
    '.sh',
    '.ps1',
    '.psm1',
    '.dll',
    '.sys',
    '.drv',
    '.msi',
    '.deb',
    '.rpm',
    '.app',
    '.dmg',
  ];

  // Suspicious file patterns
  private readonly suspiciousPatterns = [
    /eval\s*\(/i,
    /exec\s*\(/i,
    /system\s*\(/i,
    /shell_exec\s*\(/i,
    /passthru\s*\(/i,
    /file_get_contents\s*\(/i,
    /fopen\s*\(/i,
    /fwrite\s*\(/i,
    /include\s*\(/i,
    /require\s*\(/i,
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /onload\s*=/i,
    /onerror\s*=/i,
  ];

  /**
   * Comprehensive file validation
   */
  async validateFile(file: {
    originalname: string;
    buffer: Buffer;
    mimetype: string;
    size: number;
  }): Promise<FileValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const fileInfo = this.extractFileInfo(file);

    // 1. Basic file validation
    this.validateBasicProperties(file, errors, warnings);

    // 2. File type validation
    this.validateFileType(file, errors, warnings);

    // 3. File size validation
    this.validateFileSize(file, errors, warnings);

    // 4. File name validation
    this.validateFileName(file.originalname, errors, warnings);

    // 5. Content validation
    await this.validateFileContent(file, errors, warnings);

    // 6. Security checks
    const securityCheck = await this.performSecurityChecks(file);
    if (!securityCheck.isSafe) {
      errors.push(...securityCheck.threats);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      fileInfo,
    };
  }

  /**
   * Extract file information
   */
  private extractFileInfo(file: {
    originalname: string;
    buffer: Buffer;
    mimetype: string;
    size: number;
  }) {
    const extension = this.getFileExtension(file.originalname);
    const hash = crypto.createHash('sha256').update(file.buffer).digest('hex');

    return {
      size: file.size,
      mimeType: file.mimetype,
      extension,
      hash,
      isImage: this.isImageFile(file.mimetype, extension),
      isDocument: this.isDocumentFile(file.mimetype, extension),
      isVideo: this.isVideoFile(file.mimetype, extension),
      isAudio: this.isAudioFile(file.mimetype, extension),
    };
  }

  /**
   * Validate basic file properties
   */
  private validateBasicProperties(
    file: {
      originalname: string;
      buffer: Buffer;
      mimetype: string;
      size: number;
    },
    errors: string[],
    warnings: string[],
  ) {
    if (!file.originalname || file.originalname.trim() === '') {
      errors.push('File name is required');
    }

    if (!file.buffer || file.buffer.length === 0) {
      errors.push('File content is empty');
    }

    if (!file.mimetype || file.mimetype.trim() === '') {
      errors.push('File MIME type is required');
    }

    if (file.size <= 0) {
      errors.push('File size must be greater than 0');
    }

    // Check for suspiciously large files
    if (file.size > 500 * 1024 * 1024) {
      // 500MB
      warnings.push('File size is very large (>500MB)');
    }
  }

  /**
   * Validate file type
   */
  private validateFileType(
    file: { mimetype: string; originalname: string },
    errors: string[],
    warnings: string[],
  ) {
    const extension = this.getFileExtension(file.originalname);
    const mimeType = file.mimetype.toLowerCase();

    // Check if file type is allowed
    const isAllowed = Object.values(this.allowedTypes).some(
      (type) =>
        type.mimeTypes.includes(mimeType) &&
        type.extensions.includes(extension),
    );

    if (!isAllowed) {
      errors.push(
        `File type '${mimeType}' with extension '${extension}' is not allowed`,
      );
    }

    // Check for MIME type and extension mismatch
    if (!this.isMimeTypeExtensionMatch(mimeType, extension)) {
      warnings.push(
        `MIME type '${mimeType}' doesn't match file extension '${extension}'`,
      );
    }
  }

  /**
   * Validate file size
   */
  private validateFileSize(
    file: { size: number; mimetype: string; originalname: string },
    errors: string[],
    warnings: string[],
  ) {
    const extension = this.getFileExtension(file.originalname);
    const mimeType = file.mimetype.toLowerCase();

    // Find the appropriate size limit for this file type
    let maxSize = 0;
    for (const [, config] of Object.entries(this.allowedTypes)) {
      if (
        config.mimeTypes.includes(mimeType) &&
        config.extensions.includes(extension)
      ) {
        maxSize = config.maxSize;
        break;
      }
    }

    if (maxSize > 0 && file.size > maxSize) {
      errors.push(
        `File size ${this.formatFileSize(file.size)} exceeds maximum allowed size ${this.formatFileSize(maxSize)}`,
      );
    }

    // Additional size warnings
    if (file.size > 50 * 1024 * 1024) {
      // 50MB
      warnings.push('Large file upload detected');
    }
  }

  /**
   * Validate file name
   */
  private validateFileName(
    filename: string,
    errors: string[],
    warnings: string[],
  ) {
    if (!filename || filename.trim() === '') {
      errors.push('File name is required');
      return;
    }

    // Check for dangerous characters
    const dangerousChars = /[<>:"/\\|?*]/;
    const hasControlChars = filename.split('').some((char) => {
      const code = char.charCodeAt(0);
      return code >= 0 && code <= 31;
    });
    if (dangerousChars.test(filename) || hasControlChars) {
      errors.push('File name contains dangerous characters');
    }

    // Check for suspicious patterns in filename
    const suspiciousNamePatterns = [
      /\.(exe|bat|cmd|com|pif|scr|vbs|js|jar)$/i,
      /\.(php|asp|jsp|py|rb|pl|sh|ps1)$/i,
      /\.(dll|sys|drv|msi|deb|rpm|app|dmg)$/i,
    ];

    for (const pattern of suspiciousNamePatterns) {
      if (pattern.test(filename)) {
        errors.push('File name contains suspicious extension');
        break;
      }
    }

    // Check for double extensions (potential security risk)
    const doubleExtensionPattern = /\.[^.]+\.[^.]+\.[^.]/;
    if (doubleExtensionPattern.test(filename)) {
      warnings.push('File has multiple extensions (potential security risk)');
    }

    // Check filename length
    if (filename.length > 255) {
      errors.push('File name is too long (maximum 255 characters)');
    }

    // Check for reserved names
    const reservedNames = [
      'CON',
      'PRN',
      'AUX',
      'NUL',
      'COM1',
      'COM2',
      'COM3',
      'COM4',
      'COM5',
      'COM6',
      'COM7',
      'COM8',
      'COM9',
      'LPT1',
      'LPT2',
      'LPT3',
      'LPT4',
      'LPT5',
      'LPT6',
      'LPT7',
      'LPT8',
      'LPT9',
    ];
    const nameWithoutExt = filename.split('.')[0].toUpperCase();
    if (reservedNames.includes(nameWithoutExt)) {
      errors.push('File name is reserved by the system');
    }
  }

  /**
   * Validate file content
   */
  private async validateFileContent(
    file: { buffer: Buffer; mimetype: string; originalname: string },
    errors: string[],
    warnings: string[],
  ) {
    const mimeType = file.mimetype.toLowerCase();

    // Check file magic bytes (file signature)
    if (!this.validateFileSignature(file.buffer, mimeType)) {
      errors.push('File signature does not match MIME type');
    }

    // Check for embedded content in images
    if (mimeType.startsWith('image/')) {
      await this.validateImageContent(file, errors, warnings);
    }

    // Check for embedded content in documents
    if (
      this.isDocumentFile(mimeType, this.getFileExtension(file.originalname))
    ) {
      await this.validateDocumentContent(file, errors, warnings);
    }
  }

  /**
   * Perform security checks
   */
  private async performSecurityChecks(file: {
    buffer: Buffer;
    mimetype: string;
    originalname: string;
  }): Promise<FileSecurityCheck> {
    const threats: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

    // Check for dangerous extensions
    const extension = this.getFileExtension(file.originalname);
    if (this.dangerousExtensions.includes(extension.toLowerCase())) {
      threats.push('File has dangerous extension');
      riskLevel = 'critical';
    }

    // Check for suspicious content patterns
    const content = file.buffer.toString(
      'utf8',
      0,
      Math.min(file.buffer.length, 1024 * 1024),
    ); // Check first 1MB
    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(content)) {
        threats.push('File contains suspicious content patterns');
        riskLevel = riskLevel === 'critical' ? 'critical' : 'high';
        break;
      }
    }

    // Check for executable content
    if (this.containsExecutableContent(file.buffer)) {
      threats.push('File contains executable content');
      riskLevel = 'critical';
    }

    // Check for embedded scripts
    if (this.containsEmbeddedScripts(file.buffer)) {
      threats.push('File contains embedded scripts');
      riskLevel = riskLevel === 'critical' ? 'critical' : 'high';
    }

    return {
      isSafe: threats.length === 0,
      threats,
      riskLevel,
    };
  }

  /**
   * Validate file signature (magic bytes)
   */
  private validateFileSignature(buffer: Buffer, mimeType: string): boolean {
    if (buffer.length < 4) return false;

    const signature = buffer.slice(0, 4);
    const hex = signature.toString('hex').toUpperCase();

    const signatures: { [key: string]: string[] } = {
      'image/jpeg': [
        'FFD8FFE0',
        'FFD8FFE1',
        'FFD8FFE2',
        'FFD8FFE3',
        'FFD8FFE8',
      ],
      'image/png': ['89504E47'],
      'image/gif': ['47494638'],
      'image/webp': ['52494646'], // RIFF
      'application/pdf': ['25504446'], // %PDF
      'application/zip': ['504B0304', '504B0506', '504B0708'],
      'video/mp4': ['00000018', '00000020'],
      'audio/mpeg': ['FFFB', 'FFF3', 'FFF2'],
    };

    const expectedSignatures = signatures[mimeType.toLowerCase()];
    if (!expectedSignatures) return true; // No signature check for this type

    return expectedSignatures.some((sig) => hex.startsWith(sig));
  }

  /**
   * Check if file contains executable content
   */
  private containsExecutableContent(buffer: Buffer): boolean {
    // Check for common executable signatures
    const executableSignatures = [
      '4D5A', // PE executable (MZ)
      '7F454C46', // ELF executable
      'FEEDFACE', // Mach-O binary
      'CEFAEDFE', // Mach-O binary (reverse)
    ];

    const hex = buffer.slice(0, 8).toString('hex').toUpperCase();
    return executableSignatures.some((sig) => hex.startsWith(sig));
  }

  /**
   * Check if file contains embedded scripts
   */
  private containsEmbeddedScripts(buffer: Buffer): boolean {
    const content = buffer.toString(
      'utf8',
      0,
      Math.min(buffer.length, 1024 * 1024),
    );

    const scriptPatterns = [
      /<script[^>]*>/i,
      /javascript:/i,
      /vbscript:/i,
      /onload\s*=/i,
      /onerror\s*=/i,
      /eval\s*\(/i,
      /exec\s*\(/i,
    ];

    return scriptPatterns.some((pattern) => pattern.test(content));
  }

  /**
   * Validate image content
   */
  private async validateImageContent(
    file: { buffer: Buffer; mimetype: string },
    errors: string[],
    warnings: string[],
  ) {
    // Check for embedded content in images
    const content = file.buffer.toString(
      'utf8',
      0,
      Math.min(file.buffer.length, 1024 * 1024),
    );

    // Look for embedded scripts in images
    if (/<script/i.test(content) || /javascript:/i.test(content)) {
      errors.push('Image contains embedded scripts');
    }

    // Check for suspicious image metadata
    if (/exif/i.test(content) && /<script/i.test(content)) {
      warnings.push('Image contains suspicious metadata');
    }
  }

  /**
   * Validate document content
   */
  private async validateDocumentContent(
    file: { buffer: Buffer; mimetype: string },
    errors: string[],
    warnings: string[],
  ) {
    const content = file.buffer.toString(
      'utf8',
      0,
      Math.min(file.buffer.length, 1024 * 1024),
    );

    // Check for embedded macros in documents
    if (
      file.mimetype.includes('word') ||
      file.mimetype.includes('excel') ||
      file.mimetype.includes('powerpoint')
    ) {
      if (/macro/i.test(content) || /vba/i.test(content)) {
        warnings.push('Document may contain macros');
      }
    }

    // Check for embedded objects
    if (/<object/i.test(content) || /<embed/i.test(content)) {
      warnings.push('Document contains embedded objects');
    }
  }

  // Helper methods
  private getFileExtension(filename: string): string {
    return path.extname(filename).toLowerCase();
  }

  private isImageFile(mimeType: string, extension: string): boolean {
    return (
      this.allowedTypes.images.mimeTypes.includes(mimeType) &&
      this.allowedTypes.images.extensions.includes(extension)
    );
  }

  private isDocumentFile(mimeType: string, extension: string): boolean {
    return (
      this.allowedTypes.documents.mimeTypes.includes(mimeType) &&
      this.allowedTypes.documents.extensions.includes(extension)
    );
  }

  private isVideoFile(mimeType: string, extension: string): boolean {
    return (
      this.allowedTypes.videos.mimeTypes.includes(mimeType) &&
      this.allowedTypes.videos.extensions.includes(extension)
    );
  }

  private isAudioFile(mimeType: string, extension: string): boolean {
    return (
      this.allowedTypes.audio.mimeTypes.includes(mimeType) &&
      this.allowedTypes.audio.extensions.includes(extension)
    );
  }

  private isMimeTypeExtensionMatch(
    mimeType: string,
    extension: string,
  ): boolean {
    const mimeTypeMap: { [key: string]: string[] } = {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        ['.docx'],
    };

    const expectedExtensions = mimeTypeMap[mimeType];
    return expectedExtensions ? expectedExtensions.includes(extension) : true;
  }

  private formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  }
}
