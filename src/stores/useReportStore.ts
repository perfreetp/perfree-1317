import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ReportItem } from '@/types';
import { reportList } from '@/data/reports';
import { userInfo } from '@/data/stats';

interface ReportState {
  reports: ReportItem[];
  initReports: () => void;
  addReport: (report: Omit<ReportItem, 'id' | 'status' | 'createTime' | 'reporter'>) => void;
  getReportById: (id: string) => ReportItem | undefined;
  getReportsByType: (type: string) => ReportItem[];
  getMyReports: () => ReportItem[];
}

const generateId = () => {
  return 'report' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
};

const typeNameMap: Record<string, string> = {
  poaching: '偷采偷猎',
  fire: '火源隐患',
  roadblock: '临时封路',
  other: '其他隐患',
};

export const useReportStore = create<ReportState>()(
  persist(
    (set, get) => ({
      reports: [],

      initReports: () => {
        const { reports } = get();
        if (reports.length === 0) {
          set({ reports: [...reportList] });
        }
      },

      addReport: (reportData) => {
        const now = new Date();
        const dateStr = now.toLocaleDateString().replace(/\//g, '-');
        const timeStr = now.toLocaleTimeString().slice(0, 5);

        const newReport: ReportItem = {
          id: generateId(),
          type: reportData.type as any,
          typeName: typeNameMap[reportData.type] || '其他隐患',
          description: reportData.description,
          images: reportData.images,
          voiceNote: reportData.voiceNote,
          location: reportData.location,
          lat: reportData.lat,
          lng: reportData.lng,
          status: 'pending',
          createTime: `${dateStr} ${timeStr}`,
          reporter: userInfo.name,
        };

        set((state) => ({
          reports: [newReport, ...state.reports],
        }));

        return newReport;
      },

      getReportById: (id: string) => {
        return get().reports.find((r) => r.id === id);
      },

      getReportsByType: (type: string) => {
        if (type === 'all') return get().reports;
        return get().reports.filter((r) => r.type === type);
      },

      getMyReports: () => {
        return get().reports.filter((r) => r.reporter === userInfo.name);
      },
    }),
    {
      name: 'patrol-report-storage',
    }
  )
);
