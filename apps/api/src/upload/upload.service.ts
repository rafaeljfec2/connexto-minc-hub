import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
  UploadApiOptions,
} from 'cloudinary';
import { UploadResponseDto } from './dto/upload-response.dto';
import {
  UPLOAD_CONSTANTS,
  ALLOWED_MIME_TYPES,
  AVATAR_CONSTANTS,
  AVATAR_ALLOWED_MIME_TYPES,
} from './upload.constants';

type CloudinaryResourceType = 'image' | 'video' | 'raw';

interface FileValidationOptions {
  readonly maxSize: number;
  readonly allowedTypes: readonly string[];
  readonly maxSizeLabel: string;
}

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(private readonly configService: ConfigService) {
    this.initCloudinary();
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = UPLOAD_CONSTANTS.DEFAULT_FOLDER,
  ): Promise<UploadResponseDto> {
    this.validateFileWithOptions(file, {
      maxSize: UPLOAD_CONSTANTS.MAX_FILE_SIZE,
      allowedTypes: ALLOWED_MIME_TYPES,
      maxSizeLabel: '10MB',
    });

    try {
      const options: UploadApiOptions = {
        folder,
        resource_type: this.getResourceType(file.mimetype),
        access_mode: 'public',
      };
      const result = await this.executeUpload(file, options);
      this.logger.log(`File uploaded: ${result.public_id}`);
      return this.mapToResponse(file, result);
    } catch (error) {
      this.logger.error('Upload failed', error);
      throw new BadRequestException('Failed to upload file');
    }
  }

  async uploadAvatar(file: Express.Multer.File, userId: string): Promise<string> {
    this.validateFileWithOptions(file, {
      maxSize: AVATAR_CONSTANTS.MAX_FILE_SIZE,
      allowedTypes: AVATAR_ALLOWED_MIME_TYPES,
      maxSizeLabel: '5MB',
    });

    try {
      const options: UploadApiOptions = {
        folder: `${AVATAR_CONSTANTS.FOLDER}/${userId}`,
        resource_type: 'image',
        access_mode: 'public',
        transformation: [
          {
            width: AVATAR_CONSTANTS.WIDTH,
            height: AVATAR_CONSTANTS.HEIGHT,
            crop: 'fill',
            gravity: 'face',
          },
          { format: 'webp', quality: 'auto' },
        ],
      };
      const result = await this.executeUpload(file, options);
      this.logger.log(`Avatar uploaded for user ${userId}: ${result.public_id}`);
      return result.secure_url;
    } catch (error) {
      this.logger.error(`Avatar upload failed for user ${userId}`, error);
      throw new BadRequestException('Failed to upload avatar');
    }
  }

  async deleteFile(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
      this.logger.log(`File deleted: ${publicId}`);
    } catch (error) {
      this.logger.error(`Delete failed: ${publicId}`, error);
      throw new BadRequestException('Failed to delete file');
    }
  }

  private initCloudinary(): void {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  private validateFileWithOptions(file: Express.Multer.File, options: FileValidationOptions): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > options.maxSize) {
      throw new BadRequestException(`File size exceeds ${options.maxSizeLabel} limit`);
    }

    if (!options.allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(`File type ${file.mimetype} is not allowed`);
    }
  }

  private executeUpload(
    file: Express.Multer.File,
    options: UploadApiOptions,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        options,
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) {
            reject(new Error(error.message ?? 'Upload failed'));
          } else if (result) {
            resolve(result);
          } else {
            reject(new Error('Upload failed with no result'));
          }
        },
      );
      uploadStream.end(file.buffer);
    });
  }

  private getResourceType(mimeType: string): CloudinaryResourceType {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/') || mimeType.startsWith('audio/')) return 'video';
    return 'raw';
  }

  private mapToResponse(file: Express.Multer.File, result: UploadApiResponse): UploadResponseDto {
    return {
      url: result.secure_url,
      publicId: result.public_id,
      originalName: file.originalname,
      format: result.format ?? this.getExtension(file.originalname),
      bytes: result.bytes,
      mimeType: file.mimetype,
    };
  }

  private getExtension(filename: string): string {
    return filename.split('.').at(-1) ?? '';
  }
}
