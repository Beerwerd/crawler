import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Manufacturer } from '../manufacturer/manufacturer.entity';
import { Parsing } from '../parsing/parsing.entity';
import { Spec } from '../spec/spec.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  @Type(() => Number)
  @ApiProperty()
  id: number;

  @Index({ unique: true })
  @Column('varchar')
  @ApiProperty()
  url: string;

  @Column('varchar', { nullable: true })
  @ApiProperty()
  title: string;

  @Column('varchar', { nullable: true })
  @ApiProperty()
  name: string;

  @Column('varchar', { nullable: true })
  @ApiProperty()
  price: string;

  @Column('varchar', { nullable: true })
  @ApiProperty()
  currency: string;

  @OneToMany(() => Spec, (spec) => spec.product)
  specs: Spec[];

  @Column('int')
  manufacturerId: number;

  @ManyToOne(() => Manufacturer, (manufacturer) => manufacturer.products, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  manufacturer: Manufacturer;

  @Column('int', { nullable: true })
  parsingId: number;

  @OneToOne(() => Parsing, (parsing) => parsing.product)
  @JoinColumn()
  parsing: Parsing;
}
