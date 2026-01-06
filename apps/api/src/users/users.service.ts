import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { UserEntity, UserRole } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  async findOne(id: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['person'],
    });
  }

  async findAuthUser(email: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({
      where: { email, deletedAt: IsNull() },
      relations: ['person'],
    });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.findAuthUser(email);
  }

  async create(userData: {
    email: string;
    passwordHash: string;
    name: string;
    role?: UserRole;
    personId?: string | null;
  }): Promise<UserEntity> {
    const user = this.usersRepository.create({
      ...userData,
      role: userData.role ?? UserRole.SERVO,
      isActive: true,
    });
    return this.usersRepository.save(user);
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.usersRepository.update(userId, {
      lastLoginAt: new Date(),
    });
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.usersRepository.update(userId, { passwordHash });
  }

  async findAll(): Promise<UserEntity[]> {
    return this.usersRepository.find({
      where: { deletedAt: IsNull() },
      relations: ['person'],
    });
  }

  async update(id: string, updateData: Partial<UserEntity>): Promise<UserEntity> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    Object.assign(user, updateData);
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.usersRepository.softDelete(id);
  }
}
