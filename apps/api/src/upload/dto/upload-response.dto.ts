import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
  @ApiProperty({ description: 'URL of the uploaded file' })
  url: string;

  @ApiProperty({ description: 'Cloudinary public ID' })
  publicId: string;

  @ApiProperty({ description: 'Original file name' })
  originalName: string;

  @ApiProperty({ description: 'File format/extension' })
  format: string;

  @ApiProperty({ description: 'File size in bytes' })
  bytes: number;

  @ApiProperty({ description: 'MIME type of the file' })
  mimeType: string;
}
