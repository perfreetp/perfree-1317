export interface PatrolTask {
  id: string;
  name: string;
  description: string;
  distance: number;
  duration: number;
  checkpoints: Checkpoint[];
  status: 'pending' | 'ongoing' | 'completed';
  startTime?: string;
  endTime?: string;
  boundary: {
    lat: number;
    lng: number;
  }[];
}

export interface Checkpoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  checked: boolean;
  checkedTime?: string;
  checkedDate?: string;
}

export interface ReportProgressNode {
  status: 'pending' | 'processing' | 'completed';
  statusText: string;
  time: string;
  remark?: string;
  operator?: string;
}

export interface ReportItem {
  id: string;
  type: 'poaching' | 'fire' | 'roadblock' | 'other';
  typeName: string;
  description: string;
  images: string[];
  voiceNote?: string;
  location: string;
  lat: number;
  lng: number;
  status: 'pending' | 'processing' | 'completed';
  createTime: string;
  reporter: string;
  progress?: ReportProgressNode[];
  dutyRemark?: string;
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  phone: string;
  avatar?: string;
  online: boolean;
  lat?: number;
  lng?: number;
  lastUpdate?: string;
}

export interface CheckpointRecord {
  id: string;
  name: string;
  checked: boolean;
  checkedTime?: string;
  lat: number;
  lng: number;
}

export interface PatrolRecord {
  id: string;
  taskId?: string;
  taskName?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  distance: number;
  duration: number;
  checkpoints: number;
  reports: number;
  turnBack: number;
  checkpointDetails?: CheckpointRecord[];
  reportIds?: string[];
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  type: 'urgent' | 'normal';
  createTime: string;
  read: boolean;
}

export interface SupplyPoint {
  id: string;
  name: string;
  address: string;
  distance: number;
  items: SupplyItem[];
}

export interface SupplyItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface OfflinePackage {
  id: string;
  name: string;
  size: string;
  status: 'not_downloaded' | 'downloading' | 'downloaded';
  progress?: number;
  area: string;
}

export interface UserInfo {
  id: string;
  name: string;
  role: string;
  team: string;
  totalDistance: number;
  totalDays: number;
  avatar?: string;
}
