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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ServiceEntity } from './entities/service.entity';

@ApiTags('Services')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new service' })
  @ApiResponse({ status: 201, description: 'Service created successfully', type: ServiceEntity })
  create(@Body() createServiceDto: CreateServiceDto): Promise<ServiceEntity> {
    return this.servicesService.create(createServiceDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all services' })
  @ApiQuery({ name: 'churchId', required: false, description: 'Filter by church' })
  @ApiResponse({ status: 200, description: 'List of services', type: [ServiceEntity] })
  findAll(@Query('churchId') churchId?: string): Promise<ServiceEntity[]> {
    if (churchId) {
      return this.servicesService.findByChurch(churchId);
    }
    return this.servicesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a service by ID' })
  @ApiResponse({ status: 200, description: 'Service found', type: ServiceEntity })
  @ApiResponse({ status: 404, description: 'Service not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ServiceEntity> {
    return this.servicesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a service' })
  @ApiResponse({ status: 200, description: 'Service updated successfully', type: ServiceEntity })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ): Promise<ServiceEntity> {
    return this.servicesService.update(id, updateServiceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a service (soft delete)' })
  @ApiResponse({ status: 200, description: 'Service removed successfully' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.servicesService.remove(id);
  }
}
