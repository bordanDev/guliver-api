import { Injectable } from '@nestjs/common';
import { CreateVisitorDto } from 'src/classes/create-visitor.class';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VisitorService {
  constructor(private prisma: PrismaService) {}

  create(createVisitorDto: CreateVisitorDto) {
    return this.prisma.visitorLog.create({
      data: {
        mac: createVisitorDto.mac,
        deltaIn: createVisitorDto.deltaIn,
        deltaOut: createVisitorDto.deltaOut,
        deviceName: createVisitorDto.deviceName,
        timestamp: createVisitorDto.timestamp ?? new Date(),
      },
    });
  }

  getAll() {
    return this.prisma.visitorLog.findMany();
  }
}
