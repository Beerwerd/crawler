import { IsBoolean, IsOptional } from 'class-validator';

export class ParsingManufacturerDto {
  @IsBoolean()
  @IsOptional()
  parse?: boolean;
}
