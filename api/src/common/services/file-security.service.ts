import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

export interface FileSecurityResult {
  isSafe: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  threats: string[];
  recommendations: string[];
  scanResults: {
    virusScan: boolean;
    malwareScan: boolean;
    contentAnalysis: boolean;
    metadataAnalysis: boolean;
  };
}

@Injectable()
export class FileSecurityService {
  private readonly logger = new Logger(FileSecurityService.name);

  // Known malicious file signatures
  private readonly maliciousSignatures = [
    '4D5A', // PE executable
    '7F454C46', // ELF executable
    'FEEDFACE', // Mach-O binary
    'CEFAEDFE', // Mach-O binary (reverse)
  ];

  // Suspicious content patterns
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
    /<script[^>]*>/i,
    /javascript:/i,
    /vbscript:/i,
    /onload\s*=/i,
    /onerror\s*=/i,
    /<iframe[^>]*>/i,
    /<object[^>]*>/i,
    /<embed[^>]*>/i,
  ];

  // Dangerous file extensions
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
    '.zip',
    '.rar',
    '.7z',
    '.tar',
    '.gz', // Archive files that could contain malicious content
  ];

  /**
   * Perform comprehensive security scan on uploaded file
   */
  async performSecurityScan(file: {
    originalname: string;
    buffer: Buffer;
    mimetype: string;
    size: number;
  }): Promise<FileSecurityResult> {
    const threats: string[] = [];
    const recommendations: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

    // 1. File signature analysis
    const signatureResult = await this.analyzeFileSignature(file.buffer);
    if (!signatureResult.isSafe) {
      threats.push(...signatureResult.threats);
      riskLevel = this.updateRiskLevel(riskLevel, signatureResult.riskLevel);
    }

    // 2. Content analysis
    const contentResult = await this.analyzeFileContent(file);
    if (!contentResult.isSafe) {
      threats.push(...contentResult.threats);
      riskLevel = this.updateRiskLevel(riskLevel, contentResult.riskLevel);
    }

    // 3. Metadata analysis
    const metadataResult = await this.analyzeFileMetadata(file);
    if (!metadataResult.isSafe) {
      threats.push(...metadataResult.threats);
      riskLevel = this.updateRiskLevel(riskLevel, metadataResult.riskLevel);
    }

    // 4. File name analysis
    const nameResult = await this.analyzeFileName(file.originalname);
    if (!nameResult.isSafe) {
      threats.push(...nameResult.threats);
      riskLevel = this.updateRiskLevel(riskLevel, nameResult.riskLevel);
    }

    // 5. Generate recommendations based on findings
    if (threats.length > 0) {
      recommendations.push('File should be quarantined for manual review');
      recommendations.push('Consider implementing additional virus scanning');
    }

    if (riskLevel === 'high' || riskLevel === 'critical') {
      recommendations.push('File should be immediately blocked');
      recommendations.push('Alert security team for investigation');
    }

    return {
      isSafe: threats.length === 0,
      riskLevel,
      threats,
      recommendations,
      scanResults: {
        virusScan: true, // Placeholder - would integrate with actual virus scanner
        malwareScan: true, // Placeholder - would integrate with actual malware scanner
        contentAnalysis: true,
        metadataAnalysis: true,
      },
    };
  }

  /**
   * Analyze file signature for malicious patterns
   */
  private async analyzeFileSignature(buffer: Buffer): Promise<{
    isSafe: boolean;
    threats: string[];
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  }> {
    const threats: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

    if (buffer.length < 4) {
      return { isSafe: true, threats: [], riskLevel: 'low' };
    }

    const signature = buffer.slice(0, 8).toString('hex').toUpperCase();

    // Check for executable signatures
    for (const maliciousSig of this.maliciousSignatures) {
      if (signature.startsWith(maliciousSig)) {
        threats.push('File contains executable signature');
        riskLevel = 'critical';
        break;
      }
    }

    // Check for suspicious file headers
    if (signature.startsWith('4D5A')) {
      // PE executable
      threats.push('File appears to be a Windows executable');
      riskLevel = 'critical';
    }

    if (signature.startsWith('7F454C46')) {
      // ELF executable
      threats.push('File appears to be a Linux executable');
      riskLevel = 'critical';
    }

    return {
      isSafe: threats.length === 0,
      threats,
      riskLevel,
    };
  }

  /**
   * Analyze file content for malicious patterns
   */
  private async analyzeFileContent(file: {
    buffer: Buffer;
    mimetype: string;
    originalname: string;
  }): Promise<{
    isSafe: boolean;
    threats: string[];
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  }> {
    const threats: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

    // Convert buffer to string for pattern matching (limit to first 1MB for performance)
    const content = file.buffer.toString(
      'utf8',
      0,
      Math.min(file.buffer.length, 1024 * 1024),
    );

    // Check for suspicious patterns
    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(content)) {
        threats.push('File contains suspicious content patterns');
        riskLevel = this.updateRiskLevel(riskLevel, 'high');
        break;
      }
    }

    // Check for embedded scripts
    if (/<script[^>]*>/i.test(content)) {
      threats.push('File contains embedded JavaScript');
      riskLevel = this.updateRiskLevel(riskLevel, 'high');
    }

    // Check for PHP code
    if (/<\?php/i.test(content) || /<\?=/i.test(content)) {
      threats.push('File contains PHP code');
      riskLevel = this.updateRiskLevel(riskLevel, 'critical');
    }

    // Check for SQL injection patterns
    const sqlPatterns = [
      /union\s+select/i,
      /drop\s+table/i,
      /delete\s+from/i,
      /insert\s+into/i,
      /update\s+set/i,
    ];

    for (const pattern of sqlPatterns) {
      if (pattern.test(content)) {
        threats.push('File contains SQL injection patterns');
        riskLevel = this.updateRiskLevel(riskLevel, 'high');
        break;
      }
    }

    // Check for base64 encoded content (potential obfuscation)
    const base64Pattern = /[A-Za-z0-9+/]{100,}={0,2}/;
    if (base64Pattern.test(content)) {
      threats.push('File contains suspicious base64 encoded content');
      riskLevel = this.updateRiskLevel(riskLevel, 'medium');
    }

    return {
      isSafe: threats.length === 0,
      threats,
      riskLevel,
    };
  }

  /**
   * Analyze file metadata for security issues
   */
  private async analyzeFileMetadata(file: {
    originalname: string;
    buffer: Buffer;
    mimetype: string;
    size: number;
  }): Promise<{
    isSafe: boolean;
    threats: string[];
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  }> {
    const threats: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

    // Check file size anomalies
    if (file.size === 0) {
      threats.push('File has zero size');
      riskLevel = this.updateRiskLevel(riskLevel, 'medium');
    }

    if (file.size > 500 * 1024 * 1024) {
      // 500MB
      threats.push('File size is unusually large');
      riskLevel = this.updateRiskLevel(riskLevel, 'medium');
    }

    // Check MIME type anomalies
    const extension = this.getFileExtension(file.originalname);
    if (!this.isMimeTypeExtensionMatch(file.mimetype, extension)) {
      threats.push('MIME type does not match file extension');
      riskLevel = this.updateRiskLevel(riskLevel, 'high');
    }

    // Check for suspicious MIME types
    const suspiciousMimeTypes = [
      'application/x-executable',
      'application/x-msdownload',
      'application/x-msdos-program',
      'application/x-php',
      'text/x-php',
    ];

    if (suspiciousMimeTypes.includes(file.mimetype.toLowerCase())) {
      threats.push('File has suspicious MIME type');
      riskLevel = this.updateRiskLevel(riskLevel, 'critical');
    }

    return {
      isSafe: threats.length === 0,
      threats,
      riskLevel,
    };
  }

  /**
   * Analyze file name for security issues
   */
  private async analyzeFileName(filename: string): Promise<{
    isSafe: boolean;
    threats: string[];
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  }> {
    const threats: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

    if (!filename || filename.trim() === '') {
      threats.push('File name is empty');
      riskLevel = this.updateRiskLevel(riskLevel, 'medium');
      return { isSafe: false, threats, riskLevel };
    }

    const extension = this.getFileExtension(filename);

    // Check for dangerous extensions
    if (this.dangerousExtensions.includes(extension.toLowerCase())) {
      threats.push('File has dangerous extension');
      riskLevel = this.updateRiskLevel(riskLevel, 'critical');
    }

    // Check for double extensions (potential security risk)
    const doubleExtensionPattern = /\.[^.]+\.[^.]+\.[^.]/;
    if (doubleExtensionPattern.test(filename)) {
      threats.push('File has multiple extensions (potential security risk)');
      riskLevel = this.updateRiskLevel(riskLevel, 'high');
    }

    // Check for suspicious characters in filename
    const suspiciousChars = /[<>:"/\\|?*]/;
    const hasControlChars = filename.split('').some((char) => {
      const code = char.charCodeAt(0);
      return code >= 0 && code <= 31;
    });
    if (suspiciousChars.test(filename) || hasControlChars) {
      threats.push('File name contains suspicious characters');
      riskLevel = this.updateRiskLevel(riskLevel, 'medium');
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
      threats.push('File name is reserved by the system');
      riskLevel = this.updateRiskLevel(riskLevel, 'medium');
    }

    // Check for suspicious patterns in filename
    const suspiciousNamePatterns = [
      /\.(exe|bat|cmd|com|pif|scr|vbs|js|jar)$/i,
      /\.(php|asp|jsp|py|rb|pl|sh|ps1)$/i,
      /\.(dll|sys|drv|msi|deb|rpm|app|dmg)$/i,
    ];

    for (const pattern of suspiciousNamePatterns) {
      if (pattern.test(filename)) {
        threats.push('File name contains suspicious extension');
        riskLevel = this.updateRiskLevel(riskLevel, 'high');
        break;
      }
    }

    return {
      isSafe: threats.length === 0,
      threats,
      riskLevel,
    };
  }

  /**
   * Generate file hash for tracking
   */
  generateFileHash(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Check if file is in quarantine list
   */
  async isFileQuarantined(): Promise<boolean> {
    // In a real implementation, this would check against a database of quarantined files
    // For now, we'll return false
    return false;
  }

  /**
   * Add file to quarantine list
   */
  async quarantineFile(hash: string, reason: string): Promise<void> {
    this.logger.warn(`File quarantined: ${hash} - Reason: ${reason}`);
    // In a real implementation, this would add the file to a quarantine database
  }

  // Helper methods
  private getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  private isMimeTypeExtensionMatch(
    mimeType: string,
    extension: string,
  ): boolean {
    const mimeTypeMap: { [key: string]: string[] } = {
      'image/jpeg': ['jpg', 'jpeg'],
      'image/png': ['png'],
      'image/gif': ['gif'],
      'image/webp': ['webp'],
      'application/pdf': ['pdf'],
      'application/msword': ['doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        ['docx'],
    };

    const expectedExtensions = mimeTypeMap[mimeType.toLowerCase()];
    return expectedExtensions ? expectedExtensions.includes(extension) : true;
  }

  private updateRiskLevel(
    current: 'low' | 'medium' | 'high' | 'critical',
    newLevel: 'low' | 'medium' | 'high' | 'critical',
  ): 'low' | 'medium' | 'high' | 'critical' {
    const levels = { low: 1, medium: 2, high: 3, critical: 4 };
    return levels[newLevel] > levels[current] ? newLevel : current;
  }
}
