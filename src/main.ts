import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Env } from './config/env';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as fs from 'fs';
import { join } from 'path';
import { AppModule } from './app.module';

(async (): Promise<void> => {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.setGlobalPrefix(Env.API_PREFIX);
  app.useGlobalPipes(
    new ValidationPipe({ forbidUnknownValues: true, whitelist: true }),
  );

  const config = new DocumentBuilder()
    .setTitle('Cround Compiler API')
    .setDescription('Cround Compiler Structure API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  fs.writeFileSync(
    join(__dirname, '../docs/openapi.json'),
    JSON.stringify(document, null, 2),
  );
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(Env.SERVER_PORT);
  console.log(`Server is running on port: ${Env.SERVER_PORT}`);
})();
