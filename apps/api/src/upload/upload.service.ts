import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { UploadResponseDto } from './dto/upload-response.dto';
import { UPLOAD_CONSTANTS, ALLOWED_MIME_TYPES } from './upload.constants';

type CloudinaryResourceType = 'image' | 'video' | 'raw';

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
    this.validateFile(file);

    try {
      const result = await this.uploadToCloudinary(file, folder);
      this.logger.log(`File uploaded: ${result.public_id}`);

      return this.mapToResponse(file, result);
    } catch (error) {
      this.logger.error('Upload failed', error);
      throw new BadRequestException('Failed to upload file');
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

  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > UPLOAD_CONSTANTS.MAX_FILE_SIZE) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype as (typeof ALLOWED_MIME_TYPES)[number])) {
      throw new BadRequestException(`File type ${file.mimetype} is not allowed`);
    }
  }

  private uploadToCloudinary(file: Express.Multer.File, folder: string): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const resourceType = this.getResourceType(file.mimetype);

      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: resourceType, access_mode: 'public' },
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
