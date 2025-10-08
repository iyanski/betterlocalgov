import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { FileValidationService } from '../services/file-validation.service';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

@ValidatorConstraint({ async: true })
@Injectable()
export class IsFileValidConstraint implements ValidatorConstraintInterface {
  constructor(private readonly fileValidationService: FileValidationService) {}

  async validate(file: unknown, args: ValidationArguments) {
    if (!file) return true; // Let other validators handle required validation

    try {
      const validationResult = await this.fileValidationService.validateFile(
        file as {
          originalname: string;
          buffer: Buffer;
          mimetype: string;
          size: number;
        },
      );

      // Store validation result for error message generation
      (args.constraints[0] as Record<string, unknown>).validationResult =
        validationResult;

      return validationResult.isValid;
    } catch (error) {
      console.error('File validation error:', error);
      return false;
    }
  }

  private isValidationResult(obj: unknown): obj is ValidationResult {
    return (
      obj !== null &&
      typeof obj === 'object' &&
      'isValid' in obj &&
      'errors' in obj &&
      typeof (obj as Record<string, unknown>).isValid === 'boolean' &&
      Array.isArray((obj as Record<string, unknown>).errors)
    );
  }

  defaultMessage(args: ValidationArguments) {
    const constraint = args.constraints[0] as Record<string, unknown>;
    const validationResult = constraint.validationResult;

    if (
      this.isValidationResult(validationResult) &&
      validationResult.errors.length > 0
    ) {
      return validationResult.errors.join(', ');
    }
    return 'File validation failed';
  }
}

export function IsFileValid(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [{}], // Pass empty object to store validation result
      validator: IsFileValidConstraint,
    });
  };
}
