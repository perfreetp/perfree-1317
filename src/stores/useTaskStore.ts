import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PatrolTask } from '@/types';
import { taskList } from '@/data/tasks';
import { usePatrolRecordStore } from './usePatrolRecordStore';

const getTodayStr = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getTimeStr = () => {
  return new Date().toLocaleTimeString().slice(0, 5);
};

interface TaskState {
  tasks: PatrolTask[];
  activeTaskId: string | null;
  initTasks: () => void;
  acceptTask: (taskId: string) => void;
  checkIn: (taskId: string, checkpointId: string) => void;
  completeTask: (taskId: string) => void;
  setActiveTaskId: (taskId: string | null) => void;
  getTaskById: (taskId: string) => PatrolTask | undefined;
  getCheckedCount: (taskId: string) => number;
  getTodayCheckedCount: () => number;
  getTodayDistance: () => number;
  getOngoingTask: () => PatrolTask | undefined;
  getActiveTask: () => PatrolTask | undefined;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      activeTaskId: null,

      initTasks: () => {
        const { tasks } = get();
        if (tasks.length === 0) {
          set({ tasks: [...taskList] });
        }
      },

      acceptTask: (taskId: string) => {
        const now = new Date().toLocaleString();
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? { ...task, status: 'ongoing' as const, startTime: now }
              : task
          ),
          activeTaskId: taskId,
        }));
      },

      checkIn: (taskId: string, checkpointId: string) => {
        const nowTime = getTimeStr();
        const todayStr = getTodayStr();

        set((state) => {
          let completedTask: PatrolTask | null = null;

          const tasks = state.tasks.map((task) => {
            if (task.id !== taskId) return task;

            const newCheckpoints = task.checkpoints.map((cp) =>
              cp.id === checkpointId
                ? { ...cp, checked: true, checkedTime: nowTime, checkedDate: todayStr }
                : cp
            );

            const allChecked = newCheckpoints.every((cp) => cp.checked);

            const updatedTask = {
              ...task,
              checkpoints: newCheckpoints,
              status: allChecked ? ('completed' as const) : task.status,
              endTime: allChecked ? new Date().toLocaleString() : task.endTime,
            };

            if (allChecked && task.status !== 'completed') {
              completedTask = updatedTask;
            }

            return updatedTask;
          });

          if (completedTask) {
            const recordStore = usePatrolRecordStore.getState();
            recordStore.initRecords();
            const newRecord = recordStore.generateRecordFromTask(completedTask);
            recordStore.addRecord(newRecord);
          }

          return { tasks };
        });
      },

      setActiveTaskId: (taskId: string | null) => {
        set({ activeTaskId: taskId });
      },

      completeTask: (taskId: string) => {
        const now = new Date().toLocaleString();
        set((state) => {
          const tasks = state.tasks.map((task) =>
            task.id === taskId
              ? { ...task, status: 'completed' as const, endTime: now }
              : task
          );

          const completed = tasks.find((t) => t.id === taskId);
          if (completed && completed.status === 'completed') {
            const recordStore = usePatrolRecordStore.getState();
            recordStore.initRecords();
            const existing = recordStore.records.find((r) => r.taskId === taskId);
            if (!existing) {
              const newRecord = recordStore.generateRecordFromTask(completed);
              recordStore.addRecord(newRecord);
            }
          }

          return { tasks };
        });
      },

      getTaskById: (taskId: string) => {
        return get().tasks.find((t) => t.id === taskId);
      },

      getCheckedCount: (taskId: string) => {
        const task = get().tasks.find((t) => t.id === taskId);
        if (!task) return 0;
        return task.checkpoints.filter((cp) => cp.checked).length;
      },

      getTodayCheckedCount: () => {
        const today = getTodayStr();
        let count = 0;
        get().tasks.forEach((task) => {
          task.checkpoints.forEach((cp) => {
            if (cp.checked && cp.checkedDate === today) {
              count++;
            }
          });
        });
        return count;
      },

      getTodayDistance: () => {
        const today = getTodayStr();
        let distance = 0;
        get().tasks.forEach((task) => {
          if (task.status === 'pending') return;

          const todayChecked = task.checkpoints.filter(
            (cp) => cp.checked && cp.checkedDate === today
          ).length;

          if (todayChecked > 0 && task.checkpoints.length > 0) {
            const progress = todayChecked / task.checkpoints.length;
            distance += task.distance * progress;
          }
        });
        return Math.round(distance * 10) / 10;
      },

      getOngoingTask: () => {
        const { activeTaskId, tasks } = get();
        if (activeTaskId) {
          const active = tasks.find((t) => t.id === activeTaskId && t.status === 'ongoing');
          if (active) return active;
        }
        return tasks.find((t) => t.status === 'ongoing');
      },

      getActiveTask: () => {
        const { activeTaskId, tasks } = get();
        if (!activeTaskId) return undefined;
        return tasks.find((t) => t.id === activeTaskId);
      },
    }),
    {
      name: 'patrol-task-storage',
    }
  )
);
