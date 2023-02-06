import { Env } from './env';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const dbConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: Env.POSTGRES_HOST,
  port: Env.POSTGRES_PORT,
  username: Env.POSTGRES_USER,
  password: Env.POSTGRES_PASSWORD,
  database: Env.POSTGRES_DB,
  entities: [`${__dirname}/../**/*.entity{.ts,.js}`],
  migrations: [`${__dirname}/../db/migrations/**/*{.ts,.js}`],
  migrationsRun: false,
  logging: false,
  synchronize: false,
  dropSchema: false,
};

const seedsConfig = {
  ...dbConfig,
  seeds: ['src/db/seeds/seeder.ts'],
};

export default seedsConfig;
