import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ReportItem, ReportProgressNode } from '@/types';
import { reportList } from '@/data/reports';
import { userInfo } from '@/data/stats';
import { usePatrolRecordStore } from './usePatrolRecordStore';

const generateId = () => {
  return 'report' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
};

const typeNameMap: Record<string, string> = {
  poaching: '偷采偷猎',
  fire: '火源隐患',
  roadblock: '临时封路',
  other: '其他隐患',
};

const formatDateTime = () => {
  const now = new Date();
  const dateStr = now.toLocaleDateString().replace(/\//g, '-');
  const timeStr = now.toLocaleTimeString().slice(0, 5);
  return `${dateStr} ${timeStr}`;
};

const buildInitialProgress = (createTime: string): ReportProgressNode[] => {
  return [
    {
      status: 'pending',
      statusText: '上报已提交，等待值班室确认',
      time: createTime,
      operator: userInfo.name,
    },
  ];
};

const buildMockProgress = (status: string, createTime: string): ReportProgressNode[] => {
  const nodes: ReportProgressNode[] = [
    {
      status: 'pending',
      statusText: '待处理',
      time: createTime,
      operator: userInfo.name,
      remark: '已提交上报，等待值班室确认',
    },
  ];

  if (status === 'processing' || status === 'completed') {
    nodes.push({
      status: 'processing',
      statusText: '处理中',
      time: createTime,
      operator: '值班室-李主任',
      remark: '已接收，已通知附近巡护员前往核实处理',
    });
  }

  if (status === 'completed') {
    nodes.push({
      status: 'completed',
      statusText: '已解决',
      time: createTime,
      operator: '值班室-李主任',
      remark: '隐患已排除，处理完成，无后续问题',
    });
  }

  return nodes;
};

interface ReportState {
  reports: ReportItem[];
  initReports: () => void;
  addReport: (report: Omit<ReportItem, 'id' | 'status' | 'createTime' | 'reporter' | 'progress'>) => ReportItem;
  getReportById: (id: string) => ReportItem | undefined;
  getReportsByType: (type: string) => ReportItem[];
  getReportsByTaskId: (taskId: string) => ReportItem[];
  getMyReports: () => ReportItem[];
  getUnresolvedCount: () => number;
  updateReportStatus: (id: string, status: 'pending' | 'processing' | 'completed', remark?: string) => void;
  addProgressNode: (id: string, node: ReportProgressNode) => void;
}

export const useReportStore = create<ReportState>()(
  persist(
    (set, get) => ({
      reports: [],

      initReports: () => {
        const { reports } = get();
        if (reports.length === 0) {
          const enriched = reportList.map((r) => ({
            ...r,
            status: (r.status === 'resolved' ? 'completed' : r.status) as 'pending' | 'processing' | 'completed',
            progress: buildMockProgress(r.status, r.createTime),
            dutyRemark: r.status === 'completed' || r.status === 'resolved' ? '已妥善处理，无后续问题' : undefined,
          }));
          set({ reports: enriched });
        }
      },

      addReport: (reportData) => {
        const createTime = formatDateTime();

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
          taskId: reportData.taskId,
          status: 'pending',
          createTime,
          reporter: userInfo.name,
          progress: buildInitialProgress(createTime),
        };

        set((state) => ({
          reports: [newReport, ...state.reports],
        }));

        if (reportData.taskId) {
          const recordStore = usePatrolRecordStore.getState();
          recordStore.initRecords();
          const record = recordStore.records.find((r) => r.taskId === reportData.taskId);
          if (record) {
            recordStore.linkReportToRecord(record.id, newReport.id);
          }
        }

        return newReport;
      },

      getReportById: (id: string) => {
        return get().reports.find((r) => r.id === id);
      },

      getReportsByType: (type: string) => {
        if (type === 'all') return get().reports;
        return get().reports.filter((r) => r.type === type);
      },

      getReportsByTaskId: (taskId: string) => {
        return get().reports.filter((r) => r.taskId === taskId);
      },

      getMyReports: () => {
        return get().reports.filter((r) => r.reporter === userInfo.name);
      },

      getUnresolvedCount: () => {
        return get().reports.filter((r) => r.status !== 'completed').length;
      },

      updateReportStatus: (id: string, status: 'pending' | 'processing' | 'completed', remark?: string) => {
        set((state) => ({
          reports: state.reports.map((r) => {
            if (r.id !== id) return r;

            const statusTextMap: Record<string, string> = {
              pending: '待处理',
              processing: '处理中',
              completed: '已解决',
            };

            const statusRemarkMap: Record<string, string> = {
              pending: '已提交上报，等待值班室确认',
              processing: '已接收，已通知巡护员前往核实处理',
              completed: '隐患已排除，处理完成',
            };

            const newNode: ReportProgressNode = {
              status,
              statusText: statusTextMap[status] || '状态更新',
              time: formatDateTime(),
              operator: '值班室',
              remark: remark || statusRemarkMap[status],
            };

            const progress = r.progress || [];
            const existingIdx = progress.findIndex((p) => p.status === status);

            let newProgress: ReportProgressNode[];
            if (existingIdx >= 0) {
              newProgress = [...progress];
              newProgress[existingIdx] = newNode;
            } else {
              newProgress = [...progress, newNode];
            }

            return {
              ...r,
              status,
              progress: newProgress,
              dutyRemark: remark || r.dutyRemark,
            };
          }),
        }));
      },

      addProgressNode: (id: string, node: ReportProgressNode) => {
        set((state) => ({
          reports: state.reports.map((r) => {
            if (r.id !== id) return r;
            return {
              ...r,
              progress: [...(r.progress || []), node],
            };
          }),
        }));
      },
    }),
    {
      name: 'patrol-report-storage',
    }
  )
);
