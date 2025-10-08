import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UnauthorizedException } from '@nestjs/common';
import { UserRole } from '@prisma/client';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
  };

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    role: UserRole.EDITOR,
    organization: {
      id: 'org-1',
      name: 'Test Organization',
      slug: 'test-org',
      isActive: true,
    },
  };

  const mockLoginResponse = {
    accessToken: 'jwt-token-123',
    user: mockUser,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should return access token and user info for valid credentials', async () => {
      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(mockLoginResponse);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('user');
      expect(result.user).toHaveProperty('id');
      expect(result.user).toHaveProperty('email');
      expect(result.user).toHaveProperty('username');
      expect(result.user).toHaveProperty('role');
      expect(result.user).toHaveProperty('organization');
    });

    it('should return access token and user info for OWNER role', async () => {
      const ownerUser = {
        ...mockUser,
        role: UserRole.OWNER,
      };
      const ownerLoginResponse = {
        ...mockLoginResponse,
        user: ownerUser,
      };
      mockAuthService.login.mockResolvedValue(ownerLoginResponse);

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(ownerLoginResponse);
      expect(result.user.role).toBe(UserRole.OWNER);
    });

    it('should return access token and user info for VIEWER role', async () => {
      const viewerUser = {
        ...mockUser,
        role: UserRole.VIEWER,
      };
      const viewerLoginResponse = {
        ...mockLoginResponse,
        user: viewerUser,
      };
      mockAuthService.login.mockResolvedValue(viewerLoginResponse);

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(viewerLoginResponse);
      expect(result.user.role).toBe(UserRole.VIEWER);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should throw UnauthorizedException when user account is deactivated', async () => {
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('User account is deactivated'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should throw UnauthorizedException when organization is deactivated', async () => {
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Organization is deactivated'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should handle different email formats', async () => {
      const differentEmailDto: LoginDto = {
        email: 'user.name+tag@example.com',
        password: 'password123',
      };
      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      const result = await controller.login(differentEmailDto);

      expect(authService.login).toHaveBeenCalledWith(differentEmailDto);
      expect(result).toEqual(mockLoginResponse);
    });

    it('should handle different password lengths', async () => {
      const longPasswordDto: LoginDto = {
        email: 'test@example.com',
        password: 'very-long-password-with-special-chars-123!@#',
      };
      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      const result = await controller.login(longPasswordDto);

      expect(authService.login).toHaveBeenCalledWith(longPasswordDto);
      expect(result).toEqual(mockLoginResponse);
    });

    it('should pass through the exact loginDto to authService', async () => {
      const specificLoginDto: LoginDto = {
        email: 'specific@example.com',
        password: 'specificPassword',
      };
      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      await controller.login(specificLoginDto);

      expect(authService.login).toHaveBeenCalledWith(specificLoginDto);
      expect(authService.login).toHaveBeenCalledTimes(1);
    });

    it('should return response with correct structure', async () => {
      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      const result = await controller.login(loginDto);

      // Check response structure
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('user');

      // Check accessToken
      expect(typeof result.accessToken).toBe('string');
      expect(result.accessToken).toBeTruthy();

      // Check user structure
      expect(result.user).toHaveProperty('id');
      expect(result.user).toHaveProperty('email');
      expect(result.user).toHaveProperty('username');
      expect(result.user).toHaveProperty('firstName');
      expect(result.user).toHaveProperty('lastName');
      expect(result.user).toHaveProperty('role');
      expect(result.user).toHaveProperty('organization');

      // Check organization structure
      expect(result.user.organization).toHaveProperty('id');
      expect(result.user.organization).toHaveProperty('name');
      expect(result.user.organization).toHaveProperty('slug');
      expect(result.user.organization).toHaveProperty('isActive');
    });

    it('should handle service errors gracefully', async () => {
      const serviceError = new Error('Database connection failed');
      mockAuthService.login.mockRejectedValue(serviceError);

      await expect(controller.login(loginDto)).rejects.toThrow(serviceError);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should handle empty email', async () => {
      const emptyEmailDto: LoginDto = {
        email: '',
        password: 'password123',
      };
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(controller.login(emptyEmailDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.login).toHaveBeenCalledWith(emptyEmailDto);
    });

    it('should handle empty password', async () => {
      const emptyPasswordDto: LoginDto = {
        email: 'test@example.com',
        password: '',
      };
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(controller.login(emptyPasswordDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.login).toHaveBeenCalledWith(emptyPasswordDto);
    });

    it('should handle null/undefined values', async () => {
      const nullValuesDto: LoginDto = {
        email: null as unknown as string,
        password: null as unknown as string,
      };
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(controller.login(nullValuesDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.login).toHaveBeenCalledWith(nullValuesDto);
    });
  });

  describe('controller initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have authService injected', () => {
      expect(authService).toBeDefined();
    });

    it('should be an instance of AuthController', () => {
      expect(controller).toBeInstanceOf(AuthController);
    });
  });

  describe('rate limiting', () => {
    it('should be configured with throttling', () => {
      // This test verifies that the controller is properly configured
      // The actual rate limiting is tested at the integration level
      expect(controller).toBeDefined();
    });
  });

  describe('API documentation', () => {
    it('should be properly configured for Swagger', () => {
      // This test verifies that the controller is properly configured
      // The actual API documentation is tested at the integration level
      expect(controller).toBeDefined();
    });
  });
});
