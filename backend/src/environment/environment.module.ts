import { Module } from '@nestjs/common';
import { EnvironmentController } from './environment.controller';

@Module({
  controllers: [EnvironmentController],
})
export class EnvironmentModule {}
