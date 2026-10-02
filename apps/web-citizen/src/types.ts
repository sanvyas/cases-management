export type ComplaintStatus =
  | 'RECEIVED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REOPENED';

export interface LocalizedString {
  en: string;
  hi: string;
}

export interface Category {
  id: string;
  icon: string;
  name: LocalizedString;
}

export interface SubType {
  id: string;
  categoryId: string;
  name: LocalizedString;
}

export interface TimelineEntry {
  id: string;
  date: string;
  title: LocalizedString;
  description: LocalizedString;
}

export interface Officer {
  name: string;
  phone: string;
}

export interface Complaint {
  id: string;
  caseNumber: string;
  categoryId: string;
  subTypeId: string;
  status: ComplaintStatus;
  location: LocalizedString;
  description: LocalizedString;
  dateCreated: string;
  officer?: Officer;
  timeline: TimelineEntry[];
}

export type Lang = 'en' | 'hi';
