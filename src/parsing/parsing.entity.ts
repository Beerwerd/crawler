import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Manufacturer } from '../manufacturer/manufacturer.entity';
import { Product } from '../product/product.entity';

export enum ParsingStatusEnum {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  ERROR = 'error',
}

@Entity()
export class Parsing {
  @PrimaryGeneratedColumn()
  @Type(() => Number)
  @ApiProperty()
  id: number;

  @Column({
    type: 'enum',
    enum: ParsingStatusEnum,
    default: ParsingStatusEnum.PENDING,
  })
  @ApiProperty({ enum: ParsingStatusEnum, enumName: 'ParsingStatusEnum' })
  status: ParsingStatusEnum = ParsingStatusEnum.PENDING;

  @Column('int', { default: 0 })
  @ApiProperty()
  progress?: number;

  @Column('text', { nullable: true })
  @ApiProperty()
  error?: string;

  @OneToOne(() => Manufacturer, (manufacturer) => manufacturer.parsing)
  manufacturer?: Manufacturer;

  @OneToOne(() => Product, (product) => product.parsing)
  product?: Product;
}
