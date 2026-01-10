import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadService } from './upload.service';
import { UploadResponseDto } from './dto/upload-response.dto';
import { UPLOAD_CONSTANTS } from './upload.constants';

@ApiTags('Upload')
@Controller('upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('chat-file')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: UPLOAD_CONSTANTS.MAX_FILE_SIZE } }),
  )
  @ApiOperation({ summary: 'Upload a file for chat attachment' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload (max 10MB)',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'File uploaded successfully', type: UploadResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid file or file too large' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadChatFile(@UploadedFile() file: Express.Multer.File): Promise<UploadResponseDto> {
    return this.uploadService.uploadFile(file);
  }
}
