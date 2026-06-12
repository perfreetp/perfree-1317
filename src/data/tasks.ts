import { PatrolTask } from '@/types';

export const taskList: PatrolTask[] = [
  {
    id: 'task001',
    name: '东线A段巡护路线',
    description: '负责东线A段常规巡护，重点检查森林防火和偷猎情况',
    distance: 5.2,
    duration: 120,
    status: 'pending',
    boundary: [
      { lat: 30.6598, lng: 104.0657 },
      { lat: 30.6620, lng: 104.0680 },
      { lat: 30.6650, lng: 104.0700 },
      { lat: 30.6680, lng: 104.0680 },
      { lat: 30.6700, lng: 104.0650 },
    ],
    checkpoints: [
      { id: 'cp1', name: '东门检查站', lat: 30.6598, lng: 104.0657, checked: false },
      { id: 'cp2', name: '松树坡', lat: 30.6630, lng: 104.0670, checked: false },
      { id: 'cp3', name: '瞭望塔', lat: 30.6660, lng: 104.0690, checked: false },
      { id: 'cp4', name: '北入口', lat: 30.6690, lng: 104.0660, checked: false },
    ],
  },
  {
    id: 'task002',
    name: '西线B段巡护路线',
    description: '西线B段重点区域，包含文物古迹周边巡查',
    distance: 3.8,
    duration: 90,
    status: 'ongoing',
    startTime: '2024-01-15 09:00',
    boundary: [
      { lat: 30.6550, lng: 104.0580 },
      { lat: 30.6580, lng: 104.0550 },
      { lat: 30.6610, lng: 104.0570 },
      { lat: 30.6630, lng: 104.0600 },
    ],
    checkpoints: [
      { id: 'cp5', name: '西门检查站', lat: 30.6550, lng: 104.0580, checked: true, checkedTime: '09:05' },
      { id: 'cp6', name: '古迹遗址', lat: 30.6580, lng: 104.0560, checked: true, checkedTime: '09:35' },
      { id: 'cp7', name: '溪流口', lat: 30.6610, lng: 104.0580, checked: false },
      { id: 'cp8', name: '三岔口', lat: 30.6630, lng: 104.0600, checked: false },
    ],
  },
  {
    id: 'task003',
    name: '南线C段巡护路线',
    description: '南线C段林区巡护，重点检查封控边界',
    distance: 6.5,
    duration: 150,
    status: 'pending',
    boundary: [
      { lat: 30.6520, lng: 104.0630 },
      { lat: 30.6500, lng: 104.0660 },
      { lat: 30.6510, lng: 104.0700 },
      { lat: 30.6540, lng: 104.0720 },
    ],
    checkpoints: [
      { id: 'cp9', name: '南门检查站', lat: 30.6520, lng: 104.0630, checked: false },
      { id: 'cp10', name: '茶园', lat: 30.6510, lng: 104.0670, checked: false },
      { id: 'cp11', name: '枫树林', lat: 30.6530, lng: 104.0710, checked: false },
    ],
  },
  {
    id: 'task004',
    name: '北线D段巡护路线',
    description: '北线D段高山区域巡护',
    distance: 4.2,
    duration: 100,
    status: 'completed',
    startTime: '2024-01-14 08:30',
    endTime: '2024-01-14 11:45',
    boundary: [
      { lat: 30.6700, lng: 104.0620 },
      { lat: 30.6730, lng: 104.0650 },
      { lat: 30.6750, lng: 104.0680 },
    ],
    checkpoints: [
      { id: 'cp12', name: '北门检查站', lat: 30.6700, lng: 104.0620, checked: true, checkedTime: '08:35' },
      { id: 'cp13', name: '观景台', lat: 30.6730, lng: 104.0660, checked: true, checkedTime: '09:20' },
      { id: 'cp14', name: '最高峰', lat: 30.6750, lng: 104.0680, checked: true, checkedTime: '10:15' },
    ],
  },
  {
    id: 'task005',
    name: '中线核心区巡护',
    description: '核心保护区重点巡护路线',
    distance: 8.0,
    duration: 180,
    status: 'pending',
    boundary: [
      { lat: 30.6600, lng: 104.0600 },
      { lat: 30.6650, lng: 104.0620 },
      { lat: 30.6680, lng: 104.0660 },
      { lat: 30.6650, lng: 104.0700 },
      { lat: 30.6600, lng: 104.0680 },
    ],
    checkpoints: [
      { id: 'cp15', name: '核心区入口', lat: 30.6600, lng: 104.0600, checked: false },
      { id: 'cp16', name: '古树群', lat: 30.6640, lng: 104.0630, checked: false },
      { id: 'cp17', name: '瀑布', lat: 30.6670, lng: 104.0670, checked: false },
      { id: 'cp18', name: '珍稀植物区', lat: 30.6630, lng: 104.0700, checked: false },
      { id: 'cp19', name: '管理站', lat: 30.6600, lng: 104.0670, checked: false },
    ],
  },
];

export const getTaskById = (id: string): PatrolTask | undefined => {
  return taskList.find((task) => task.id === id);
};
