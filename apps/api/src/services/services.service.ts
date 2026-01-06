import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
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
    return this.servicesRepository
      .createQueryBuilder('service')
      .select([
        'service.id',
        'service.churchId',
        'service.type',
        'service.dayOfWeek',
        'service.time',
        'service.name',
        'service.isActive',
        'service.createdAt',
        'service.updatedAt',
        'church.id',
        'church.name',
        'church.address',
        'church.phone',
        'church.email',
      ])
      .leftJoin('service.church', 'church')
      .where('service.deletedAt IS NULL')
      .orderBy('service.dayOfWeek', 'ASC')
      .addOrderBy('service.time', 'ASC')
      .getMany();
  }

  async findByChurch(churchId: string): Promise<ServiceEntity[]> {
    return this.servicesRepository
      .createQueryBuilder('service')
      .select([
        'service.id',
        'service.churchId',
        'service.type',
        'service.dayOfWeek',
        'service.time',
        'service.name',
        'service.isActive',
        'service.createdAt',
        'service.updatedAt',
        'church.id',
        'church.name',
        'church.address',
        'church.phone',
        'church.email',
      ])
      .leftJoin('service.church', 'church')
      .where('service.churchId = :churchId', { churchId })
      .andWhere('service.deletedAt IS NULL')
      .orderBy('service.dayOfWeek', 'ASC')
      .addOrderBy('service.time', 'ASC')
      .getMany();
  }

  async findOne(id: string): Promise<ServiceEntity> {
    const service = await this.servicesRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['church', 'schedules'],
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
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
