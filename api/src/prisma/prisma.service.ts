import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'event',
          level: 'info',
        },
        {
          emit: 'event',
          level: 'warn',
        },
      ],
    });

    // Add query performance monitoring
    (
      this as unknown as {
        $on: (
          event: string,
          callback: (e: {
            duration: number;
            query: string;
            params: string;
          }) => void,
        ) => void;
      }
    ).$on('query', (e: { duration: number; query: string; params: string }) => {
      const duration = e.duration;
      const query = e.query;
      const params = e.params;

      // Log slow queries (> 1000ms)
      if (duration > 1000) {
        this.logger.warn(`🐌 Slow query detected: ${duration}ms`);
        this.logger.warn(`Query: ${query}`);
        this.logger.warn(`Params: ${params}`);
      }

      // Log very slow queries (> 5000ms)
      if (duration > 5000) {
        this.logger.error(`🚨 Very slow query detected: ${duration}ms`);
        this.logger.error(`Query: ${query}`);
        this.logger.error(`Params: ${params}`);
      }
    });

    (
      this as unknown as {
        $on: (event: string, callback: (e: Error) => void) => void;
      }
    ).$on('error', (e: Error) => {
      this.logger.error('Database error:', e);
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('✅ Database connected successfully');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('✅ Database disconnected successfully');
  }
}
