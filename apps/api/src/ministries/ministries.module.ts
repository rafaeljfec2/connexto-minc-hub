import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MinistriesService } from './ministries.service';
import { MinistriesController } from './ministries.controller';
import { MinistryEntity } from './entities/ministry.entity';
import { TimeMemberEntity } from './entities/time-member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MinistryEntity, TimeMemberEntity])],
  controllers: [MinistriesController],
  providers: [MinistriesService],
  exports: [MinistriesService],
})
export class MinistriesModule {}
