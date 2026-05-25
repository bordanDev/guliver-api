import { Injectable } from '@nestjs/common';
import { CreateVisitorDto } from 'src/classes/create-visitor.class';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VisitorService {
  constructor(private prisma: PrismaService) {}

  async create(createVisitorDto: CreateVisitorDto) {
    // 1. Узнаем, сколько сейчас внутри
    const aggregation = await this.prisma.visitorLog.aggregate({
      where: { mac: createVisitorDto.mac },
      _sum: {
        deltaIn: true,
        deltaOut: true,
      },
    });

    const currentIn = aggregation._sum.deltaIn || 0;
    const currentOut = aggregation._sum.deltaOut || 0;
    const currentInside = currentIn - currentOut;

    let actualDeltaOut = createVisitorDto.deltaOut;

    // 2. Логика защиты: вышедших не может быть больше, чем вошедших
    if (currentInside + createVisitorDto.deltaIn < actualDeltaOut) {
      console.warn(
        `[Visitor Logic] Несоответствие для MAC ${createVisitorDto.mac}. ` +
        `Попытка выхода ${actualDeltaOut} чел., но внутри только ${currentInside + createVisitorDto.deltaIn}.`
      );
      actualDeltaOut = currentInside + createVisitorDto.deltaIn; // Обрезаем до реального максимума
    }

    return this.prisma.visitorLog.create({
      data: {
        mac: createVisitorDto.mac,
        deltaIn: createVisitorDto.deltaIn,
        deltaOut: actualDeltaOut,
        deviceName: createVisitorDto.deviceName,
        timestamp: createVisitorDto.timestamp ?? new Date(),
      },
    });
  }

  getAll() {
    return this.prisma.visitorLog.findMany();
  }

  async getCountsByDeviceId(deviceId: number) {
    const device = await this.prisma.device.findUnique({
      where: { id: deviceId },
    });

    if (!device) {
      throw new Error(`Device with ID ${deviceId} not found.`);
    }

    const aggregation = await this.prisma.visitorLog.aggregate({
      where: { mac: device.mac },
      _sum: {
        deltaIn: true,
        deltaOut: true,
      },
    });

    const totalIn = aggregation._sum.deltaIn || 0;
    const totalOut = aggregation._sum.deltaOut || 0;

    return {
      deviceId,
      deviceName: device.name,
      mac: device.mac,
      totalIn,
      totalOut,
      currentInside: Math.max(0, totalIn - totalOut),
    };
  }

  async resetCountsForDevice(deviceId: number) {
    const device = await this.prisma.device.findUnique({
      where: { id: deviceId },
    });

    if (!device) {
      throw new Error(`Device with ID ${deviceId} not found.`);
    }

    // Удаляем все записи визитов для данного устройства
    await this.prisma.visitorLog.deleteMany({
      where: { mac: device.mac },
    });

    return { success: true, message: `Counters reset for device ${deviceId}` };
  }
}
