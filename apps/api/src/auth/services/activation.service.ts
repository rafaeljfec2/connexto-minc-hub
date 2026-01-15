import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AccessCodeEntity, AccessCodeScopeType } from '../entities/access-code.entity';
import { PersonEntity } from '../../persons/entities/person.entity';
import { UserEntity, UserRole } from '../../users/entities/user.entity';
import { TeamEntity } from '../../teams/entities/team.entity';
import { MinistryEntity } from '../../ministries/entities/ministry.entity';
import { ChurchEntity } from '../../churches/entities/church.entity';
import { CreateAccessCodeDto } from '../dto/create-access-code.dto';
import { CheckActivationDto } from '../dto/check-activation.dto';
import { CompleteActivationDto } from '../dto/complete-activation.dto';
import { AccessCodeResponseDto } from '../dto/access-code-response.dto';
import { TempActivationTokenService } from './temp-activation-token.service';
import { UsersService } from '../../users/users.service';
import { logSecurityEvent } from '../../common/utils/security-logger.util';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ActivationService {
  private readonly logger = new Logger(ActivationService.name);

  constructor(
    @InjectRepository(AccessCodeEntity)
    private readonly accessCodeRepository: Repository<AccessCodeEntity>,
    @InjectRepository(PersonEntity)
    private readonly personRepository: Repository<PersonEntity>,
    @InjectRepository(TeamEntity)
    private readonly teamRepository: Repository<TeamEntity>,
    @InjectRepository(MinistryEntity)
    private readonly ministryRepository: Repository<MinistryEntity>,
    @InjectRepository(ChurchEntity)
    private readonly churchRepository: Repository<ChurchEntity>,
    private readonly tempActivationTokenService: TempActivationTokenService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Normaliza telefone removendo caracteres especiais
   * Remove espaços, parênteses, hífens, pontos e outros caracteres não numéricos
   */
  private normalizePhone(phone: string): string {
    if (!phone) return '';

    return phone.replace(/\D/g, '');
  }

  /**
   * Busca pessoa pelo telefone normalizado usando query SQL
   * Compara telefones normalizados (apenas números) ignorando formatação
   */
  private async findPersonByPhone(normalizedPhone: string): Promise<PersonEntity | null> {
    if (!normalizedPhone || normalizedPhone.length < 10) {
      return null;
    }

    // Buscar todas as pessoas não deletadas e filtrar em memória
    const persons = await this.personRepository
      .createQueryBuilder('person')
      .where('person.deletedAt IS NULL')
      .andWhere('person.phone IS NOT NULL')
      .andWhere("person.phone != ''")
      .getMany();

    // Normalizar e comparar telefones
    for (const person of persons) {
      if (person.phone) {
        const personPhoneNormalized = this.normalizePhone(person.phone);
        if (personPhoneNormalized === normalizedPhone) {
          return person;
        }
      }
    }

    return null;
  }

  /**
   * Valida se o usuário tem permissão para criar código para o escopo especificado
   */
  async validatePermissionToCreateCode(
    user: UserEntity,
    scopeType: AccessCodeScopeType,
    scopeId: string,
  ): Promise<void> {
    // Admin e Pastor podem criar para qualquer escopo
    if (user.role === UserRole.ADMIN || user.role === UserRole.PASTOR) {
      return;
    }

    if (user.role === UserRole.LIDER_DE_TIME) {
      await this.validateLeaderDeTimePermission(user, scopeType, scopeId);
      return;
    }

    if (user.role === UserRole.LIDER_DE_EQUIPE) {
      await this.validateLeaderDeEquipePermission(user, scopeType, scopeId);
      return;
    }

    throw new ForbiddenException('Você não tem permissão para criar códigos de acesso');
  }

  /**
   * Valida permissão para Líder de Time
   */
  private async validateLeaderDeTimePermission(
    user: UserEntity,
    scopeType: AccessCodeScopeType,
    scopeId: string,
  ): Promise<void> {
    if (scopeType === AccessCodeScopeType.MINISTRY) {
      await this.validateMinistryAccessForLeader(user, scopeId);
      return;
    }

    if (scopeType === AccessCodeScopeType.TEAM) {
      await this.validateTeamAccessForLeader(user, scopeId);
      return;
    }

    throw new ForbiddenException('Líder de Ministério não pode criar código para igreja');
  }

  /**
   * Valida acesso de líder a ministério
   */
  private async validateMinistryAccessForLeader(
    user: UserEntity,
    ministryId: string,
  ): Promise<void> {
    const ministry = await this.ministryRepository.findOne({
      where: { id: ministryId, deletedAt: IsNull() },
      relations: ['teams'],
    });
    if (!ministry) {
      throw new NotFoundException('Ministério não encontrado');
    }

    const userTeams = await this.teamRepository.find({
      where: { leaderId: user.id, ministryId, deletedAt: IsNull() },
    });
    if (userTeams.length === 0) {
      throw new ForbiddenException('Você não tem permissão para criar código para este ministério');
    }
  }

  /**
   * Valida acesso de líder a time
   */
  private async validateTeamAccessForLeader(user: UserEntity, teamId: string): Promise<void> {
    const team = await this.teamRepository.findOne({
      where: { id: teamId, deletedAt: IsNull() },
    });
    if (!team) {
      throw new NotFoundException('Time não encontrado');
    }
    if (team.leaderId !== user.id) {
      throw new ForbiddenException('Você não tem permissão para criar código para este time');
    }
  }

  /**
   * Valida permissão para Líder de Equipe
   */
  private async validateLeaderDeEquipePermission(
    user: UserEntity,
    scopeType: AccessCodeScopeType,
    scopeId: string,
  ): Promise<void> {
    if (scopeType !== AccessCodeScopeType.TEAM) {
      throw new ForbiddenException('Líder de Equipe pode criar código apenas para seu time');
    }
    await this.validateTeamAccessForLeader(user, scopeId);
  }

  /**
   * Verifica se uma pessoa pertence ao escopo do código
   */
  private async personBelongsToScope(
    person: PersonEntity,
    scopeType: AccessCodeScopeType,
    scopeId: string,
  ): Promise<boolean> {
    if (scopeType === AccessCodeScopeType.CHURCH) {
      // Verificar se pessoa pertence a algum ministério da igreja
      if (person.ministryId) {
        const ministry = await this.ministryRepository.findOne({
          where: { id: person.ministryId, churchId: scopeId, deletedAt: IsNull() },
        });
        return ministry !== null;
      }
      return false;
    }

    if (scopeType === AccessCodeScopeType.MINISTRY) {
      return person.ministryId === scopeId;
    }

    if (scopeType === AccessCodeScopeType.TEAM) {
      // Verificar se pessoa pertence ao time (via team_id ou team_members)
      if (person.teamId === scopeId) {
        return true;
      }
      const teamMember = await this.personRepository.manager
        .createQueryBuilder()
        .select('1')
        .from('team_members', 'tm')
        .where('tm.person_id = :personId', { personId: person.id })
        .andWhere('tm.team_id = :teamId', { teamId: scopeId })
        .getRawOne();
      return teamMember !== undefined;
    }

    return false;
  }

  /**
   * Cria um novo código de acesso
   */
  async createAccessCode(
    user: UserEntity,
    dto: CreateAccessCodeDto,
  ): Promise<AccessCodeResponseDto> {
    // Validar permissões
    await this.validatePermissionToCreateCode(user, dto.scopeType, dto.scopeId);

    // Converter código para uppercase
    const code = dto.code.toUpperCase();

    // Verificar se código já existe
    const existingCode = await this.accessCodeRepository.findOne({
      where: { code },
    });
    if (existingCode) {
      throw new ConflictException('Código de acesso já existe');
    }

    // Validar escopo existe
    if (dto.scopeType === AccessCodeScopeType.CHURCH) {
      await this.churchRepository.findOneOrFail({
        where: { id: dto.scopeId, deletedAt: IsNull() },
      });
    } else if (dto.scopeType === AccessCodeScopeType.MINISTRY) {
      await this.ministryRepository.findOneOrFail({
        where: { id: dto.scopeId, deletedAt: IsNull() },
      });
    } else if (dto.scopeType === AccessCodeScopeType.TEAM) {
      await this.teamRepository.findOneOrFail({
        where: { id: dto.scopeId, deletedAt: IsNull() },
      });
    }

    // Calcular data de expiração
    const expiresInDays = dto.expiresInDays ?? 30;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // Criar código
    const accessCode = this.accessCodeRepository.create({
      code,
      scopeType: dto.scopeType,
      scopeId: dto.scopeId,
      expiresAt,
      isActive: true,
      createdById: user.id,
      usageCount: 0,
      maxUsages: dto.maxUsages ?? null,
    });

    const saved = await this.accessCodeRepository.save(accessCode);

    logSecurityEvent('access_code_created', {
      userId: user.id,
      codeId: saved.id,
      code: saved.code,
      scopeType: saved.scopeType,
      scopeId: saved.scopeId,
    });

    return this.mapToResponseDto(saved);
  }

  /**
   * Valida telefone e código de acesso, retorna token temporário
   */
  async validateAccessCode(
    dto: CheckActivationDto,
  ): Promise<{ tempToken: string; personName: string }> {
    const normalizedPhone = this.normalizePhone(dto.phone);
    const code = dto.accessCode.toUpperCase();

    // Buscar código
    const accessCode = await this.accessCodeRepository.findOne({
      where: { code },
    });

    if (!accessCode) {
      logSecurityEvent('activation_check_failed', {
        reason: 'code_not_found',
        phone: normalizedPhone,
        code,
      });
      throw new BadRequestException('Código de acesso inválido');
    }

    // Verificar se código está ativo
    if (!accessCode.isActive) {
      logSecurityEvent('activation_check_failed', {
        reason: 'code_inactive',
        phone: normalizedPhone,
        codeId: accessCode.id,
      });
      throw new BadRequestException('Código de acesso está desativado');
    }

    // Verificar se código não expirou
    if (new Date() > accessCode.expiresAt) {
      logSecurityEvent('activation_check_failed', {
        reason: 'code_expired',
        phone: normalizedPhone,
        codeId: accessCode.id,
      });
      throw new BadRequestException('Código de acesso expirado');
    }

    // Verificar limite de usos
    if (accessCode.maxUsages !== null && accessCode.usageCount >= accessCode.maxUsages) {
      logSecurityEvent('activation_check_failed', {
        reason: 'code_max_usages_reached',
        phone: normalizedPhone,
        codeId: accessCode.id,
      });
      throw new BadRequestException('Código de acesso atingiu o limite de usos');
    }

    // Buscar pessoa pelo telefone normalizado
    const person = await this.findPersonByPhone(normalizedPhone);

    if (!person) {
      logSecurityEvent('activation_check_failed', {
        reason: 'person_not_found',
        phone: normalizedPhone,
        codeId: accessCode.id,
      });
      throw new NotFoundException('Telefone não encontrado na base de dados');
    }

    // Verificar se pessoa já tem usuário ATIVO
    // findByPersonId agora filtra apenas usuários ativos e não deletados
    const existingUser = await this.usersService.findByPersonId(person.id);
    if (existingUser) {
      // Log detalhado para debug
      this.logger.warn('Tentativa de ativação para pessoa que já possui usuário ativo', {
        personId: person.id,
        personName: person.name,
        userId: existingUser.id,
        userEmail: existingUser.email,
        phone: normalizedPhone,
        codeId: accessCode.id,
      });

      logSecurityEvent('activation_check_failed', {
        reason: 'person_already_has_user',
        personId: person.id,
        userId: existingUser.id,
        phone: normalizedPhone,
        codeId: accessCode.id,
      });
      throw new ConflictException('Esta pessoa já possui uma conta ativada');
    }

    // Verificar se pessoa pertence ao escopo do código
    const belongsToScope = await this.personBelongsToScope(
      person,
      accessCode.scopeType,
      accessCode.scopeId,
    );
    if (!belongsToScope) {
      logSecurityEvent('activation_check_failed', {
        reason: 'person_not_in_scope',
        personId: person.id,
        phone: normalizedPhone,
        codeId: accessCode.id,
        scopeType: accessCode.scopeType,
        scopeId: accessCode.scopeId,
      });
      throw new ForbiddenException('Você não pertence ao escopo deste código de acesso');
    }

    // NÃO incrementar contador aqui - apenas na conclusão bem-sucedida da ativação
    // O contador será incrementado apenas quando o usuário for criado com sucesso

    // Gerar token temporário
    const tempToken = this.tempActivationTokenService.generateToken(person.id, accessCode.id);

    logSecurityEvent('activation_check_success', {
      personId: person.id,
      phone: normalizedPhone,
      codeId: accessCode.id,
    });

    return {
      tempToken,
      personName: person.name,
    };
  }

  /**
   * Completa a ativação criando o usuário
   */
  async completeActivation(
    dto: CompleteActivationDto,
  ): Promise<{ user: UserEntity; token: string }> {
    // Validar token temporário
    const payload = this.tempActivationTokenService.validateToken(dto.tempToken);

    // Marcar token como usado
    this.tempActivationTokenService.markTokenAsUsed(dto.tempToken);

    // Buscar pessoa
    const person = await this.personRepository.findOne({
      where: { id: payload.personId, deletedAt: IsNull() },
    });

    if (!person) {
      throw new NotFoundException('Pessoa não encontrada');
    }

    // Verificar se pessoa já tem usuário
    const existingUser = await this.usersService.findByPersonId(person.id);
    if (existingUser) {
      throw new ConflictException('Esta pessoa já possui uma conta ativada');
    }

    // Verificar se email já está em uso
    const emailInUse = await this.usersService.findByEmail(dto.email);
    if (emailInUse) {
      throw new ConflictException('Email já está em uso');
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Criar usuário vinculado à pessoa
    const user = await this.usersService.create({
      email: dto.email,
      passwordHash,
      name: person.name,
      role: UserRole.SERVO,
      personId: person.id, // Vínculo crítico: User -> Person
      canCheckIn: false,
    });

    // Verificar se o vínculo foi criado corretamente
    if (!user.personId || user.personId !== person.id) {
      this.logger.error('Erro crítico: Vínculo Person-User não foi criado corretamente', {
        userId: user.id,
        personId: person.id,
        userPersonId: user.personId,
      });
      throw new BadRequestException('Erro ao vincular usuário à pessoa. Tente novamente.');
    }

    // Verificar se o usuário está ativo
    if (!user.isActive) {
      this.logger.warn('Usuário criado mas não está ativo', {
        userId: user.id,
        personId: person.id,
      });
      // Ativar o usuário se não estiver ativo
      user.isActive = true;
      await this.usersService.update(user.id, { isActive: true });
    }

    this.logger.log('Usuário criado e vinculado com sucesso', {
      userId: user.id,
      personId: person.id,
      email: user.email,
      name: user.name,
    });

    // Incrementar contador de usos APENAS após criar o usuário com sucesso
    // Buscar código novamente para garantir que está atualizado
    const accessCodeForUpdate = await this.accessCodeRepository.findOne({
      where: { id: payload.accessCodeId },
    });

    if (accessCodeForUpdate) {
      accessCodeForUpdate.usageCount += 1;
      await this.accessCodeRepository.save(accessCodeForUpdate);
      this.logger.debug('Contador de usos incrementado após ativação bem-sucedida', {
        codeId: accessCodeForUpdate.id,
        code: accessCodeForUpdate.code,
        usageCount: accessCodeForUpdate.usageCount,
      });
    }

    logSecurityEvent('activation_completed', {
      userId: user.id,
      personId: person.id,
      codeId: payload.accessCodeId,
      email: user.email,
    });

    // Gerar token de login
    const token = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
      },
      {
        expiresIn: '24h',
      },
    );

    return { user, token };
  }

  /**
   * Lista códigos de acesso do usuário
   */
  async getAccessCodes(user: UserEntity): Promise<AccessCodeResponseDto[]> {
    const codes = await this.accessCodeRepository.find({
      where: { createdById: user.id },
      order: { createdAt: 'DESC' },
    });

    return Promise.all(codes.map((code) => this.mapToResponseDto(code)));
  }

  /**
   * Desativa um código de acesso
   */
  async deactivateAccessCode(user: UserEntity, codeId: string): Promise<void> {
    const code = await this.accessCodeRepository.findOne({
      where: { id: codeId },
    });

    if (!code) {
      throw new NotFoundException('Código de acesso não encontrado');
    }

    if (code.createdById !== user.id) {
      throw new ForbiddenException('Você não tem permissão para desativar este código');
    }

    code.isActive = false;
    await this.accessCodeRepository.save(code);

    logSecurityEvent('access_code_deactivated', {
      userId: user.id,
      codeId: code.id,
      code: code.code,
    });
  }

  /**
   * Obtém estatísticas de ativações de um código
   */
  async getActivationStats(
    user: UserEntity,
    codeId: string,
  ): Promise<{
    code: AccessCodeResponseDto;
    totalActivations: number;
  }> {
    const code = await this.accessCodeRepository.findOne({
      where: { id: codeId },
    });

    if (!code) {
      throw new NotFoundException('Código de acesso não encontrado');
    }

    if (code.createdById !== user.id) {
      throw new ForbiddenException('Você não tem permissão para ver estatísticas deste código');
    }

    // Contar usuários criados através deste código
    // Nota: Em produção, considere adicionar uma tabela de histórico de ativações
    const totalActivations = code.usageCount;

    return {
      code: await this.mapToResponseDto(code),
      totalActivations,
    };
  }

  /**
   * Mapeia entidade para DTO de resposta
   */
  private async mapToResponseDto(code: AccessCodeEntity): Promise<AccessCodeResponseDto> {
    let scopeName: string | undefined;

    try {
      if (code.scopeType === AccessCodeScopeType.CHURCH) {
        const church = await this.churchRepository.findOne({
          where: { id: code.scopeId },
        });
        scopeName = church?.name;
      } else if (code.scopeType === AccessCodeScopeType.MINISTRY) {
        const ministry = await this.ministryRepository.findOne({
          where: { id: code.scopeId },
        });
        scopeName = ministry?.name;
      } else if (code.scopeType === AccessCodeScopeType.TEAM) {
        const team = await this.teamRepository.findOne({
          where: { id: code.scopeId },
        });
        scopeName = team?.name;
      }
    } catch {
      // Ignorar erros ao buscar nome do escopo
    }

    return {
      id: code.id,
      code: code.code,
      scopeType: code.scopeType,
      scopeId: code.scopeId,
      expiresAt: code.expiresAt,
      isActive: code.isActive,
      usageCount: code.usageCount,
      maxUsages: code.maxUsages,
      createdAt: code.createdAt,
      updatedAt: code.updatedAt,
      scopeName,
      isExpired: new Date() > code.expiresAt,
    };
  }
}
