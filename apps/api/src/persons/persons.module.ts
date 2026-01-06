import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonsService } from './persons.service';
import { PersonsController } from './persons.controller';
import { PersonEntity } from './entities/person.entity';
import { TeamMemberEntity } from '../teams/entities/team-member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PersonEntity, TeamMemberEntity])],
  controllers: [PersonsController],
  providers: [PersonsService],
  exports: [PersonsService],
})
export class PersonsModule {}
