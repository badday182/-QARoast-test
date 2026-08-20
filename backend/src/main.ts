import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // No global prefix: the assessment fixes the routes at /quizzes*.
  app.enableCors({
    origin: config.get<string>('CORS_ORIGIN', 'http://localhost:3000'),
  });
  app.enableShutdownHooks();

  await app.listen(config.get<number>('PORT', 4000));
}
void bootstrap();
