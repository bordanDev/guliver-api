import { Body, Controller, Get, Post, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { CreateVisitorDto } from './classes/create-visitor.class';
import { VisitorService } from './services/visitor/visitor.service';
import { DeviceService } from './services/device/device.service';
import { RegisterDeviceDto, HeartbeatDeviceDto } from './classes/device.dto';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly visitor: VisitorService,
    private readonly deviceService: DeviceService,
  ) {}

  @Get('hello')
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('/set-visitor')
  setVisitorActivities(@Body() visitorItemDto: CreateVisitorDto): void {
    this.visitor.create(visitorItemDto).catch((err) => console.log(err));
  }

  @Get('all-visitors')
  getAllVisitors() {
    return this.visitor.getAll();
  }

  @Post('/register')
  async registerDevice(@Body() registerDto: RegisterDeviceDto) {
    try {
      const device = await this.deviceService.register(registerDto);
      return { success: true, device };
    } catch (err) {
      console.log(`[Register Error] ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  @Post('/heartbeat')
  async heartbeatDevice(@Body() heartbeatDto: HeartbeatDeviceDto) {
    try {
      const device = await this.deviceService.heartbeat(heartbeatDto);
      return { success: true, device };
    } catch (err) {
      console.log(`[Heartbeat Error] ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  @Get('/device/:id/visitors')
  async getDeviceVisitors(@Param('id') id: string) {
    const deviceId = parseInt(id, 10);
    if (isNaN(deviceId)) {
      return { success: false, error: 'Invalid device ID' };
    }
    
    try {
      const stats = await this.visitor.getCountsByDeviceId(deviceId);
      return { success: true, data: stats };
    } catch (err) {
      console.log(`[Device Visitors Error] ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  @Post('/device/:id/reset')
  async resetDeviceVisitors(@Param('id') id: string) {
    const deviceId = parseInt(id, 10);
    if (isNaN(deviceId)) {
      return { success: false, error: 'Invalid device ID' };
    }

    try {
      const result = await this.visitor.resetCountsForDevice(deviceId);
      return result;
    } catch (err) {
      console.log(`[Device Reset Error] ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  @Get('all-devices')
  async getAllDevices() {
    try {
      const devices = await this.deviceService.getAll();
      return { success: true, data: devices };
    } catch (err) {
      console.log(`[All Devices Error] ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  @Get('/device/analytics/:mac')
  async getDeviceAnalytics(@Param('mac') mac: string) {
    try {
      const logs = await this.visitor.getLogsByMac(mac);
      return { success: true, data: logs };
    } catch (err) {
      console.log(`[Device Analytics Error] ${err.message}`);
      return { success: false, error: err.message };
    }
  }
}
