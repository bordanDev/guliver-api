import { ConfigDeviceDto } from '@guliver/shared-contracts';

export class VisitorDto implements ConfigDeviceDto {
  mac: string;
  deviceName: string;
  deltaIn: number;
  deltaOut: number;
}

export class CreateVisitorDto implements VisitorDto {
  mac: string;
  deviceName: string;
  deltaIn: number;
  deltaOut: number;
  timestamp: string;
}
