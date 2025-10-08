import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { FileValidationService } from '../services/file-validation.service';

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

  defaultMessage(args: ValidationArguments) {
    const validationResult = (args.constraints[0] as Record<string, unknown>)
      .validationResult;
    if (validationResult && validationResult.errors.length > 0) {
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
