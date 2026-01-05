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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Create a new church' })
  @ApiResponse({ status: 201, description: 'Church created successfully', type: ChurchEntity })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createChurchDto: CreateChurchDto): Promise<ChurchEntity> {
    return this.churchesService.create(createChurchDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all churches' })
  @ApiResponse({ status: 200, description: 'List of churches', type: [ChurchEntity] })
  findAll(): Promise<ChurchEntity[]> {
    return this.churchesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a church by ID' })
  @ApiResponse({ status: 200, description: 'Church found', type: ChurchEntity })
  @ApiResponse({ status: 404, description: 'Church not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ChurchEntity> {
    return this.churchesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a church' })
  @ApiResponse({ status: 200, description: 'Church updated successfully', type: ChurchEntity })
  @ApiResponse({ status: 404, description: 'Church not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateChurchDto: UpdateChurchDto,
  ): Promise<ChurchEntity> {
    return this.churchesService.update(id, updateChurchDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a church (soft delete)' })
  @ApiResponse({ status: 200, description: 'Church removed successfully' })
  @ApiResponse({ status: 404, description: 'Church not found' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.churchesService.remove(id);
  }
}
