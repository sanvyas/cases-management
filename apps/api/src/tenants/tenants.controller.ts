import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { TenantsService } from './tenants.service';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  list() {
    return this.tenantsService.list();
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.tenantsService.getById(id);
  }

  @Post()
  create(@Body() body: { name: string; slug: string; planId: string; timezone?: string; defaultLanguage?: string }) {
    return this.tenantsService.create(body);
  }
}
