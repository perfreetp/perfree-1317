import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PatrolRecord, CheckpointRecord } from '@/types';
import { patrolRecords as mockRecords } from '@/data/stats';
import { PatrolTask } from '@/types';

const generateRecordId = () => {
  return 'record' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
};

const formatDateStr = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatTimeStr = (date: Date) => {
  return date.toLocaleTimeString().slice(0, 5);
};

const calcDurationMinutes = (startTime: string | undefined, endTime: string | undefined) => {
  if (!startTime || !endTime) return 0;
  try {
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    return Math.round((end.getTime() - start.getTime()) / 60000);
  } catch {
    return 0;
  }
};

interface PatrolRecordState {
  records: PatrolRecord[];
  initRecords: () => void;
  generateRecordFromTask: (task: PatrolTask) => PatrolRecord;
  addRecord: (record: PatrolRecord) => void;
  getRecordById: (id: string) => PatrolRecord | undefined;
  getRecordsByDateRange: (startDate: string, endDate: string) => PatrolRecord[];
  getTodayRecords: () => PatrolRecord[];
  linkReportToRecord: (recordId: string, reportId: string) => void;
}

export const usePatrolRecordStore = create<PatrolRecordState>()(
  persist(
    (set, get) => ({
      records: [],

      initRecords: () => {
        const { records } = get();
        if (records.length === 0) {
          const enriched = mockRecords.map((r) => ({
            ...r,
            taskName: r.id === 'r001' ? '西线B段巡护路线' :
                     r.id === 'r002' ? '东线A段巡护路线' :
                     r.id === 'r003' ? '南线C段巡护路线' :
                     r.id === 'r004' ? '北线D段巡护路线' :
                     r.id === 'r005' ? '中线核心区巡护' :
                     r.id === 'r006' ? '东线A段巡护路线' :
                     '西线B段巡护路线',
            startTime: `${r.date} 08:30`,
            endTime: `${r.date} ${11 + Math.floor(Math.random() * 2)}:${20 + Math.floor(Math.random() * 30)}`,
          }));
          set({ records: enriched });
        }
      },

      generateRecordFromTask: (task: PatrolTask): PatrolRecord => {
        const today = new Date();
        const dateStr = formatDateStr(today);
        const checkedPoints = task.checkpoints.filter((cp) => cp.checked);

        const record: PatrolRecord = {
          id: generateRecordId(),
          taskId: task.id,
          taskName: task.name,
          date: dateStr,
          startTime: task.startTime || `${dateStr} 08:30`,
          endTime: task.endTime || `${dateStr} ${formatTimeStr(today)}`,
          distance: task.distance,
          duration: calcDurationMinutes(task.startTime, task.endTime) || task.duration,
          checkpoints: checkedPoints.length,
          reports: 0,
          turnBack: 0,
          checkpointDetails: checkedPoints.map((cp) => ({
            id: cp.id,
            name: cp.name,
            checked: cp.checked,
            checkedTime: cp.checkedTime,
            lat: cp.lat,
            lng: cp.lng,
          })),
          reportIds: [],
        };

        return record;
      },

      addRecord: (record: PatrolRecord) => {
        set((state) => ({
          records: [record, ...state.records],
        }));
      },

      getRecordById: (id: string) => {
        return get().records.find((r) => r.id === id);
      },

      getRecordsByDateRange: (startDate: string, endDate: string) => {
        return get().records.filter((r) => {
          return r.date >= startDate && r.date <= endDate;
        });
      },

      getTodayRecords: () => {
        const today = formatDateStr(new Date());
        return get().records.filter((r) => r.date === today);
      },

      linkReportToRecord: (recordId: string, reportId: string) => {
        set((state) => ({
          records: state.records.map((r) => {
            if (r.id !== recordId) return r;
            const reportIds = r.reportIds || [];
            if (reportIds.includes(reportId)) return r;
            return {
              ...r,
              reportIds: [...reportIds, reportId],
              reports: (r.reports || 0) + 1,
            };
          }),
        }));
      },
    }),
    {
      name: 'patrol-record-storage',
    }
  )
);
