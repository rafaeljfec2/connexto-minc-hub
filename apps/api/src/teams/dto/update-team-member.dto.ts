import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { MemberType, TeamMemberRole } from '../entities/team-member.entity';

export class UpdateTeamMemberDto {
  @ApiProperty({
    example: 'fixed',
    description: 'Tipo de membro: fixed (fixo) ou eventual',
    enum: MemberType,
    required: false,
  })
  @IsEnum(MemberType, { message: 'Tipo de membro deve ser "fixed" ou "eventual"' })
  @IsOptional()
  memberType?: MemberType;

  @ApiProperty({
    example: 'lider_de_equipe',
    description: 'Função do membro na equipe',
    enum: TeamMemberRole,
    required: false,
  })
  @IsEnum(TeamMemberRole, { message: 'Função deve ser "lider_de_equipe" ou "membro"' })
  @IsOptional()
  role?: TeamMemberRole;
}
