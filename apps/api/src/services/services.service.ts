import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceEntity } from './entities/service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(ServiceEntity)
    private servicesRepository: Repository<ServiceEntity>,
  ) {}

  async create(createServiceDto: CreateServiceDto): Promise<ServiceEntity> {
    const service = this.servicesRepository.create({
      ...createServiceDto,
      isActive: createServiceDto.isActive ?? true,
    });
    return this.servicesRepository.save(service);
  }

  async findAll(): Promise<ServiceEntity[]> {
    return this.servicesRepository.find({
      where: { deletedAt: null },
      relations: ['church'],
      order: { dayOfWeek: 'ASC', time: 'ASC' },
    });
  }

  async findByChurch(churchId: string): Promise<ServiceEntity[]> {
    return this.servicesRepository.find({
      where: { churchId, deletedAt: null },
      relations: ['church'],
      order: { dayOfWeek: 'ASC', time: 'ASC' },
    });
  }

  async findOne(id: string): Promise<ServiceEntity> {
    const service = await this.servicesRepository.findOne({
      where: { id, deletedAt: null },
      relations: ['church', 'schedules'],
    });

    if (!service) {
      throw new NotFoundException(`Culto com ID ${id} não encontrado`);
    }

    return service;
  }

  async update(id: string, updateServiceDto: UpdateServiceDto): Promise<ServiceEntity> {
    const service = await this.findOne(id);
    Object.assign(service, updateServiceDto);
    return this.servicesRepository.save(service);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.servicesRepository.softDelete(id);
  }
}
