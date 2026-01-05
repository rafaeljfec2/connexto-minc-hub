import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ChurchEntity } from './entities/church.entity';
import { CreateChurchDto } from './dto/create-church.dto';
import { UpdateChurchDto } from './dto/update-church.dto';

@Injectable()
export class ChurchesService {
  constructor(
    @InjectRepository(ChurchEntity)
    private churchesRepository: Repository<ChurchEntity>,
  ) {}

  async create(createChurchDto: CreateChurchDto): Promise<ChurchEntity> {
    const church = this.churchesRepository.create(createChurchDto);
    return this.churchesRepository.save(church);
  }

  async findAll(): Promise<ChurchEntity[]> {
    return this.churchesRepository.find({
      where: { deletedAt: IsNull() },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<ChurchEntity> {
    const church = await this.churchesRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['ministries', 'services'],
    });

    if (!church) {
      throw new NotFoundException(`Church with ID ${id} not found`);
    }

    return church;
  }

  async update(id: string, updateChurchDto: UpdateChurchDto): Promise<ChurchEntity> {
    const church = await this.findOne(id);
    Object.assign(church, updateChurchDto);
    return this.churchesRepository.save(church);
  }

  async remove(id: string): Promise<void> {
    const church = await this.findOne(id);
    await this.churchesRepository.softDelete(id);
  }
}
