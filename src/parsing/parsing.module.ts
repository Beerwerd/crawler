import { Module } from '@nestjs/common';
import { Parsing } from './parsing.entity';
import { ParsingService } from './parsing.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ParsingController } from './parsing.controller';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'crawler',
    }),
    TypeOrmModule.forFeature([Parsing]),
  ],
  controllers: [ParsingController],
  providers: [ParsingService],
  exports: [ParsingService],
})
export class ParsingModule {}
