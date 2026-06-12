export type LinkStatus = 'pending' | 'up' | 'down';

export interface LinkItem {
  id: number;
  name: string | null;
  url: string;
  groupId: number;
  isActive: boolean;
  sortOrder: number;
  lastStatus: LinkStatus;
  lastStatusCode: number | null;
  lastResponseTimeMs: number | null;
  lastCheckedAt: string | null;
  lastError: string | null;
  failCount: number;
  group?: Group;
}

export interface Group {
  id: number;
  key: string;
  nameEn: string;
  nameZh: string;
  descriptionEn: string | null;
  descriptionZh: string | null;
  sortOrder: number;
  links?: LinkItem[];
}

export interface StatusSummary {
  total: number;
  up: number;
  down: number;
  pending: number;
}

export interface StatusResponse {
  lastUpdated: string | null;
  intervalSeconds: number;
  siteTitleEn: string;
  siteTitleZh: string;
  summary: StatusSummary;
  groups: (Group & { links: LinkItem[] })[];
}

export interface SettingsMap {
  check_interval_seconds: string;
  request_timeout_ms: string;
  alerts_enabled: string;
  recovery_alerts_enabled: string;
  site_title_en: string;
  site_title_zh: string;
  [key: string]: string;
}

export interface AlertEmail {
  id: number;
  email: string;
  isActive: boolean;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}
