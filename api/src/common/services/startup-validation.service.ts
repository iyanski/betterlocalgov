import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtSecretValidator } from '../utils/jwt-secret-validator';

@Injectable()
export class StartupValidationService implements OnModuleInit {
  private readonly logger = new Logger(StartupValidationService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtSecretValidator: JwtSecretValidator,
  ) {}

  async onModuleInit() {
    this.logger.log('🔍 Starting application security validation...');

    try {
      await this.validateJwtSecret();
      this.logger.log(
        '✅ Application security validation completed successfully',
      );
    } catch (error) {
      this.logger.error(
        '❌ Application security validation failed:',
        error.message,
      );
      throw error;
    }
  }

  private async validateJwtSecret(): Promise<void> {
    const jwtSecret = this.configService.get<string>('JWT_SECRET');

    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }

    this.logger.log('🔐 Validating JWT secret strength...');
    this.jwtSecretValidator.validateOnStartup(jwtSecret);
  }
}
