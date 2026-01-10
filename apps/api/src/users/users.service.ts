import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError, SelectQueryBuilder } from 'typeorm';
import { UserEntity, UserRole } from './entities/user.entity';

const USER_SELECT_FIELDS = [
  'user.id',
  'user.email',
  'user.name',
  'user.role',
  'user.isActive',
  'user.personId',
  'user.avatar',
  'user.canCheckIn',
  'user.lastLoginAt',
  'user.createdAt',
  'user.updatedAt',
] as const;

const PERSON_SELECT_FIELDS = ['person.id', 'person.name', 'person.email', 'person.phone'] as const;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async findOne(id: string): Promise<UserEntity | null> {
    return this.createBaseQuery()
      .where('user.id = :id', { id })
      .andWhere('user.deletedAt IS NULL')
      .getOne();
  }

  async findAuthUser(email: string): Promise<UserEntity | null> {
    return this.createBaseQuery()
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .andWhere('user.deletedAt IS NULL')
      .getOne();
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.findAuthUser(email);
  }

  async findByPersonId(personId: string): Promise<UserEntity | null> {
    return this.createBaseQuery()
      .where('user.personId = :personId', { personId })
      .andWhere('user.deletedAt IS NULL')
      .getOne();
  }

  async create(userData: {
    email: string;
    passwordHash: string;
    name: string;
    role?: UserRole;
    personId?: string | null;
  }): Promise<UserEntity> {
    try {
      const user = this.usersRepository.create({
        ...userData,
        role: userData.role ?? UserRole.SERVO,
        isActive: true,
      });
      return await this.usersRepository.save(user);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.message.includes('duplicate key') ||
          error.message.includes('unique constraint') ||
          error.message.includes('users_email_key'))
      ) {
        throw new ConflictException(`User with email ${userData.email} already exists`);
      }
      throw error;
    }
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.usersRepository.update(userId, {
      lastLoginAt: new Date(),
    });
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.usersRepository.update(userId, { passwordHash });
  }

  async updateAvatar(userId: string, avatarUrl: string): Promise<UserEntity> {
    const user = await this.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.usersRepository.update(userId, { avatar: avatarUrl });
    return { ...user, avatar: avatarUrl };
  }

  async findAll(): Promise<UserEntity[]> {
    return this.createBaseQuery()
      .where('user.deletedAt IS NULL')
      .orderBy('user.name', 'ASC')
      .getMany();
  }

  private createBaseQuery(): SelectQueryBuilder<UserEntity> {
    return this.usersRepository
      .createQueryBuilder('user')
      .select([...USER_SELECT_FIELDS, ...PERSON_SELECT_FIELDS])
      .leftJoin('user.person', 'person');
  }

  async update(id: string, updateData: Partial<UserEntity>): Promise<UserEntity> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    try {
      Object.assign(user, updateData);
      return await this.usersRepository.save(user);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.message.includes('duplicate key') ||
          error.message.includes('unique constraint') ||
          error.message.includes('users_email_key'))
      ) {
        throw new ConflictException(`User with email ${updateData.email} already exists`);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.usersRepository.softDelete(id);
  }
}
