import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { UploadResponseDto } from './dto/upload-response.dto';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(private readonly configService: ConfigService) {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'chat-attachments',
  ): Promise<UploadResponseDto> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    // Validate file type
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'video/mp4',
      'video/quicktime',
      'audio/mpeg',
      'audio/wav',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(`File type ${file.mimetype} is not allowed`);
    }

    try {
      const result = await this.uploadToCloudinary(file, folder);

      this.logger.log(`File uploaded successfully: ${result.public_id}`);

      return {
        url: result.secure_url,
        publicId: result.public_id,
        originalName: file.originalname,
        format: result.format || this.getExtension(file.originalname),
        bytes: result.bytes,
        mimeType: file.mimetype,
      };
    } catch (error) {
      this.logger.error('Failed to upload file to Cloudinary', error);
      throw new BadRequestException('Failed to upload file');
    }
  }

  async deleteFile(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
      this.logger.log(`File deleted successfully: ${publicId}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${publicId}`, error);
      throw new BadRequestException('Failed to delete file');
    }
  }

  private uploadToCloudinary(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      // Determine resource type based on mime type
      let resourceType: 'image' | 'video' | 'raw' | 'auto';
      if (file.mimetype.startsWith('image/')) {
        resourceType = 'image';
      } else if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('audio/')) {
        resourceType = 'video';
      } else {
        resourceType = 'raw';
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
          access_mode: 'public',
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) {
            reject(new Error(error.message || 'Upload failed'));
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

  private getExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? (parts.at(-1) ?? '') : '';
  }
}
