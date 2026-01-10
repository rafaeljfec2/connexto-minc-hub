import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  NotFoundException,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserEntity } from './entities/user.entity';
import { UploadService } from '../upload/upload.service';
import { GetUser } from '../common/decorators/get-user.decorator';
import { AVATAR_CONSTANTS } from '../upload/upload.constants';
import * as bcrypt from 'bcrypt';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully', type: UserEntity })
  @ApiResponse({ status: 409, description: 'User with this email already exists' })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserEntity> {
    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    return this.usersService.create({
      name: createUserDto.name,
      email: createUserDto.email,
      passwordHash,
      role: createUserDto.role,
      personId: createUserDto.personId ?? null,
      canCheckIn: createUserDto.canCheckIn,
    });
  }

  @Post('avatar')
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
          description: 'Avatar image file (jpg, jpeg, png, webp). Max 5MB.',
        },
      },
      required: ['avatar'],
    },
  })
  @ApiResponse({ status: 200, description: 'Avatar uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file or file too large' })
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: { fileSize: AVATAR_CONSTANTS.MAX_FILE_SIZE },
    }),
  )
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: UserEntity,
  ): Promise<{ avatarUrl: string }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const avatarUrl = await this.uploadService.uploadAvatar(file, user.id);
    await this.usersService.updateAvatar(user.id, avatarUrl);

    return { avatarUrl };
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully', type: UserEntity })
  async updateProfile(
    @GetUser() user: UserEntity,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    const updateData: Partial<UserEntity> = {};

    if (updateUserDto.name !== undefined) {
      updateData.name = updateUserDto.name;
    }
    if (updateUserDto.email !== undefined) {
      updateData.email = updateUserDto.email;
    }

    return this.usersService.update(user.id, updateData);
  }

  @Get()
  @ApiOperation({ summary: 'List all users' })
  @ApiResponse({ status: 200, description: 'List of users', type: [UserEntity] })
  findAll(): Promise<UserEntity[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({ status: 200, description: 'User found', type: UserEntity })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<UserEntity> {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200, description: 'User updated successfully', type: UserEntity })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    const updateData: Partial<UserEntity> = {
      name: updateUserDto.name,
      email: updateUserDto.email,
      role: updateUserDto.role,
      personId: updateUserDto.personId ?? null,
      canCheckIn: updateUserDto.canCheckIn,
    };

    // Only update password if provided
    if (updateUserDto.password) {
      updateData.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
    }

    return this.usersService.update(id, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a user (soft delete)' })
  @ApiResponse({ status: 200, description: 'User removed successfully' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.usersService.remove(id);
  }
}
