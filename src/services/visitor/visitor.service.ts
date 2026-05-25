import { Injectable } from '@nestjs/common';
import { CreateVisitorDto } from 'src/classes/create-visitor.class';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VisitorService {
  constructor(private prisma: PrismaService) {}

  async getVisitorStats(macs?: string[]) {
    const whereClause = macs && macs.length > 0 ? { mac: { in: macs } } : {};
    
    const aggregates = await this.prisma.visitorLog.groupBy({
      by: ['mac'],
      where: whereClause,
      _sum: {
        deltaIn: true,
        deltaOut: true,
      },
    });

    const statsMap = new Map<string, { totalIn: number; totalOut: number; currentInside: number }>();
    
    if (macs) {
      macs.forEach(mac => statsMap.set(mac, { totalIn: 0, totalOut: 0, currentInside: 0 }));
    }

    for (const agg of aggregates) {
      const totalIn = agg._sum.deltaIn || 0;
      const totalOut = agg._sum.deltaOut || 0;
      statsMap.set(agg.mac, {
        totalIn,
        totalOut,
        currentInside: Math.max(0, totalIn - totalOut),
      });
    }

    return statsMap;
  }

  async create(createVisitorDto: CreateVisitorDto) {
    // 1. Узнаем, сколько сейчас внутри
    const statsMap = await this.getVisitorStats([createVisitorDto.mac]);
    const currentInside = statsMap.get(createVisitorDto.mac)?.currentInside || 0;

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

  async getLogsByMac(mac: string) {
    return this.prisma.visitorLog.findMany({
      where: { mac },
      orderBy: { timestamp: 'asc' },
    });
  }

  async getCountsByDeviceId(deviceId: number) {
    const device = await this.prisma.device.findUnique({
      where: { id: deviceId },
    });

    if (!device) {
      throw new Error(`Device with ID ${deviceId} not found.`);
    }

    const statsMap = await this.getVisitorStats([device.mac]);
    const stats = statsMap.get(device.mac)!;

    return {
      deviceId,
      deviceName: device.name,
      mac: device.mac,
      ...stats,
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
