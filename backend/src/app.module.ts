import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QuizzesModule } from './quizzes/quizzes.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), QuizzesModule],
})
export class AppModule {}
