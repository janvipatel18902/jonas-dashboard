import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OpenEdxController } from './open-edx.controller';
import { OpenEdxService } from './open-edx.service';

@Module({
  imports: [ConfigModule],
  controllers: [OpenEdxController],
  providers: [OpenEdxService],
})
export class OpenEdxModule {}
