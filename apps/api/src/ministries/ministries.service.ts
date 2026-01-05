import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { MinistryEntity } from './entities/ministry.entity';
import { CreateMinistryDto } from './dto/create-ministry.dto';
import { UpdateMinistryDto } from './dto/update-ministry.dto';

@Injectable()
export class MinistriesService {
  constructor(
    @InjectRepository(MinistryEntity)
    private ministriesRepository: Repository<MinistryEntity>,
  ) {}

  async create(createMinistryDto: CreateMinistryDto): Promise<MinistryEntity> {
    const ministry = this.ministriesRepository.create({
      ...createMinistryDto,
      isActive: createMinistryDto.isActive ?? true,
    });
    return this.ministriesRepository.save(ministry);
  }

  async findAll(): Promise<MinistryEntity[]> {
    return this.ministriesRepository.find({
      where: { deletedAt: IsNull() },
      relations: ['church'],
      order: { name: 'ASC' },
    });
  }

  async findByChurch(churchId: string): Promise<MinistryEntity[]> {
    return this.ministriesRepository.find({
      where: { churchId, deletedAt: IsNull() },
      relations: ['church'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<MinistryEntity> {
    const ministry = await this.ministriesRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['church', 'teams', 'persons'],
    });

    if (!ministry) {
      throw new NotFoundException(`Ministério com ID ${id} não encontrado`);
    }

    return ministry;
  }

  async update(id: string, updateMinistryDto: UpdateMinistryDto): Promise<MinistryEntity> {
    const ministry = await this.findOne(id);
    Object.assign(ministry, updateMinistryDto);
    return this.ministriesRepository.save(ministry);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.ministriesRepository.softDelete(id);
  }
}
