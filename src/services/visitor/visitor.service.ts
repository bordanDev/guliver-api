import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VisitorService {
  constructor(private prisma: PrismaService) {}

  create(deviceId: string, count: number, timestamp?: string) {
    return this.prisma.visitorLog.create({
      data: {
        deviceId: deviceId,
        count: count,
        timestamp: timestamp ?? new Date(),
      },
    });
  }

  getAll() {
    return this.prisma.visitorLog.findMany();
  }
}
