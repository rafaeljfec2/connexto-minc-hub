import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsEnum } from 'class-validator';
import { MemberType } from '../entities/team-member.entity';

export class AddTeamMemberDto {
  @ApiProperty({
    example: 'uuid-da-pessoa',
    description: 'ID da pessoa a ser adicionada à equipe',
  })
  @IsUUID('4', { message: 'ID da pessoa deve ser um UUID válido' })
  personId: string;

  @ApiProperty({
    example: 'fixed',
    description: 'Tipo de membro: fixed (fixo) ou eventual',
    enum: MemberType,
    default: MemberType.FIXED,
    required: false,
  })
  @IsEnum(MemberType, { message: 'Tipo de membro deve ser "fixed" ou "eventual"' })
  @IsOptional()
  memberType?: MemberType;
}
