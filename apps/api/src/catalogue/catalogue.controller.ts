import { Controller, Get, Query } from '@nestjs/common';
import { CatalogueService } from './catalogue.service';

@Controller('catalogue')
export class CatalogueController {
  constructor(private readonly catalogueService: CatalogueService) {}

  @Get('departments')
  getDepartments() {
    return this.catalogueService.getDepartments();
  }

  @Get('types')
  getTypes() {
    return this.catalogueService.getTypes();
  }

  @Get('subtypes')
  getSubtypes(@Query('typeId') typeId?: string) {
    return this.catalogueService.getSubtypes(typeId);
  }
}
