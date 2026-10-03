import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { CasesService } from './cases.service';

@Controller('cases')
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Get()
  list(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
  ) {
    return this.casesService.list({
      status,
      search,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('dashboard')
  dashboard() {
    return this.casesService.getDashboardStats();
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.casesService.getById(id);
  }

  @Get(':id/timeline')
  getTimeline(@Param('id') id: string) {
    return this.casesService.getTimeline(id);
  }

  @Post()
  create(@Body() body: {
    subtypeId: string;
    nodeId: string;
    address: string;
    description: string;
    citizenPhone: string;
    citizenName: string;
    channel?: string;
  }) {
    return this.casesService.create(body);
  }

  @Post(':id/actions')
  performAction(
    @Param('id') id: string,
    @Body() body: { action: string; remarks?: string },
  ) {
    return this.casesService.performAction(id, body.action, body);
  }
}
