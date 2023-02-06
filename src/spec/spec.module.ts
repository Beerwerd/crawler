import { Module } from '@nestjs/common';
import { SpecService } from './spec.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Spec } from './spec.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Spec])],
  providers: [SpecService],
  exports: [SpecService],
})
export class SpecModule {}
