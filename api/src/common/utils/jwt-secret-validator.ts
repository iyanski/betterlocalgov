import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class JwtSecretValidator {
  private readonly logger = new Logger(JwtSecretValidator.name);

  /**
   * Validates JWT secret strength and security requirements
   * @param secret - The JWT secret to validate
   * @returns Object with validation results
   */
  validateJwtSecret(secret: string): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    let strength: 'weak' | 'medium' | 'strong' | 'very-strong' = 'weak';

    // Check if secret exists
    if (!secret) {
      errors.push('JWT_SECRET is not defined');
      return { isValid: false, errors, warnings, strength };
    }

    // Check minimum length
    if (secret.length < 32) {
      errors.push('JWT_SECRET must be at least 32 characters long');
    } else if (secret.length < 64) {
      warnings.push(
        'JWT_SECRET should be at least 64 characters for production',
      );
    }

    // Check for common weak secrets
    const commonWeakSecrets = [
      'secret',
      'password',
      '123456',
      'jwt-secret',
      'my-secret',
      'admin',
      'test',
      'development',
      'jwt',
      'token',
      'key',
      'auth',
      'login',
      'api',
      'backend',
      'server',
      'app',
      'web',
      'site',
      'default',
    ];

    const lowerSecret = secret.toLowerCase();
    if (commonWeakSecrets.some((weak) => lowerSecret.includes(weak))) {
      errors.push('JWT_SECRET contains common weak patterns');
    }

    // Check for environment-specific weak secrets
    if (
      lowerSecret.includes('dev') ||
      lowerSecret.includes('test') ||
      lowerSecret.includes('local')
    ) {
      warnings.push('JWT_SECRET appears to contain development/test patterns');
    }

    // Check character diversity
    const hasUppercase = /[A-Z]/.test(secret);
    const hasLowercase = /[a-z]/.test(secret);
    const hasNumbers = /\d/.test(secret);
    const hasSpecialChars = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(
      secret,
    );

    let diversityScore = 0;
    if (hasUppercase) diversityScore++;
    if (hasLowercase) diversityScore++;
    if (hasNumbers) diversityScore++;
    if (hasSpecialChars) diversityScore++;

    if (diversityScore < 3) {
      errors.push(
        'JWT_SECRET must contain at least 3 character types (uppercase, lowercase, numbers, special)',
      );
    } else if (diversityScore === 3) {
      warnings.push(
        'JWT_SECRET should include special characters for maximum security',
      );
    }

    // Check for repeated patterns
    const repeatedPatterns = this.findRepeatedPatterns(secret);
    if (repeatedPatterns.length > 0) {
      warnings.push(
        'JWT_SECRET contains repeated patterns which may reduce security',
      );
    }

    // Calculate strength based on length and complexity
    if (secret.length >= 128 && diversityScore === 4) {
      strength = 'very-strong';
    } else if (secret.length >= 64 && diversityScore >= 3) {
      strength = 'strong';
    } else if (secret.length >= 32 && diversityScore >= 2) {
      strength = 'medium';
    }

    // Production environment checks
    if (process.env.NODE_ENV === 'production') {
      if (secret.length < 64) {
        errors.push('JWT_SECRET must be at least 64 characters in production');
      }
      if (diversityScore < 4) {
        errors.push('JWT_SECRET must use all character types in production');
      }
      if (strength === 'weak' || strength === 'medium') {
        errors.push('JWT_SECRET strength is insufficient for production');
      }
    }

    const isValid = errors.length === 0;

    return {
      isValid,
      errors,
      warnings,
      strength,
    };
  }

  /**
   * Generates a cryptographically secure JWT secret
   * @param length - Length of the secret (default: 64)
   * @returns A secure JWT secret
   */
  generateSecureJwtSecret(length: number = 64): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Validates and logs JWT secret on application startup
   * @param secret - The JWT secret to validate
   */
  validateOnStartup(secret: string): void {
    const validation = this.validateJwtSecret(secret);

    if (!validation.isValid) {
      this.logger.error('❌ JWT Secret Validation Failed:');
      validation.errors.forEach((error) => {
        this.logger.error(`   - ${error}`);
      });
      throw new Error(
        'JWT_SECRET validation failed. Please check the errors above.',
      );
    }

    if (validation.warnings.length > 0) {
      this.logger.warn('⚠️ JWT Secret Validation Warnings:');
      validation.warnings.forEach((warning) => {
        this.logger.warn(`   - ${warning}`);
      });
    }

    this.logger.log(
      `✅ JWT Secret Validation Passed (Strength: ${validation.strength})`,
    );

    if (validation.strength === 'weak' || validation.strength === 'medium') {
      this.logger.warn(
        '💡 Consider using a stronger JWT secret for better security',
      );
      this.logger.log(
        `   Generated secure secret: ${this.generateSecureJwtSecret()}`,
      );
    }
  }

  /**
   * Finds repeated patterns in the secret
   * @param secret - The secret to analyze
   * @returns Array of repeated patterns
   */
  private findRepeatedPatterns(secret: string): string[] {
    const patterns: string[] = [];
    const minPatternLength = 3;
    const maxPatternLength = Math.floor(secret.length / 2);

    for (let length = minPatternLength; length <= maxPatternLength; length++) {
      for (let i = 0; i <= secret.length - length * 2; i++) {
        const pattern = secret.substring(i, i + length);
        const remaining = secret.substring(i + length);
        if (remaining.includes(pattern)) {
          patterns.push(pattern);
        }
      }
    }

    return [...new Set(patterns)]; // Remove duplicates
  }
}
