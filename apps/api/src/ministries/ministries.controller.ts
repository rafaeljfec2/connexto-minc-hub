import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MinistriesService } from './ministries.service';
import { CreateMinistryDto } from './dto/create-ministry.dto';
import { UpdateMinistryDto } from './dto/update-ministry.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MinistryEntity } from './entities/ministry.entity';

@ApiTags('Ministries')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ministries')
export class MinistriesController {
  constructor(private readonly ministriesService: MinistriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new ministry' })
  @ApiResponse({ status: 201, description: 'Ministry created successfully', type: MinistryEntity })
  create(@Body() createMinistryDto: CreateMinistryDto): Promise<MinistryEntity> {
    return this.ministriesService.create(createMinistryDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all ministries' })
  @ApiQuery({ name: 'churchId', required: false, description: 'Filter by church' })
  @ApiResponse({ status: 200, description: 'List of ministries', type: [MinistryEntity] })
  findAll(@Query('churchId') churchId?: string): Promise<MinistryEntity[]> {
    if (churchId) {
      return this.ministriesService.findByChurch(churchId);
    }
    return this.ministriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a ministry by ID' })
  @ApiResponse({ status: 200, description: 'Ministry found', type: MinistryEntity })
  @ApiResponse({ status: 404, description: 'Ministry not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<MinistryEntity> {
    return this.ministriesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a ministry' })
  @ApiResponse({ status: 200, description: 'Ministry updated successfully', type: MinistryEntity })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMinistryDto: UpdateMinistryDto,
  ): Promise<MinistryEntity> {
    return this.ministriesService.update(id, updateMinistryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a ministry (soft delete)' })
  @ApiResponse({ status: 200, description: 'Ministry removed successfully' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.ministriesService.remove(id);
  }
}
