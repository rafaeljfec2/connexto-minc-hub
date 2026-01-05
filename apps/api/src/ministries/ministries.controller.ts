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
  @ApiOperation({ summary: 'Criar um novo ministério' })
  @ApiResponse({ status: 201, description: 'Ministério criado com sucesso', type: MinistryEntity })
  create(@Body() createMinistryDto: CreateMinistryDto): Promise<MinistryEntity> {
    return this.ministriesService.create(createMinistryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os ministérios' })
  @ApiQuery({ name: 'churchId', required: false, description: 'Filtrar por igreja' })
  @ApiResponse({ status: 200, description: 'Lista de ministérios', type: [MinistryEntity] })
  findAll(@Query('churchId') churchId?: string): Promise<MinistryEntity[]> {
    if (churchId) {
      return this.ministriesService.findByChurch(churchId);
    }
    return this.ministriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter um ministério por ID' })
  @ApiResponse({ status: 200, description: 'Ministério encontrado', type: MinistryEntity })
  @ApiResponse({ status: 404, description: 'Ministério não encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<MinistryEntity> {
    return this.ministriesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um ministério' })
  @ApiResponse({ status: 200, description: 'Ministério atualizado com sucesso', type: MinistryEntity })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMinistryDto: UpdateMinistryDto,
  ): Promise<MinistryEntity> {
    return this.ministriesService.update(id, updateMinistryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover um ministério (soft delete)' })
  @ApiResponse({ status: 200, description: 'Ministério removido com sucesso' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.ministriesService.remove(id);
  }
}
