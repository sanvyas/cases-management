import { Module } from '@nestjs/common';

import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { CasesModule } from './cases/cases.module';
import { TenantsModule } from './tenants/tenants.module';
import { GeographyModule } from './geography/geography.module';
import { CatalogueModule } from './catalogue/catalogue.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    HealthModule,
    AuthModule,
    CasesModule,
    TenantsModule,
    GeographyModule,
    CatalogueModule,
    SettingsModule,
  ],
})
export class AppModule {}
