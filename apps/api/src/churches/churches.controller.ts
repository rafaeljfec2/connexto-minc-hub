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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ChurchesService } from './churches.service';
import { CreateChurchDto } from './dto/create-church.dto';
import { UpdateChurchDto } from './dto/update-church.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChurchEntity } from './entities/church.entity';

@ApiTags('Churches')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('churches')
export class ChurchesController {
  constructor(private readonly churchesService: ChurchesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova igreja' })
  @ApiResponse({ status: 201, description: 'Igreja criada com sucesso', type: ChurchEntity })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  create(@Body() createChurchDto: CreateChurchDto): Promise<ChurchEntity> {
    return this.churchesService.create(createChurchDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as igrejas' })
  @ApiResponse({ status: 200, description: 'Lista de igrejas', type: [ChurchEntity] })
  findAll(): Promise<ChurchEntity[]> {
    return this.churchesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter uma igreja por ID' })
  @ApiResponse({ status: 200, description: 'Igreja encontrada', type: ChurchEntity })
  @ApiResponse({ status: 404, description: 'Igreja não encontrada' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ChurchEntity> {
    return this.churchesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma igreja' })
  @ApiResponse({ status: 200, description: 'Igreja atualizada com sucesso', type: ChurchEntity })
  @ApiResponse({ status: 404, description: 'Igreja não encontrada' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateChurchDto: UpdateChurchDto,
  ): Promise<ChurchEntity> {
    return this.churchesService.update(id, updateChurchDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma igreja (soft delete)' })
  @ApiResponse({ status: 200, description: 'Igreja removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Igreja não encontrada' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.churchesService.remove(id);
  }
}
