import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { MinistryEntity } from './entities/ministry.entity';
import { TimeMemberEntity, TimeMemberRole } from './entities/time-member.entity';
import { CreateMinistryDto } from './dto/create-ministry.dto';
import { UpdateMinistryDto } from './dto/update-ministry.dto';
import { AddTimeMemberDto } from './dto/add-time-member.dto';

@Injectable()
export class MinistriesService {
  constructor(
    @InjectRepository(MinistryEntity)
    private ministriesRepository: Repository<MinistryEntity>,
    @InjectRepository(TimeMemberEntity)
    private timeMembersRepository: Repository<TimeMemberEntity>,
  ) {}

  async create(createMinistryDto: CreateMinistryDto): Promise<MinistryEntity> {
    const ministry = this.ministriesRepository.create({
      ...createMinistryDto,
      isActive: createMinistryDto.isActive ?? true,
    });
    return this.ministriesRepository.save(ministry);
  }

  async findAll(): Promise<MinistryEntity[]> {
    return this.ministriesRepository
      .createQueryBuilder('ministry')
      .select([
        'ministry.id',
        'ministry.churchId',
        'ministry.name',
        'ministry.description',
        'ministry.isActive',
        'ministry.createdAt',
        'ministry.updatedAt',
        'church.id',
        'church.name',
        'church.address',
        'church.phone',
        'church.email',
      ])
      .leftJoin('ministry.church', 'church')
      .where('ministry.deletedAt IS NULL')
      .orderBy('ministry.name', 'ASC')
      .getMany();
  }

  async findByChurch(churchId: string): Promise<MinistryEntity[]> {
    return this.ministriesRepository
      .createQueryBuilder('ministry')
      .select([
        'ministry.id',
        'ministry.churchId',
        'ministry.name',
        'ministry.description',
        'ministry.isActive',
        'ministry.createdAt',
        'ministry.updatedAt',
        'church.id',
        'church.name',
        'church.address',
        'church.phone',
        'church.email',
      ])
      .leftJoin('ministry.church', 'church')
      .where('ministry.churchId = :churchId', { churchId })
      .andWhere('ministry.deletedAt IS NULL')
      .orderBy('ministry.name', 'ASC')
      .getMany();
  }

  async findOne(id: string): Promise<MinistryEntity> {
    const ministry = await this.ministriesRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['church', 'teams', 'persons'],
    });

    if (!ministry) {
      throw new NotFoundException(`Ministry with ID ${id} not found`);
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

  async addLeader(
    ministryId: string,
    addTimeMemberDto: AddTimeMemberDto,
  ): Promise<TimeMemberEntity> {
    await this.findOne(ministryId);

    const existing = await this.timeMembersRepository.findOne({
      where: { ministryId, personId: addTimeMemberDto.personId },
    });

    if (existing) {
      throw new ConflictException('Person is already a leader of this ministry');
    }

    const timeMember = this.timeMembersRepository.create({
      ministryId,
      personId: addTimeMemberDto.personId,
      role: TimeMemberRole.LIDER_DE_TIME,
    });

    return this.timeMembersRepository.save(timeMember);
  }

  async getLeaders(ministryId: string): Promise<TimeMemberEntity[]> {
    await this.findOne(ministryId);
    return this.timeMembersRepository.find({
      where: { ministryId },
      relations: ['person'],
    });
  }

  async removeLeader(ministryId: string, personId: string): Promise<void> {
    await this.findOne(ministryId);

    const timeMember = await this.timeMembersRepository.findOne({
      where: { ministryId, personId },
    });

    if (!timeMember) {
      throw new NotFoundException('Person is not a leader of this ministry');
    }

    await this.timeMembersRepository.remove(timeMember);
  }
}
