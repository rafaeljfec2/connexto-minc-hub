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
import { PersonsService } from './persons.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PersonEntity } from './entities/person.entity';

@ApiTags('Persons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('persons')
export class PersonsController {
  constructor(private readonly personsService: PersonsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova pessoa/servo' })
  @ApiResponse({ status: 201, description: 'Pessoa criada com sucesso', type: PersonEntity })
  create(@Body() createPersonDto: CreatePersonDto): Promise<PersonEntity> {
    return this.personsService.create(createPersonDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as pessoas' })
  @ApiQuery({ name: 'ministryId', required: false, description: 'Filtrar por ministério' })
  @ApiQuery({ name: 'teamId', required: false, description: 'Filtrar por equipe' })
  @ApiResponse({ status: 200, description: 'Lista de pessoas', type: [PersonEntity] })
  findAll(
    @Query('ministryId') ministryId?: string,
    @Query('teamId') teamId?: string,
  ): Promise<PersonEntity[]> {
    if (teamId) {
      return this.personsService.findByTeam(teamId);
    }
    if (ministryId) {
      return this.personsService.findByMinistry(ministryId);
    }
    return this.personsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter uma pessoa por ID' })
  @ApiResponse({ status: 200, description: 'Pessoa encontrada', type: PersonEntity })
  @ApiResponse({ status: 404, description: 'Pessoa não encontrada' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<PersonEntity> {
    return this.personsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma pessoa' })
  @ApiResponse({ status: 200, description: 'Pessoa atualizada com sucesso', type: PersonEntity })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePersonDto: UpdatePersonDto,
  ): Promise<PersonEntity> {
    return this.personsService.update(id, updatePersonDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma pessoa (soft delete)' })
  @ApiResponse({ status: 200, description: 'Pessoa removida com sucesso' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.personsService.remove(id);
  }
}
