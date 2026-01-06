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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserEntity } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
    });
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
