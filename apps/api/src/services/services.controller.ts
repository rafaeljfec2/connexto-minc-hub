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
  @ApiOperation({ summary: 'Criar um novo culto/serviço' })
  @ApiResponse({ status: 201, description: 'Culto criado com sucesso', type: ServiceEntity })
  create(@Body() createServiceDto: CreateServiceDto): Promise<ServiceEntity> {
    return this.servicesService.create(createServiceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os cultos' })
  @ApiQuery({ name: 'churchId', required: false, description: 'Filtrar por igreja' })
  @ApiResponse({ status: 200, description: 'Lista de cultos', type: [ServiceEntity] })
  findAll(@Query('churchId') churchId?: string): Promise<ServiceEntity[]> {
    if (churchId) {
      return this.servicesService.findByChurch(churchId);
    }
    return this.servicesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter um culto por ID' })
  @ApiResponse({ status: 200, description: 'Culto encontrado', type: ServiceEntity })
  @ApiResponse({ status: 404, description: 'Culto não encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ServiceEntity> {
    return this.servicesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um culto' })
  @ApiResponse({ status: 200, description: 'Culto atualizado com sucesso', type: ServiceEntity })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ): Promise<ServiceEntity> {
    return this.servicesService.update(id, updateServiceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover um culto (soft delete)' })
  @ApiResponse({ status: 200, description: 'Culto removido com sucesso' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.servicesService.remove(id);
  }
}
