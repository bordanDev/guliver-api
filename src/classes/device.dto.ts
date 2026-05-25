export class RegisterDeviceDto {
  mac: string;
  deviceName: string;
  firmware: string;
  ip: string;
}

export class HeartbeatDeviceDto {
  mac: string;
}
