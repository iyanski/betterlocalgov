import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { PasswordComplexityValidator } from '../utils/password-complexity-validator';

@ValidatorConstraint({ name: 'passwordComplexity', async: false })
export class PasswordComplexityConstraint
  implements ValidatorConstraintInterface
{
  private readonly validator = new PasswordComplexityValidator();

  validate(password: string, args: ValidationArguments): boolean {
    if (!password) {
      return false;
    }

    // Get user information from the object being validated
    const obj = args.object as Record<string, unknown>;
    const userInfo = {
      email: obj.email as string,
      username: obj.username as string,
      firstName: obj.firstName as string,
      lastName: obj.lastName as string,
    };

    const result = this.validator.validateForUserCreation(
      password as string,
      userInfo,
    );
    return result.isValid;
  }

  defaultMessage(args: ValidationArguments): string {
    const password = args.value;
    if (!password) {
      return 'Password is required';
    }

    const obj = args.object as Record<string, unknown>;
    const userInfo = {
      email: obj.email as string,
      username: obj.username as string,
      firstName: obj.firstName as string,
      lastName: obj.lastName as string,
    };

    const result = this.validator.validateForUserCreation(
      password as string,
      userInfo,
    );

    if (result.errors.length > 0) {
      return result.errors.join(', ');
    }

    return 'Password does not meet complexity requirements';
  }
}

export function IsPasswordComplex(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: PasswordComplexityConstraint,
    });
  };
}
