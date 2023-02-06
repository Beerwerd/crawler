import { Injectable } from '@nestjs/common';
import { Spec } from './spec.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SpecService {
  constructor(
    @InjectRepository(Spec)
    private specRepo: Repository<Spec>,
  ) {}

  async save(specs: Spec[]): Promise<Spec[]> {
    return this.specRepo.save(specs);
  }
}
