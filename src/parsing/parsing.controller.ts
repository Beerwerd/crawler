import { Controller, Get, Param } from '@nestjs/common';
import { ParsingService } from './parsing.service';
import { ApiOkResponse } from '@nestjs/swagger';
import { Parsing } from './parsing.entity';

@Controller('parsing')
export class ParsingController {
  constructor(private service: ParsingService) {}

  @Get('/:parsingId')
  @ApiOkResponse({ type: Parsing })
  async getData(@Param('parsingId') parsingId: number) {
    return this.service.getOne(parsingId);
  }
}
