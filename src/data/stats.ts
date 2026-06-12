import { PatrolRecord, UserInfo } from '@/types';

export const userInfo: UserInfo = {
  id: 'u001',
  name: '张卫国',
  role: '护林一组组长',
  team: '东线护林组',
  totalDistance: 256.8,
  totalDays: 89,
};

export const patrolRecords: PatrolRecord[] = [
  {
    id: 'r001',
    date: '2024-01-15',
    distance: 5.2,
    duration: 125,
    checkpoints: 4,
    reports: 1,
    turnBack: 3,
  },
  {
    id: 'r002',
    date: '2024-01-14',
    distance: 4.8,
    duration: 110,
    checkpoints: 3,
    reports: 0,
    turnBack: 2,
  },
  {
    id: 'r003',
    date: '2024-01-13',
    distance: 6.5,
    duration: 150,
    checkpoints: 5,
    reports: 2,
    turnBack: 5,
  },
  {
    id: 'r004',
    date: '2024-01-12',
    distance: 3.8,
    duration: 85,
    checkpoints: 3,
    reports: 1,
    turnBack: 1,
  },
  {
    id: 'r005',
    date: '2024-01-11',
    distance: 7.2,
    duration: 165,
    checkpoints: 6,
    reports: 0,
    turnBack: 4,
  },
  {
    id: 'r006',
    date: '2024-01-10',
    distance: 5.5,
    duration: 130,
    checkpoints: 4,
    reports: 1,
    turnBack: 3,
  },
  {
    id: 'r007',
    date: '2024-01-09',
    distance: 4.2,
    duration: 95,
    checkpoints: 3,
    reports: 0,
    turnBack: 2,
  },
];

export const monthlyStats = {
  totalDistance: 156.5,
  totalDuration: 72,
  totalCheckpoints: 89,
  totalReports: 12,
  totalTurnBack: 28,
};
