import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MinistriesService } from './ministries.service';
import { MinistriesController } from './ministries.controller';
import { MinistryEntity } from './entities/ministry.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MinistryEntity])],
  controllers: [MinistriesController],
  providers: [MinistriesService],
  exports: [MinistriesService],
})
export class MinistriesModule {}
