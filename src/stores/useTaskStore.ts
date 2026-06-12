import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PatrolTask, Checkpoint } from '@/types';
import { taskList } from '@/data/tasks';

interface TaskState {
  tasks: PatrolTask[];
  activeTaskId: string | null;
  initTasks: () => void;
  acceptTask: (taskId: string) => void;
  checkIn: (taskId: string, checkpointId: string) => void;
  completeTask: (taskId: string) => void;
  getTaskById: (taskId: string) => PatrolTask | undefined;
  getCheckedCount: (taskId: string) => number;
  getTodayCheckedCount: () => number;
  getTodayDistance: () => number;
}

const getTodayStr = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

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
        const now = new Date().toLocaleTimeString().slice(0, 5);
        set((state) => {
          const tasks = state.tasks.map((task) => {
            if (task.id !== taskId) return task;

            const newCheckpoints = task.checkpoints.map((cp) =>
              cp.id === checkpointId
                ? { ...cp, checked: true, checkedTime: now }
                : cp
            );

            const allChecked = newCheckpoints.every((cp) => cp.checked);

            return {
              ...task,
              checkpoints: newCheckpoints,
              status: allChecked ? ('completed' as const) : task.status,
              endTime: allChecked ? new Date().toLocaleString() : task.endTime,
            };
          });

          return { tasks };
        });
      },

      completeTask: (taskId: string) => {
        const now = new Date().toLocaleString();
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? { ...task, status: 'completed' as const, endTime: now }
              : task
          ),
        }));
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
          if (task.status === 'pending') return;
          task.checkpoints.forEach((cp) => {
            if (cp.checked && cp.checkedTime) {
              const checkDate = new Date().toISOString().split('T')[0];
              if (checkDate === today) {
                count++;
              }
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
          const checkedCount = task.checkpoints.filter(
            (cp) => cp.checked && cp.checkedTime
          ).length;
          if (checkedCount > 0 && task.checkpoints.length > 0) {
            const progress = checkedCount / task.checkpoints.length;
            distance += task.distance * progress;
          }
        });
        return Math.round(distance * 10) / 10;
      },
    }),
    {
      name: 'patrol-task-storage',
    }
  )
);
