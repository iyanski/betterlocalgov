import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class ErrorResponseFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId =
      (response.getHeader('X-Request-ID') as string) ||
      this.generateRequestId();

    let status: number;
    let message: string;
    let errorCode: string = '';
    let details: string[] = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const responseObj = exceptionResponse as Record<string, unknown>;
        message = responseObj.message || exception.message;
        details = Array.isArray(responseObj.message) ? responseObj.message : [];
        errorCode =
          responseObj.errorCode || this.getErrorCodeFromStatus(status);
      } else {
        message = exception.message;
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      errorCode = 'INTERNAL_ERROR';
    }

    // Generate error code if not provided
    if (!errorCode) {
      errorCode = this.getErrorCodeFromStatus(status);
    }

    // Clean up details array
    if (details.length === 0 && message) {
      details = [message];
    }

    const errorResponse = {
      data: null,
      meta: {
        total: 0,
        page: 1,
        limit: 1,
        hasMore: false,
      },
      success: false,
      message: this.getUserFriendlyMessage(message),
      errorCode,
      details: details.length > 0 ? details : undefined,
    };

    // Log error for debugging
    console.error(`[${requestId}] Error:`, {
      status,
      message,
      errorCode,
      url: request.url,
      method: request.method,
      stack: exception instanceof Error ? exception.stack : undefined,
    });

    response.status(status).json(errorResponse);
  }

  private getErrorCodeFromStatus(status: number): string {
    const errorCodes: { [key: number]: string } = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'VALIDATION_ERROR',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_ERROR',
      502: 'BAD_GATEWAY',
      503: 'SERVICE_UNAVAILABLE',
    };

    return errorCodes[status] || 'UNKNOWN_ERROR';
  }

  private getUserFriendlyMessage(message: string): string {
    // Transform technical error messages into user-friendly ones
    const friendlyMessages: { [key: string]: string } = {
      'Invalid credentials': 'The email or password you entered is incorrect',
      'User account is deactivated':
        'Your account has been deactivated. Please contact support',
      'Organization is deactivated':
        'Your organization has been deactivated. Please contact support',
      'User with this email or username already exists':
        'An account with this email or username already exists',
      'You can only create users in your own organization':
        'You can only create users within your organization',
      'You can only view users in your own organization':
        'You can only view users within your organization',
      'You can only update users in your own organization':
        'You can only update users within your organization',
      'You can only delete users in your own organization':
        'You can only delete users within your organization',
      'You can only view your own profile':
        'You can only view your own profile',
      'You can only update your own profile':
        'You can only update your own profile',
      'You can only delete your own profile':
        'You can only delete your own profile',
      'You can only view content in your own organization':
        'You can only view content within your organization',
      'You can only create content in your own organization':
        'You can only create content within your organization',
      'You can only update content in your own organization':
        'You can only update content within your organization',
      'You can only delete content in your own organization':
        'You can only delete content within your organization',
      'You can only publish content in your own organization':
        'You can only publish content within your organization',
      'You can only view media in your own organization':
        'You can only view media within your organization',
      'You can only upload media to your own organization':
        'You can only upload media to your organization',
      'You can only update media in your own organization':
        'You can only update media within your organization',
      'You can only delete media in your own organization':
        'You can only delete media within your organization',
      'You can only view categories in your own organization':
        'You can only view categories within your organization',
      'You can only create categories in your own organization':
        'You can only create categories within your organization',
      'You can only update categories in your own organization':
        'You can only update categories within your organization',
      'You can only delete categories in your own organization':
        'You can only delete categories within your organization',
      'You can only view tags in your own organization':
        'You can only view tags within your organization',
      'You can only create tags in your own organization':
        'You can only create tags within your organization',
      'You can only update tags in your own organization':
        'You can only update tags within your organization',
      'You can only delete tags in your own organization':
        'You can only delete tags within your organization',
      'You can only view content types in your own organization':
        'You can only view content types within your organization',
      'You can only create content types in your own organization':
        'You can only create content types within your organization',
      'You can only update content types in your own organization':
        'You can only update content types within your organization',
      'You can only delete content types in your own organization':
        'You can only delete content types within your organization',
      'You can only view organizations': 'You can only view organizations',
      'You can only create organizations': 'You can only create organizations',
      'You can only update organizations': 'You can only update organizations',
      'You can only delete organizations': 'You can only delete organizations',
    };

    return friendlyMessages[message] || message;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
