import { Controller, Get, Query } from '@nestjs/common';
import { GeographyService } from './geography.service';

@Controller('geography')
export class GeographyController {
  constructor(private readonly geographyService: GeographyService) {}

  @Get('levels')
  getLevels() {
    return this.geographyService.getLevels();
  }

  @Get('nodes')
  getNodes(@Query('parentId') parentId?: string) {
    return this.geographyService.getNodes(parentId);
  }

  @Get('nodes/all')
  getAllNodes() {
    return this.geographyService.getAllNodes();
  }
}
