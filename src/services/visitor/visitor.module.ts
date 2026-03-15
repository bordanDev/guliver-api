import { Global, Module } from '@nestjs/common';
import { VisitorService } from './visitor.service';

@Global()
@Module({
  providers: [VisitorService],
  exports: [VisitorService],
})
export class VisitorModule {}
