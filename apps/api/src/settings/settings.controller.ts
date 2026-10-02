import { Controller, Get, Put, Body, Param, Query } from '@nestjs/common';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  list(@Query('group') group?: string) {
    return this.settingsService.list(group);
  }

  @Get(':key')
  get(@Param('key') key: string) {
    return this.settingsService.get(key);
  }

  @Put(':key')
  update(@Param('key') key: string, @Body() body: { value: unknown }) {
    return this.settingsService.update(key, body.value);
  }
}
