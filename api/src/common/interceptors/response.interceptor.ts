import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponseDto } from '../dto/api-response.dto';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, unknown> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Generate request ID for tracking
    const requestId = this.generateRequestId();

    // Add request ID to response headers
    response.setHeader('X-Request-ID', requestId);

    return next.handle().pipe(
      map((data) => {
        // Skip transformation for certain endpoints (like auth)
        if (this.shouldSkipTransformation(request.url as string)) {
          return data;
        }

        // Handle all responses with standardized format
        return this.transformResponse(data);
      }),
    );
  }

  private shouldSkipTransformation(url: string): boolean {
    // Skip transformation for auth endpoints that have custom response format
    const skipPatterns = ['/auth/login', '/auth/register'];
    return skipPatterns.some((pattern) => url.includes(pattern));
  }

  private transformResponse(data: unknown): ApiResponseDto {
    // Determine if this is a paginated response
    const isPaginated =
      data &&
      typeof data === 'object' &&
      Array.isArray(data.data) &&
      data.pagination;

    if (isPaginated) {
      return {
        data: data.data,
        meta: {
          total: data.pagination.total,
          page: data.pagination.page,
          limit: data.pagination.limit,
          hasMore:
            data.pagination.page <
            Math.ceil(data.pagination.total / data.pagination.limit),
        },
        success: true,
        message: this.getSuccessMessage(data),
      };
    }

    // For single items or arrays without pagination
    const isArray = Array.isArray(data);
    return {
      data,
      meta: {
        total: isArray ? data.length : 1,
        page: 1,
        limit: isArray ? data.length : 1,
        hasMore: false,
      },
      success: true,
      message: this.getSuccessMessage(data),
    };
  }

  private getSuccessMessage(data: unknown): string {
    // Determine appropriate success message based on data type
    if (Array.isArray(data)) {
      return `Retrieved ${data.length} items successfully`;
    }

    if (data && typeof data === 'object') {
      if (data.id) {
        return 'Resource retrieved successfully';
      }
      if (
        data.createdAt &&
        data.updatedAt &&
        data.createdAt === data.updatedAt
      ) {
        return 'Resource created successfully';
      }
      if (data.updatedAt) {
        return 'Resource updated successfully';
      }
    }

    return 'Operation completed successfully';
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
