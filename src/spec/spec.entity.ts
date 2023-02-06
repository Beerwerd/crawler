import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../product/product.entity';

@Entity()
@Expose()
export class Spec {
  @PrimaryGeneratedColumn()
  @Type(() => Number)
  @ApiProperty()
  id: number;

  @Column('varchar', { nullable: true })
  @ApiProperty()
  category: string;

  @Column('varchar')
  @ApiProperty()
  value: string;

  @Column('varchar')
  @ApiProperty()
  name: string;

  @Column('int')
  productId: number;

  @ManyToOne(() => Product, (product) => product.specs, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  product: Product;
}
