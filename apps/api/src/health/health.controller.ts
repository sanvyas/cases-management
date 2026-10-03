import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('healthz')
  healthz() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('readyz')
  readyz() {
    // TODO(phase-01): check DB and Redis connectivity
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
