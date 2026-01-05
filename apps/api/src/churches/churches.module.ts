import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChurchesService } from './churches.service';
import { ChurchesController } from './churches.controller';
import { ChurchEntity } from './entities/church.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChurchEntity])],
  controllers: [ChurchesController],
  providers: [ChurchesService],
  exports: [ChurchesService],
})
export class ChurchesModule {}
