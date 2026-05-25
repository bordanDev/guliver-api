import { Body, Controller, Get, Post } from '@nestjs/common';
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
}
