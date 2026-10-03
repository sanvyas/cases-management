export type Lang = 'en' | 'hi';

export interface SubType {
  id: string;
  hi: string;
  en: string;
  icon: string;
  sla: string;
  slaEn: string;
}

export interface Category {
  id: string;
  hi: string;
  en: string;
  icon: string;
  bg: string;
  fg: string;
  subs: SubType[];
}

export interface LocationNode {
  id: string;
  hi: string;
  en: string;
  landmark: string;
}

export type ComplaintStep = 0 | 1 | 2 | 3;

export interface MockComplaint {
  id: string;
  caseNumber: string;
  catIndex: number;
  subIndex: number;
  locIndex: number;
  date: string;
  step: ComplaintStep;
  times: string[];
  workerName: string;
  workerRole: string;
  dueText: string;
}
