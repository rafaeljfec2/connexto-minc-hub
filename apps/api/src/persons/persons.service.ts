import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { PersonEntity } from './entities/person.entity';
import { TeamMemberEntity } from '../teams/entities/team-member.entity';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';

@Injectable()
export class PersonsService {
  constructor(
    @InjectRepository(PersonEntity)
    private personsRepository: Repository<PersonEntity>,
    @InjectRepository(TeamMemberEntity)
    private teamMembersRepository: Repository<TeamMemberEntity>,
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

  /**
   * Find all persons that belong to a team
   * 
   * This method considers both team relationships:
   * 1. Direct relationship (1:N): persons.team_id - persons with this team as their primary team
   * 2. Many-to-many relationship (N:N): team_members table - persons explicitly added to this team
   * 
   * Returns a combined list of all persons associated with the team, removing duplicates.
   */
  async findByTeam(teamId: string): Promise<PersonEntity[]> {
    // 1. Get persons with this team as their primary team (1:N relationship)
    const personsWithPrimaryTeam = await this.personsRepository.find({
      where: { teamId, deletedAt: IsNull() },
      relations: ['ministry', 'team'],
      order: { name: 'ASC' },
    });

    // 2. Get persons from team_members table (N:N relationship)
    const teamMembers = await this.teamMembersRepository.find({
      where: { teamId },
      relations: ['person'],
    });

    const personsFromTeamMembers = teamMembers
      .map((tm) => tm.person)
      .filter((person) => person.deletedAt === null);

    // Combine both lists and remove duplicates by person ID
    const allPersons = [...personsWithPrimaryTeam, ...personsFromTeamMembers];
    const uniquePersonsMap = new Map<string, PersonEntity>();

    for (const person of allPersons) {
      if (!uniquePersonsMap.has(person.id)) {
        uniquePersonsMap.set(person.id, person);
      }
    }

    // Sort by name
    return Array.from(uniquePersonsMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
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
