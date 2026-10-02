import { Injectable } from '@nestjs/common';

interface DepartmentRecord { id: string; tenantId: string; name: string; code: string; status: string }
interface TypeRecord { id: string; tenantId: string; name: string; icon: string; displayOrder: number; status: string; subtypeCount: number }
interface SubtypeRecord { id: string; tenantId: string; typeId: string; typeName: string; departmentId: string; departmentName: string; name: string; code: string; slaHours: number; assignmentMode: string; priority: string; evidenceRequired: boolean; minPhotos: number; atrLevels: number; eotLevels: number; transferLevels: number; status: string }

const DEPARTMENTS: DepartmentRecord[] = [
  { id: 'd1', tenantId: 't1', name: 'Water Supply', code: 'WATER', status: 'active' },
  { id: 'd2', tenantId: 't1', name: 'Sanitation & Garbage', code: 'SANITATION', status: 'active' },
  { id: 'd3', tenantId: 't1', name: 'Roads', code: 'ROADS', status: 'active' },
  { id: 'd4', tenantId: 't1', name: 'Streetlights', code: 'LIGHTS', status: 'active' },
  { id: 'd5', tenantId: 't1', name: 'Sewerage & Drains', code: 'SEWERAGE', status: 'active' },
  { id: 'd6', tenantId: 't1', name: 'Horticulture', code: 'HORTI', status: 'active' },
  { id: 'd7', tenantId: 't1', name: 'Encroachment / Enforcement', code: 'ENCROACH', status: 'active' },
  { id: 'd8', tenantId: 't1', name: 'Health', code: 'HEALTH', status: 'active' },
];

const TYPES: TypeRecord[] = [
  { id: 'typ-water', tenantId: 't1', name: 'Water Supply', icon: 'droplet', displayOrder: 1, status: 'active', subtypeCount: 4 },
  { id: 'typ-sanitation', tenantId: 't1', name: 'Sanitation & Garbage', icon: 'trash', displayOrder: 2, status: 'active', subtypeCount: 4 },
  { id: 'typ-roads', tenantId: 't1', name: 'Roads', icon: 'road', displayOrder: 3, status: 'active', subtypeCount: 3 },
  { id: 'typ-lights', tenantId: 't1', name: 'Streetlights', icon: 'lightbulb', displayOrder: 4, status: 'active', subtypeCount: 3 },
  { id: 'typ-sewerage', tenantId: 't1', name: 'Sewerage & Drains', icon: 'pipe', displayOrder: 5, status: 'active', subtypeCount: 3 },
  { id: 'typ-horti', tenantId: 't1', name: 'Horticulture', icon: 'tree', displayOrder: 6, status: 'active', subtypeCount: 2 },
  { id: 'typ-encroach', tenantId: 't1', name: 'Encroachment', icon: 'shield', displayOrder: 7, status: 'active', subtypeCount: 2 },
  { id: 'typ-health', tenantId: 't1', name: 'Health', icon: 'heart', displayOrder: 8, status: 'active', subtypeCount: 2 },
];

const SUBTYPES: SubtypeRecord[] = [
  { id: 's1', tenantId: 't1', typeId: 'typ-water', typeName: 'Water Supply', departmentId: 'd1', departmentName: 'Water Supply', name: 'No water supply', code: 'WATER-001', slaHours: 24, assignmentMode: 'vendor_auto', priority: 'normal', evidenceRequired: true, minPhotos: 1, atrLevels: 2, eotLevels: 1, transferLevels: 1, status: 'active' },
  { id: 's1b', tenantId: 't1', typeId: 'typ-water', typeName: 'Water Supply', departmentId: 'd1', departmentName: 'Water Supply', name: 'Contaminated water', code: 'WATER-002', slaHours: 24, assignmentMode: 'internal_auto', priority: 'high', evidenceRequired: true, minPhotos: 2, atrLevels: 2, eotLevels: 1, transferLevels: 1, status: 'active' },
  { id: 's1c', tenantId: 't1', typeId: 'typ-water', typeName: 'Water Supply', departmentId: 'd1', departmentName: 'Water Supply', name: 'Pipeline leakage', code: 'WATER-003', slaHours: 48, assignmentMode: 'internal_auto', priority: 'normal', evidenceRequired: true, minPhotos: 1, atrLevels: 2, eotLevels: 1, transferLevels: 1, status: 'active' },
  { id: 's1d', tenantId: 't1', typeId: 'typ-water', typeName: 'Water Supply', departmentId: 'd1', departmentName: 'Water Supply', name: 'Main line burst', code: 'WATER-004', slaHours: 12, assignmentMode: 'internal_auto', priority: 'high', evidenceRequired: true, minPhotos: 1, atrLevels: 2, eotLevels: 1, transferLevels: 1, status: 'active' },
  { id: 's2', tenantId: 't1', typeId: 'typ-sanitation', typeName: 'Sanitation & Garbage', departmentId: 'd2', departmentName: 'Sanitation & Garbage', name: 'Garbage not collected', code: 'SAN-001', slaHours: 24, assignmentMode: 'field_auto', priority: 'normal', evidenceRequired: true, minPhotos: 1, atrLevels: 1, eotLevels: 1, transferLevels: 1, status: 'active' },
  { id: 's2b', tenantId: 't1', typeId: 'typ-sanitation', typeName: 'Sanitation & Garbage', departmentId: 'd2', departmentName: 'Sanitation & Garbage', name: 'Garbage dumped on public land', code: 'SAN-002', slaHours: 48, assignmentMode: 'field_auto', priority: 'normal', evidenceRequired: true, minPhotos: 2, atrLevels: 1, eotLevels: 1, transferLevels: 1, status: 'active' },
  { id: 's3', tenantId: 't1', typeId: 'typ-roads', typeName: 'Roads', departmentId: 'd3', departmentName: 'Roads', name: 'Pothole', code: 'ROAD-001', slaHours: 168, assignmentMode: 'internal_auto', priority: 'normal', evidenceRequired: true, minPhotos: 2, atrLevels: 3, eotLevels: 1, transferLevels: 1, status: 'active' },
  { id: 's3b', tenantId: 't1', typeId: 'typ-roads', typeName: 'Roads', departmentId: 'd3', departmentName: 'Roads', name: 'Broken footpath', code: 'ROAD-002', slaHours: 360, assignmentMode: 'internal_auto', priority: 'normal', evidenceRequired: true, minPhotos: 1, atrLevels: 2, eotLevels: 1, transferLevels: 1, status: 'active' },
  { id: 's4', tenantId: 't1', typeId: 'typ-lights', typeName: 'Streetlights', departmentId: 'd4', departmentName: 'Streetlights', name: 'Streetlight not working', code: 'LIGHT-001', slaHours: 72, assignmentMode: 'vendor_auto', priority: 'normal', evidenceRequired: true, minPhotos: 1, atrLevels: 2, eotLevels: 1, transferLevels: 1, status: 'active' },
  { id: 's4b', tenantId: 't1', typeId: 'typ-lights', typeName: 'Streetlights', departmentId: 'd4', departmentName: 'Streetlights', name: 'Sparking/hanging wire', code: 'LIGHT-002', slaHours: 6, assignmentMode: 'internal_auto', priority: 'emergency', evidenceRequired: false, minPhotos: 0, atrLevels: 1, eotLevels: 0, transferLevels: 0, status: 'active' },
  { id: 's5', tenantId: 't1', typeId: 'typ-sewerage', typeName: 'Sewerage & Drains', departmentId: 'd5', departmentName: 'Sewerage & Drains', name: 'Sewer overflow', code: 'SEW-001', slaHours: 24, assignmentMode: 'internal_auto', priority: 'high', evidenceRequired: true, minPhotos: 1, atrLevels: 2, eotLevels: 1, transferLevels: 1, status: 'active' },
  { id: 's5b', tenantId: 't1', typeId: 'typ-sewerage', typeName: 'Sewerage & Drains', departmentId: 'd5', departmentName: 'Sewerage & Drains', name: 'Manhole cover missing', code: 'SEW-002', slaHours: 24, assignmentMode: 'internal_auto', priority: 'high', evidenceRequired: true, minPhotos: 1, atrLevels: 2, eotLevels: 1, transferLevels: 1, status: 'active' },
];

@Injectable()
export class CatalogueService {
  getDepartments(): DepartmentRecord[] {
    return DEPARTMENTS;
  }

  getTypes(): TypeRecord[] {
    return TYPES;
  }

  getSubtypes(typeId?: string): SubtypeRecord[] {
    if (typeId) {
      return SUBTYPES.filter(s => s.typeId === typeId);
    }
    return SUBTYPES;
  }
}
