import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { TeamEntity } from './entities/team.entity';
import { TeamMemberEntity } from './entities/team-member.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { AddTeamMemberDto } from './dto/add-team-member.dto';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(TeamEntity)
    private teamsRepository: Repository<TeamEntity>,
    @InjectRepository(TeamMemberEntity)
    private teamMembersRepository: Repository<TeamMemberEntity>,
  ) {}

  async create(createTeamDto: CreateTeamDto): Promise<TeamEntity> {
    const team = this.teamsRepository.create({
      ...createTeamDto,
      isActive: createTeamDto.isActive ?? true,
    });
    return this.teamsRepository.save(team);
  }

  async findAll(): Promise<TeamEntity[]> {
    return this.teamsRepository.find({
      where: { deletedAt: IsNull() },
      relations: ['ministry', 'leader'],
      order: { name: 'ASC' },
    });
  }

  async findByMinistry(ministryId: string): Promise<TeamEntity[]> {
    return this.teamsRepository.find({
      where: { ministryId, deletedAt: IsNull() },
      relations: ['ministry', 'leader'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<TeamEntity> {
    const team = await this.teamsRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['ministry', 'leader', 'teamMembers', 'teamMembers.person'],
    });

    if (!team) {
      throw new NotFoundException(`Equipe com ID ${id} não encontrada`);
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
      throw new ConflictException('Pessoa já é membro desta equipe');
    }

    const teamMember = this.teamMembersRepository.create({
      teamId,
      personId: addTeamMemberDto.personId,
    });

    return this.teamMembersRepository.save(teamMember);
  }

  async removeMember(teamId: string, personId: string): Promise<void> {
    await this.findOne(teamId);

    const teamMember = await this.teamMembersRepository.findOne({
      where: { teamId, personId },
    });

    if (!teamMember) {
      throw new NotFoundException('Pessoa não é membro desta equipe');
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
