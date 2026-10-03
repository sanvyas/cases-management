import { Injectable } from '@nestjs/common';

interface SettingRecord {
  key: string;
  value: unknown;
  scope: string;
  description: string;
  group: string;
}

const DEMO_SETTINGS: SettingRecord[] = [
  { key: 'general.name', value: 'Demo Nagar Nigam', scope: 'tenant', description: 'Organization name', group: 'general' },
  { key: 'general.short_name', value: 'DNN', scope: 'tenant', description: 'Short name', group: 'general' },
  { key: 'general.case_prefix', value: 'GMD', scope: 'tenant', description: 'Case number prefix', group: 'general' },
  { key: 'general.timezone', value: 'Asia/Kolkata', scope: 'tenant', description: 'Timezone', group: 'general' },
  { key: 'general.default_language', value: 'hi', scope: 'tenant', description: 'Default language', group: 'general' },
  { key: 'general.enabled_languages', value: ['en', 'hi'], scope: 'tenant', description: 'Enabled languages', group: 'general' },
  { key: 'case.default_sla_hours', value: 48, scope: 'tenant', description: 'Default SLA hours', group: 'case_rules' },
  { key: 'case.acceptance_timeout_minutes', value: 10, scope: 'tenant', description: 'Acceptance timeout in minutes', group: 'case_rules' },
  { key: 'case.reopen_window_days', value: 7, scope: 'tenant', description: 'Reopen window in days', group: 'case_rules' },
  { key: 'case.max_reopens', value: 3, scope: 'tenant', description: 'Maximum reopens allowed', group: 'case_rules' },
  { key: 'case.auto_close_days', value: 15, scope: 'tenant', description: 'Auto-close days after resolution', group: 'case_rules' },
  { key: 'messaging.quiet_hours_start', value: '22:00', scope: 'tenant', description: 'Quiet hours start', group: 'messaging' },
  { key: 'messaging.quiet_hours_end', value: '07:00', scope: 'tenant', description: 'Quiet hours end', group: 'messaging' },
  { key: 'messaging.sms_sender_id', value: 'SMDHAN', scope: 'tenant', description: 'SMS sender ID', group: 'messaging' },
  { key: 'security.staff_2fa_required', value: false, scope: 'tenant', description: 'Require 2FA for staff', group: 'security' },
  { key: 'security.session_timeout_minutes', value: 30, scope: 'tenant', description: 'Session timeout in minutes', group: 'security' },
];

@Injectable()
export class SettingsService {
  private settings = [...DEMO_SETTINGS];

  list(group?: string): SettingRecord[] {
    if (group) {
      return this.settings.filter(s => s.group === group);
    }
    return this.settings;
  }

  get(key: string): SettingRecord | undefined {
    return this.settings.find(s => s.key === key);
  }

  update(key: string, value: unknown): SettingRecord {
    const setting = this.settings.find(s => s.key === key);
    if (setting) {
      setting.value = value;
    }
    return setting!;
  }
}
