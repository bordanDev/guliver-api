import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from 'prisma/generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      // В новых версиях Prisma используем datasourceUrl вместо вложенного объекта
      datasourceUrl: process.env.DATABASE_URL,
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ База данных подключена');
    } catch (error) {
      console.error('❌ Ошибка подключения к БД:', error);
    }
  }
}
