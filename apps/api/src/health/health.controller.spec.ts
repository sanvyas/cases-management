import { Test } from '@nestjs/testing';
import { describe, it, expect, beforeEach } from 'vitest';

import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get(HealthController);
  });

  it('healthz returns ok', () => {
    const result = controller.healthz();
    expect(result.status).toBe('ok');
    expect(result.timestamp).toBeDefined();
  });

  it('readyz returns ok', () => {
    const result = controller.readyz();
    expect(result.status).toBe('ok');
    expect(result.timestamp).toBeDefined();
  });
});
