import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './services/prisma/prisma.module';
import { VisitorModule } from './services/visitor';
import { DeviceModule } from './services/device/device.module';
import { SseModule } from './services/sse/sse.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    VisitorModule,
    DeviceModule,
    PrismaModule,
    SseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
