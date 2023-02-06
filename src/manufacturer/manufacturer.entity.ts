import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../product/product.entity';
import { Parsing } from '../parsing/parsing.entity';

@Entity()
export class Manufacturer {
  @PrimaryGeneratedColumn()
  @Type(() => Number)
  @ApiProperty()
  id: number;

  @Column('varchar')
  @ApiProperty()
  brand: string;

  @Column('varchar')
  @ApiProperty()
  url: string;

  @Column('int', { nullable: true })
  parsingId: number;

  @OneToOne(() => Parsing, (parsing) => parsing.manufacturer)
  @JoinColumn()
  parsing: Parsing;

  @OneToMany(() => Product, (product) => product.manufacturer)
  products: Product[];
}
