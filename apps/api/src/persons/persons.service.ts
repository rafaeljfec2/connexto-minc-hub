import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { PersonEntity } from './entities/person.entity';
import { TeamMemberEntity, MemberType } from '../teams/entities/team-member.entity';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';

@Injectable()
export class PersonsService {
  constructor(
    @InjectRepository(PersonEntity)
    private readonly personsRepository: Repository<PersonEntity>,
    @InjectRepository(TeamMemberEntity)
    private readonly teamMembersRepository: Repository<TeamMemberEntity>,
  ) {}

  async create(createPersonDto: CreatePersonDto): Promise<PersonEntity> {
    const { teamMembers, ...personData } = createPersonDto;

    const person = this.personsRepository.create({
      ...personData,
      birthDate: personData.birthDate ? new Date(personData.birthDate) : null,
    });

    const savedPerson = await this.personsRepository.save(person);

    // Create team members if provided
    if (teamMembers && teamMembers.length > 0) {
      const teamMemberEntities = teamMembers.map((tm) =>
        this.teamMembersRepository.create({
          teamId: tm.teamId,
          personId: savedPerson.id,
          memberType: tm.memberType ?? MemberType.FIXED,
        }),
      );
      await this.teamMembersRepository.save(teamMemberEntities);
    }

    // Return person with team members loaded
    return this.findOne(savedPerson.id);
  }

  async findAll(): Promise<PersonEntity[]> {
    const persons = await this.personsRepository.find({
      where: { deletedAt: IsNull() },
      relations: ['ministry', 'team', 'teamMembers', 'teamMembers.team', 'user'],
      order: { name: 'ASC' },
    });

    // Manually add avatar from user to person
    return persons.map((person) => ({
      ...person,
      avatar: person.user?.avatar ?? null,
    })) as PersonEntity[];
  }

  async findByMinistry(ministryId: string): Promise<PersonEntity[]> {
    const persons = await this.personsRepository.find({
      where: { ministryId, deletedAt: IsNull() },
      relations: ['ministry', 'team', 'teamMembers', 'teamMembers.team', 'user'],
      order: { name: 'ASC' },
    });

    return persons.map((person) => ({
      ...person,
      avatar: person.user?.avatar ?? null,
    })) as PersonEntity[];
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
      relations: ['ministry', 'team', 'user'],
      order: { name: 'ASC' },
    });

    // 2. Get persons from team_members table (N:N relationship)
    const teamMembers = await this.teamMembersRepository.find({
      where: { teamId },
      relations: ['person', 'person.user'],
    });

    const personsFromTeamMembers = teamMembers
      .map((tm) => tm.person)
      .filter((person) => person.deletedAt === null);

    // Combine both lists and remove duplicates by person ID
    const allPersons = [...personsWithPrimaryTeam, ...personsFromTeamMembers];
    const uniquePersonsMap = new Map<string, PersonEntity>();

    for (const person of allPersons) {
      if (!uniquePersonsMap.has(person.id)) {
        uniquePersonsMap.set(person.id, {
          ...person,
          avatar: person.user?.avatar ?? null,
        } as PersonEntity);
      }
    }

    // Sort by name
    return Array.from(uniquePersonsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async findOne(id: string): Promise<PersonEntity> {
    const person = await this.personsRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['ministry', 'team', 'teamMembers', 'teamMembers.team', 'attendances', 'user'],
    });

    if (!person) {
      throw new NotFoundException(`Person with ID ${id} not found`);
    }

    return {
      ...person,
      avatar: person.user?.avatar ?? null,
    } as PersonEntity;
  }

  async update(id: string, updatePersonDto: UpdatePersonDto): Promise<PersonEntity> {
    const person = await this.findOne(id);
    const { teamMembers, ...personData } = updatePersonDto;

    if (personData.birthDate) {
      personData.birthDate = new Date(personData.birthDate).toISOString();
    }

    Object.assign(person, {
      ...personData,
      birthDate: personData.birthDate ? new Date(personData.birthDate) : person.birthDate,
    });

    const savedPerson = await this.personsRepository.save(person);

    // Update team members if provided
    if (teamMembers !== undefined) {
      // Remove all existing team members for this person
      await this.teamMembersRepository.delete({ personId: savedPerson.id });

      // Create new team members if provided
      if (teamMembers.length > 0) {
        const teamMemberEntities = teamMembers.map((tm) =>
          this.teamMembersRepository.create({
            teamId: tm.teamId,
            personId: savedPerson.id,
            memberType: tm.memberType ?? MemberType.FIXED,
          }),
        );
        await this.teamMembersRepository.save(teamMemberEntities);
      }
    }

    return this.findOne(savedPerson.id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.personsRepository.softDelete(id);
  }
}
