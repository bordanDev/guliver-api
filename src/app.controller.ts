import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { CreateVisitorDto } from './classes/create-visitor.class';
import { VisitorService } from './services/visitor/visitor.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly visitor: VisitorService,
  ) {}

  @Get('hello')
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('/set-visitor')
  setVisitorActivities(@Body() visitorItemDto: CreateVisitorDto): void {
    this.visitor
      .create(visitorItemDto.deviceId, visitorItemDto.count)
      .catch((err) => console.log(err));
  }

  @Get('all-visitors')
  getAllVisitors() {
    return this.visitor.getAll();
  }
}
