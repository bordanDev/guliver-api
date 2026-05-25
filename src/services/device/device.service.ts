import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDeviceDto, HeartbeatDeviceDto } from 'src/classes/device.dto';

@Injectable()
export class DeviceService {
  constructor(private prisma: PrismaService) {}

  async register(dto: RegisterDeviceDto) {
    return this.prisma.device.upsert({
      where: { mac: dto.mac },
      update: {
        name: dto.deviceName,
        ip: dto.ip,
        firmware: dto.firmware,
        last_seen: new Date(),
      },
      create: {
        mac: dto.mac,
        name: dto.deviceName,
        ip: dto.ip,
        firmware: dto.firmware,
        last_seen: new Date(),
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
      },
    });
  }
}
