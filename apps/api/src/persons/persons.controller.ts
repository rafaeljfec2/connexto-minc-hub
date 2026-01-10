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
  @ApiOperation({ summary: 'Create a new person/servant' })
  @ApiResponse({ status: 201, description: 'Person created successfully', type: PersonEntity })
  create(@Body() createPersonDto: CreatePersonDto): Promise<PersonEntity> {
    return this.personsService.create(createPersonDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all persons' })
  @ApiQuery({ name: 'ministryId', required: false, description: 'Filter by ministry' })
  @ApiQuery({ name: 'teamId', required: false, description: 'Filter by team' })
  @ApiResponse({ status: 200, description: 'List of persons', type: [PersonEntity] })
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
  @ApiOperation({ summary: 'Get a person by ID' })
  @ApiResponse({ status: 200, description: 'Person found', type: PersonEntity })
  @ApiResponse({ status: 404, description: 'Person not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<PersonEntity> {
    return this.personsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a person' })
  @ApiResponse({ status: 200, description: 'Person updated successfully', type: PersonEntity })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePersonDto: UpdatePersonDto,
  ): Promise<PersonEntity> {
    return this.personsService.update(id, updatePersonDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a person (soft delete)' })
  @ApiResponse({ status: 200, description: 'Person removed successfully' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.personsService.remove(id);
  }
}
