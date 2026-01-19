import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamEntity } from './entities/team.entity';
import { TeamMemberEntity, MemberType, TeamMemberRole } from './entities/team-member.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { AddTeamMemberDto } from './dto/add-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';

@Injectable()
export class TeamsService {
  private readonly logger = new Logger(TeamsService.name);

  constructor(
    @InjectRepository(TeamEntity)
    private readonly teamsRepository: Repository<TeamEntity>,
    @InjectRepository(TeamMemberEntity)
    private readonly teamMembersRepository: Repository<TeamMemberEntity>,
  ) {}

  async create(createTeamDto: CreateTeamDto): Promise<TeamEntity> {
    const team = this.teamsRepository.create({
      ...createTeamDto,
      isActive: createTeamDto.isActive ?? true,
    });
    return this.teamsRepository.save(team);
  }

  async findAll(): Promise<TeamEntity[]> {
    const teams = await this.teamsRepository
      .createQueryBuilder('team')
      .select([
        'team.id',
        'team.ministryId',
        'team.name',
        'team.description',
        'team.isActive',
        'team.createdAt',
        'team.updatedAt',
        'ministry.id',
        'ministry.churchId',
        'ministry.name',
        'ministry.description',
        'ministry.isActive',
      ])
      .leftJoin('team.ministry', 'ministry')
      .leftJoin('team.teamMembers', 'teamMembers')
      .addSelect(['teamMembers.id', 'teamMembers.personId'])
      .where('team.deletedAt IS NULL')
      .getMany();

    // Sort with natural sort to handle numbers correctly (EQUIPE 1, 2, 10, etc.)
    return teams.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();

      // Extract numbers and pad them for natural sorting
      const padNumbers = (str: string) => str.replace(/\d+/g, (match) => match.padStart(10, '0'));
      const paddedA = padNumbers(nameA);
      const paddedB = padNumbers(nameB);

      return paddedA.localeCompare(paddedB);
    });
  }

  async findByMinistry(ministryId: string): Promise<TeamEntity[]> {
    return this.teamsRepository
      .createQueryBuilder('team')
      .select([
        'team.id',
        'team.ministryId',
        'team.name',
        'team.description',
        'team.isActive',
        'team.createdAt',
        'team.updatedAt',
        'ministry.id',
        'ministry.churchId',
        'ministry.name',
        'ministry.description',
        'ministry.isActive',
      ])
      .leftJoin('team.ministry', 'ministry')
      .leftJoin('team.teamMembers', 'teamMembers')
      .addSelect(['teamMembers.id', 'teamMembers.personId'])
      .where('team.ministryId = :ministryId', { ministryId })
      .andWhere('team.deletedAt IS NULL')
      .orderBy('team.name', 'ASC')
      .getMany();
  }

  async findOne(id: string): Promise<TeamEntity> {
    const team = await this.teamsRepository
      .createQueryBuilder('team')
      .select([
        'team.id',
        'team.ministryId',
        'team.name',
        'team.description',
        'team.isActive',
        'team.createdAt',
        'team.updatedAt',
        'ministry.id',
        'ministry.churchId',
        'ministry.name',
        'ministry.description',
        'ministry.isActive',
        'teamMembers.id',
        'teamMembers.teamId',
        'teamMembers.personId',
        'teamMembers.role',
        'person.id',
        'person.ministryId',
        'person.teamId',
        'person.name',
        'person.email',
        'person.phone',
      ])
      .leftJoin('team.ministry', 'ministry')
      .leftJoin('team.teamMembers', 'teamMembers')
      .leftJoin('teamMembers.person', 'person')
      .where('team.id = :id', { id })
      .andWhere('team.deletedAt IS NULL')
      .getOne();

    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }

    return team;
  }

  async update(id: string, updateTeamDto: UpdateTeamDto): Promise<TeamEntity> {
    // Verify team exists
    await this.findOne(id);

    // Log the update data for debugging
    this.logger.debug(`Updating team ${id} with data:`, updateTeamDto);

    // Use update method to ensure ministryId is properly updated in database
    // This is important because Object.assign might not trigger TypeORM change detection for relations
    await this.teamsRepository.update(id, updateTeamDto);

    // Log after update
    this.logger.debug(`Team updated in database`);

    // Reload from database to ensure all relationships are up to date
    const reloadedTeam = await this.findOne(id);

    // Log after reload
    this.logger.debug(`Reloaded team ministryId: ${reloadedTeam.ministryId}`);

    return reloadedTeam;
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.teamsRepository.softDelete(id);
  }

  async addMember(teamId: string, addTeamMemberDto: AddTeamMemberDto): Promise<TeamMemberEntity> {
    await this.findOne(teamId);

    const existing = await this.teamMembersRepository.findOne({
      where: { teamId, personId: addTeamMemberDto.personId },
    });

    if (existing) {
      throw new ConflictException('Person is already a member of this team');
    }

    const teamMember = this.teamMembersRepository.create({
      teamId,
      personId: addTeamMemberDto.personId,
      memberType: addTeamMemberDto.memberType ?? MemberType.FIXED,
      role: addTeamMemberDto.role ?? TeamMemberRole.MEMBRO,
    });

    return this.teamMembersRepository.save(teamMember);
  }

  async removeMember(teamId: string, personId: string): Promise<void> {
    await this.findOne(teamId);

    const teamMember = await this.teamMembersRepository.findOne({
      where: { teamId, personId },
    });

    if (!teamMember) {
      throw new NotFoundException('Person is not a member of this team');
    }

    await this.teamMembersRepository.remove(teamMember);
  }

  async getMembers(teamId: string): Promise<TeamMemberEntity[]> {
    await this.findOne(teamId);
    return this.teamMembersRepository.find({
      where: { teamId },
      relations: ['person'],
    });
  }

  async updateMemberRole(
    teamId: string,
    personId: string,
    updateDto: UpdateTeamMemberDto,
  ): Promise<TeamMemberEntity> {
    await this.findOne(teamId);

    const teamMember = await this.teamMembersRepository.findOne({
      where: { teamId, personId },
      relations: ['person'],
    });

    if (!teamMember) {
      throw new NotFoundException('Person is not a member of this team');
    }

    if (updateDto.memberType !== undefined) {
      teamMember.memberType = updateDto.memberType;
    }

    if (updateDto.role !== undefined) {
      teamMember.role = updateDto.role;
    }

    return this.teamMembersRepository.save(teamMember);
  }
}
