import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDeviceDto, HeartbeatDeviceDto } from 'src/classes/device.dto';

@Injectable()
export class DeviceService implements OnModuleInit, OnModuleDestroy {
  private intervalId: NodeJS.Timeout;

  constructor(private prisma: PrismaService) {}

  onModuleInit() {
    // Run status update every 15 seconds
    this.intervalId = setInterval(() => this.updateDeviceStatuses(), 15000);
  }

  onModuleDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  async updateDeviceStatuses() {
    const now = new Date();
    const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000);
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    // Update to 'online' (for devices that were somehow marked otherwise but have recent last_seen)
    await this.prisma.device.updateMany({
      where: {
        last_seen: { gte: thirtySecondsAgo },
        status: { not: 'online' },
      },
      data: { status: 'online' },
    });

    // Update to 'idle'
    await this.prisma.device.updateMany({
      where: {
        last_seen: {
          lt: thirtySecondsAgo,
          gte: fiveMinutesAgo,
        },
        status: { not: 'idle' },
      },
      data: { status: 'idle' },
    });

    // Update to 'offline' (excluding 'never seen' devices which shouldn't be touched here if they have no last_seen, 
    // but in our DB last_seen defaults to now() so they will become offline eventually)
    await this.prisma.device.updateMany({
      where: {
        last_seen: { lt: fiveMinutesAgo },
        status: { notIn: ['offline', 'never seen'] },
      },
      data: { status: 'offline' },
    });
  }

  async register(dto: RegisterDeviceDto) {
    return this.prisma.device.upsert({
      where: { mac: dto.mac },
      update: {
        name: dto.deviceName,
        ip: dto.ip,
        firmware: dto.firmware,
        last_seen: new Date(),
        status: 'online',
      },
      create: {
        mac: dto.mac,
        name: dto.deviceName,
        ip: dto.ip,
        firmware: dto.firmware,
        last_seen: new Date(),
        status: 'online',
      },
    });
  }

  async heartbeat(dto: HeartbeatDeviceDto) {
    const device = await this.prisma.device.findUnique({
      where: { mac: dto.mac },
    });

    if (!device) {
      throw new Error(`Device with MAC ${dto.mac} not found. Please register first.`);
    }

    return this.prisma.device.update({
      where: { mac: dto.mac },
      data: {
        last_seen: new Date(),
        status: 'online',
      },
    });
  }
}
