import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

export interface PasswordComplexityResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  score: number; // 0-100
}

@Injectable()
export class PasswordComplexityValidator {
  private readonly logger = new Logger(PasswordComplexityValidator.name);

  /**
   * Validates password complexity and strength
   * @param password - The password to validate
   * @param options - Optional validation options
   * @returns Object with validation results
   */
  validatePasswordComplexity(
    password: string,
    options: {
      minLength?: number;
      maxLength?: number;
      requireUppercase?: boolean;
      requireLowercase?: boolean;
      requireNumbers?: boolean;
      requireSpecialChars?: boolean;
      preventCommonPasswords?: boolean;
      preventUserInfo?: boolean;
      userInfo?: {
        email?: string;
        username?: string;
        firstName?: string;
        lastName?: string;
      };
    } = {},
  ): PasswordComplexityResult {
    const {
      minLength = 8,
      maxLength = 128,
      requireUppercase = true,
      requireLowercase = true,
      requireNumbers = true,
      requireSpecialChars = true,
      preventCommonPasswords = true,
      preventUserInfo = true,
      userInfo = {},
    } = options;

    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 0;

    // Check if password exists
    if (!password) {
      errors.push('Password is required');
      return { isValid: false, errors, warnings, strength: 'weak', score: 0 };
    }

    // Length validation
    if (password.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters long`);
    } else if (password.length < 12) {
      warnings.push(
        'Password should be at least 12 characters for better security',
      );
    }

    if (password.length > maxLength) {
      errors.push(`Password must be no more than ${maxLength} characters long`);
    }

    // Character type validation
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(
      password,
    );

    if (requireUppercase && !hasUppercase) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (requireLowercase && !hasLowercase) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (requireNumbers && !hasNumbers) {
      errors.push('Password must contain at least one number');
    }

    if (requireSpecialChars && !hasSpecialChars) {
      errors.push('Password must contain at least one special character');
    }

    // Calculate complexity score
    let complexityScore = 0;
    if (hasUppercase) complexityScore += 1;
    if (hasLowercase) complexityScore += 1;
    if (hasNumbers) complexityScore += 1;
    if (hasSpecialChars) complexityScore += 1;

    // Length score (0-40 points)
    const lengthScore = Math.min(40, (password.length - 8) * 2);
    score += lengthScore;

    // Character diversity score (0-40 points)
    const diversityScore = complexityScore * 10;
    score += diversityScore;

    // Pattern analysis
    const repeatedChars = this.findRepeatedCharacters(password);
    if (repeatedChars.length > 0) {
      warnings.push(
        'Password contains repeated characters which may reduce security',
      );
      score -= repeatedChars.length * 2;
    }

    // Sequential patterns
    const sequentialPatterns = this.findSequentialPatterns(password);
    if (sequentialPatterns.length > 0) {
      warnings.push(
        'Password contains sequential patterns which may reduce security',
      );
      score -= sequentialPatterns.length * 3;
    }

    // Common password detection
    if (preventCommonPasswords) {
      const commonPasswords = [
        'password',
        '123456',
        'password123',
        'admin',
        'qwerty',
        'letmein',
        'welcome',
        'monkey',
        '1234567890',
        'abc123',
        'password1',
        '12345678',
        'welcome123',
        'admin123',
        'root',
        'toor',
        'pass',
        'test',
        'guest',
        'user',
        'login',
        'secret',
        'changeme',
        'default',
        'temp',
        'temporary',
        'newpassword',
        'newpass',
        'changepassword',
        'reset',
        'reset123',
        'forgot',
        'forgotpassword',
        'remember',
        'rememberme',
        'stayloggedin',
        'autologin',
        'autologon',
        'autopass',
        'autopassword',
      ];

      const lowerPassword = password.toLowerCase();
      if (commonPasswords.some((common) => lowerPassword.includes(common))) {
        errors.push(
          'Password contains common patterns that are easily guessed',
        );
        score -= 20;
      }
    }

    // User information detection
    if (preventUserInfo && userInfo) {
      const userInfoFields = [
        userInfo.email?.split('@')[0],
        userInfo.username,
        userInfo.firstName,
        userInfo.lastName,
      ].filter(Boolean);

      for (const field of userInfoFields) {
        if (field && password.toLowerCase().includes(field.toLowerCase())) {
          errors.push('Password should not contain personal information');
          score -= 15;
          break;
        }
      }
    }

    // Keyboard patterns
    const keyboardPatterns = this.findKeyboardPatterns(password);
    if (keyboardPatterns.length > 0) {
      warnings.push(
        'Password contains keyboard patterns which may reduce security',
      );
      score -= keyboardPatterns.length * 5;
    }

    // Ensure score is not negative
    score = Math.max(0, score);

    // Determine strength
    let strength: 'weak' | 'medium' | 'strong' | 'very-strong' = 'weak';
    if (score >= 80) {
      strength = 'very-strong';
    } else if (score >= 60) {
      strength = 'strong';
    } else if (score >= 40) {
      strength = 'medium';
    }

    // Additional strength requirements
    if (password.length < 8) {
      strength = 'weak';
    } else if (password.length < 12 && complexityScore < 3) {
      strength = 'medium';
    } else if (password.length >= 12 && complexityScore >= 3) {
      strength = 'strong';
    } else if (password.length >= 16 && complexityScore === 4) {
      strength = 'very-strong';
    }

    const isValid = errors.length === 0;

    return {
      isValid,
      errors,
      warnings,
      strength,
      score,
    };
  }

  /**
   * Validates password complexity for user creation
   * @param password - The password to validate
   * @param userInfo - User information to check against
   * @returns Validation result
   */
  validateForUserCreation(
    password: string,
    userInfo: {
      email?: string;
      username?: string;
      firstName?: string;
      lastName?: string;
    } = {},
  ): PasswordComplexityResult {
    return this.validatePasswordComplexity(password, {
      minLength: 8,
      maxLength: 128,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      preventCommonPasswords: true,
      preventUserInfo: true,
      userInfo,
    });
  }

  /**
   * Validates password complexity for password updates
   * @param password - The password to validate
   * @param userInfo - User information to check against
   * @returns Validation result
   */
  validateForPasswordUpdate(
    password: string,
    userInfo: {
      email?: string;
      username?: string;
      firstName?: string;
      lastName?: string;
    } = {},
  ): PasswordComplexityResult {
    return this.validatePasswordComplexity(password, {
      minLength: 8,
      maxLength: 128,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      preventCommonPasswords: true,
      preventUserInfo: true,
      userInfo,
    });
  }

  /**
   * Generates a secure password suggestion
   * @param length - Length of the password (default: 16)
   * @returns A secure password suggestion
   */
  generateSecurePassword(length: number = 16): string {
    const charset =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?~`';
    let password = '';

    // Ensure at least one character from each required type
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[crypto.randomInt(26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[crypto.randomInt(26)];
    password += '0123456789'[crypto.randomInt(10)];
    password += '!@#$%^&*()_+-=[]{}|;:,.<>?~`'[crypto.randomInt(32)];

    // Fill the rest with random characters
    for (let i = 4; i < length; i++) {
      password += charset[crypto.randomInt(charset.length)];
    }

    // Shuffle the password
    return password
      .split('')
      .sort(() => crypto.randomInt(3) - 1)
      .join('');
  }

  /**
   * Finds repeated characters in the password
   * @param password - The password to analyze
   * @returns Array of repeated characters
   */
  private findRepeatedCharacters(password: string): string[] {
    const repeated: string[] = [];
    const charCount: { [key: string]: number } = {};

    for (const char of password) {
      charCount[char] = (charCount[char] || 0) + 1;
      if (charCount[char] > 2) {
        repeated.push(char);
      }
    }

    return [...new Set(repeated)];
  }

  /**
   * Finds sequential patterns in the password
   * @param password - The password to analyze
   * @returns Array of sequential patterns
   */
  private findSequentialPatterns(password: string): string[] {
    const patterns: string[] = [];
    const sequences = [
      'abcdefghijklmnopqrstuvwxyz',
      'zyxwvutsrqponmlkjihgfedcba',
      '0123456789',
      '9876543210',
    ];

    for (const sequence of sequences) {
      for (let i = 0; i <= sequence.length - 3; i++) {
        const pattern = sequence.substring(i, i + 3);
        if (password.toLowerCase().includes(pattern)) {
          patterns.push(pattern);
        }
      }
    }

    return [...new Set(patterns)];
  }

  /**
   * Finds keyboard patterns in the password
   * @param password - The password to analyze
   * @returns Array of keyboard patterns
   */
  private findKeyboardPatterns(password: string): string[] {
    const patterns: string[] = [];
    const keyboardRows = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm', '1234567890'];

    for (const row of keyboardRows) {
      for (let i = 0; i <= row.length - 3; i++) {
        const pattern = row.substring(i, i + 3);
        if (password.toLowerCase().includes(pattern)) {
          patterns.push(pattern);
        }
      }
    }

    return [...new Set(patterns)];
  }
}
