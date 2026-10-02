import { Injectable } from '@nestjs/common';

interface LevelRecord { id: string; tenantId: string; name: string; depth: number; parentLevelId: string | null }
interface NodeRecord { id: string; tenantId: string; name: string; slug: string; levelId: string; levelName: string; parentId: string | null; path: string; status: string; lgdCode: string | null; childCount: number }

const DEMO_LEVELS: LevelRecord[] = [
  { id: 'lev-zone', tenantId: 't1', name: 'Zone', depth: 0, parentLevelId: null },
  { id: 'lev-ward', tenantId: 't1', name: 'Ward', depth: 1, parentLevelId: 'lev-zone' },
  { id: 'lev-locality', tenantId: 't1', name: 'Locality', depth: 2, parentLevelId: 'lev-ward' },
];

const DEMO_NODES: NodeRecord[] = [
  { id: 'zone-1', tenantId: 't1', name: 'Zone 1 - North', slug: 'zone-1', levelId: 'lev-zone', levelName: 'Zone', parentId: null, path: 'zone-1', status: 'active', lgdCode: null, childCount: 3 },
  { id: 'zone-2', tenantId: 't1', name: 'Zone 2 - South', slug: 'zone-2', levelId: 'lev-zone', levelName: 'Zone', parentId: null, path: 'zone-2', status: 'active', lgdCode: null, childCount: 3 },
  { id: 'ward-1', tenantId: 't1', name: 'Ward 1', slug: 'ward-1', levelId: 'lev-ward', levelName: 'Ward', parentId: 'zone-1', path: 'zone-1.ward-1', status: 'active', lgdCode: '091001', childCount: 3 },
  { id: 'ward-3', tenantId: 't1', name: 'Ward 3', slug: 'ward-3', levelId: 'lev-ward', levelName: 'Ward', parentId: 'zone-1', path: 'zone-1.ward-3', status: 'active', lgdCode: '091003', childCount: 3 },
  { id: 'ward-7', tenantId: 't1', name: 'Ward 7', slug: 'ward-7', levelId: 'lev-ward', levelName: 'Ward', parentId: 'zone-2', path: 'zone-2.ward-7', status: 'active', lgdCode: '091007', childCount: 3 },
  { id: 'ward-12', tenantId: 't1', name: 'Ward 12', slug: 'ward-12', levelId: 'lev-ward', levelName: 'Ward', parentId: 'zone-2', path: 'zone-2.ward-12', status: 'active', lgdCode: '091012', childCount: 2 },
  { id: 'sec-15', tenantId: 't1', name: 'Sector 15', slug: 'sector-15', levelId: 'lev-locality', levelName: 'Locality', parentId: 'ward-3', path: 'zone-1.ward-3.sector-15', status: 'active', lgdCode: null, childCount: 0 },
  { id: 'mohalla-ganj', tenantId: 't1', name: 'Mohalla Ganj', slug: 'mohalla-ganj', levelId: 'lev-locality', levelName: 'Locality', parentId: 'ward-7', path: 'zone-2.ward-7.mohalla-ganj', status: 'active', lgdCode: null, childCount: 0 },
  { id: 'gandhi-nagar', tenantId: 't1', name: 'Gandhi Nagar', slug: 'gandhi-nagar', levelId: 'lev-locality', levelName: 'Locality', parentId: 'ward-12', path: 'zone-2.ward-12.gandhi-nagar', status: 'active', lgdCode: null, childCount: 0 },
];

@Injectable()
export class GeographyService {
  getLevels(): LevelRecord[] {
    return DEMO_LEVELS;
  }

  getNodes(parentId?: string): NodeRecord[] {
    if (parentId) {
      return DEMO_NODES.filter(n => n.parentId === parentId);
    }
    return DEMO_NODES.filter(n => n.parentId === null);
  }

  getAllNodes(): NodeRecord[] {
    return DEMO_NODES;
  }
}
