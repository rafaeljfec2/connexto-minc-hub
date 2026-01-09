import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
  @ApiProperty({
    example: 'https://res.cloudinary.com/xxx/image/upload/v1/chat-attachments/abc.jpg',
  })
  url: string;

  @ApiProperty({ example: 'chat-attachments/abc123' })
  publicId: string;

  @ApiProperty({ example: 'photo.jpg' })
  originalName: string;

  @ApiProperty({ example: 'jpg' })
  format: string;

  @ApiProperty({ example: 102400 })
  bytes: number;

  @ApiProperty({ example: 'image/jpeg' })
  mimeType: string;
}
