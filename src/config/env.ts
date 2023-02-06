import { z } from 'zod';
import * as dotenv from 'dotenv';
dotenv.config({ path: `${__dirname}/../../.env` });

const portValidation = z
  .string()
  .transform((v) => +v)
  .refine(
    (v) => v > 1 && v < 65555,
    (v) => ({ message: `'${v}' is not correct port` }),
  );

export const SchemaBody = z
  .object({
    SERVER_PORT: portValidation,
    API_PREFIX: z.string(),

    POSTGRES_HOST: z.string(),
    POSTGRES_PORT: portValidation,
    POSTGRES_USER: z.string(),
    POSTGRES_PASSWORD: z.string().min(6),
    POSTGRES_DB: z.string(),
    WAITING_TIMEOUT: z
      .string()
      .transform((v) => +v)
      .default('3000'),

    REDIS_HOST: z.string(),
    REDIS_PORT: portValidation,
  })
  .passthrough();

export const Env = SchemaBody.parse(process.env);
