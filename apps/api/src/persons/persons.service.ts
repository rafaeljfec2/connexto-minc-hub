import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { PersonEntity } from './entities/person.entity';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';

@Injectable()
export class PersonsService {
  constructor(
    @InjectRepository(PersonEntity)
    private personsRepository: Repository<PersonEntity>,
  ) {}

  async create(createPersonDto: CreatePersonDto): Promise<PersonEntity> {
    const person = this.personsRepository.create({
      ...createPersonDto,
      birthDate: createPersonDto.birthDate ? new Date(createPersonDto.birthDate) : null,
    });
    return this.personsRepository.save(person);
  }

  async findAll(): Promise<PersonEntity[]> {
    return this.personsRepository.find({
      where: { deletedAt: IsNull() },
      relations: ['ministry', 'team'],
      order: { name: 'ASC' },
    });
  }

  async findByMinistry(ministryId: string): Promise<PersonEntity[]> {
    return this.personsRepository.find({
      where: { ministryId, deletedAt: IsNull() },
      relations: ['ministry', 'team'],
      order: { name: 'ASC' },
    });
  }

  async findByTeam(teamId: string): Promise<PersonEntity[]> {
    return this.personsRepository.find({
      where: { teamId, deletedAt: IsNull() },
      relations: ['ministry', 'team'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<PersonEntity> {
    const person = await this.personsRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['ministry', 'team', 'teamMembers', 'attendances'],
    });

    if (!person) {
      throw new NotFoundException(`Person with ID ${id} not found`);
    }

    return person;
  }

  async update(id: string, updatePersonDto: UpdatePersonDto): Promise<PersonEntity> {
    const person = await this.findOne(id);
    
    if (updatePersonDto.birthDate) {
      updatePersonDto.birthDate = new Date(updatePersonDto.birthDate).toISOString();
    }
    
    Object.assign(person, {
      ...updatePersonDto,
      birthDate: updatePersonDto.birthDate ? new Date(updatePersonDto.birthDate) : person.birthDate,
    });
    
    return this.personsRepository.save(person);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.personsRepository.softDelete(id);
  }
}
