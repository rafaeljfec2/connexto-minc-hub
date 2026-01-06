import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamEntity } from './entities/team.entity';
import { TeamMemberEntity, MemberType } from './entities/team-member.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { AddTeamMemberDto } from './dto/add-team-member.dto';

@Injectable()
export class TeamsService {
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
    return this.teamsRepository
      .createQueryBuilder('team')
      .select([
        'team.id',
        'team.ministryId',
        'team.leaderId',
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
        'leader.id',
        'leader.name',
        'leader.email',
        'leader.role',
      ])
      .leftJoin('team.ministry', 'ministry')
      .leftJoin('team.leader', 'leader')
      .where('team.deletedAt IS NULL')
      .orderBy('team.name', 'ASC')
      .getMany();
  }

  async findByMinistry(ministryId: string): Promise<TeamEntity[]> {
    return this.teamsRepository
      .createQueryBuilder('team')
      .select([
        'team.id',
        'team.ministryId',
        'team.leaderId',
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
        'leader.id',
        'leader.name',
        'leader.email',
        'leader.role',
      ])
      .leftJoin('team.ministry', 'ministry')
      .leftJoin('team.leader', 'leader')
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
        'team.leaderId',
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
        'leader.id',
        'leader.name',
        'leader.email',
        'leader.role',
        'teamMembers.id',
        'teamMembers.teamId',
        'teamMembers.personId',
        'person.id',
        'person.ministryId',
        'person.teamId',
        'person.name',
        'person.email',
        'person.phone',
      ])
      .leftJoin('team.ministry', 'ministry')
      .leftJoin('team.leader', 'leader')
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
    const team = await this.findOne(id);
    Object.assign(team, updateTeamDto);
    return this.teamsRepository.save(team);
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
}
