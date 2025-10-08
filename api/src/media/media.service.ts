import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateMediaDto } from './dto/update-media.dto';
import { FileValidationService } from '../common/services/file-validation.service';
import { FileSecurityService } from '../common/services/file-security.service';
import * as fs from 'fs';
import * as path from 'path';

export interface UploadedFile {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
  size: number;
}

@Injectable()
export class MediaService {
  constructor(
    private prisma: PrismaService,
    private fileValidationService: FileValidationService,
    private fileSecurityService: FileSecurityService,
  ) {}

  async create(file: UploadedFile, userId: string, organizationId: string) {
    // 1. Validate file
    const validationResult =
      await this.fileValidationService.validateFile(file);
    if (!validationResult.isValid) {
      throw new BadRequestException(
        `File validation failed: ${validationResult.errors.join(', ')}`,
      );
    }

    // 2. Perform security scan
    const securityResult =
      await this.fileSecurityService.performSecurityScan(file);
    if (!securityResult.isSafe) {
      throw new BadRequestException(
        `File security scan failed: ${securityResult.threats.join(', ')}`,
      );
    }

    // 3. Check if file is quarantined
    const fileHash = this.fileSecurityService.generateFileHash(file.buffer);
    const isQuarantined = await this.fileSecurityService.isFileQuarantined();
    if (isQuarantined) {
      throw new BadRequestException(
        'File is quarantined and cannot be uploaded',
      );
    }

    // 4. Quarantine file if high risk
    if (
      securityResult.riskLevel === 'high' ||
      securityResult.riskLevel === 'critical'
    ) {
      await this.fileSecurityService.quarantineFile(
        fileHash,
        securityResult.threats.join(', '),
      );
      throw new BadRequestException(
        'File has been quarantined due to security concerns',
      );
    }

    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(uploadPath, fileName);

    // Ensure upload directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    // Save file
    fs.writeFileSync(filePath, file.buffer);

    // Get image dimensions if it's an image
    let width: number | undefined;
    let height: number | undefined;

    if (file.mimetype.startsWith('image/')) {
      // For simplicity, we'll set default dimensions
      // In a real implementation, you'd use a library like sharp to get actual dimensions
      width = 800;
      height = 600;
    }

    const media = await this.prisma.media.create({
      data: {
        filename: fileName,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: filePath,
        url: `/uploads/${fileName}`,
        width,
        height,
        organizationId,
        createdBy: userId,
        updatedBy: userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        updater: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return media;
  }

  async findAll(
    organizationId: string,
    query?: { limit?: number; offset?: number },
  ) {
    const limit = query?.limit || 20;
    const offset = query?.offset || 0;

    const [media, total] = await Promise.all([
      this.prisma.media.findMany({
        where: { organizationId },
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
          updater: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prisma.media.count({
        where: { organizationId },
      }),
    ]);

    return {
      media,
      total,
      limit,
      offset,
    };
  }

  async findOne(id: string) {
    const media = await this.prisma.media.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        updater: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    return media;
  }

  async update(id: string, updateMediaDto: UpdateMediaDto, userId: string) {
    const media = await this.prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    return this.prisma.media.update({
      where: { id },
      data: {
        ...updateMediaDto,
        updatedBy: userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        updater: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const media = await this.prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    // Delete file from filesystem
    try {
      if (fs.existsSync(media.path)) {
        fs.unlinkSync(media.path);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }

    await this.prisma.media.delete({
      where: { id },
    });

    return { message: 'Media deleted successfully' };
  }
}
