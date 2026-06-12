import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import { useTaskStore } from '@/stores/useTaskStore';
import { formatDistance, formatDuration } from '@/utils';
import classnames from 'classnames';

type TabType = 'all' | 'pending' | 'ongoing' | 'completed';

const TasksPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const { tasks, initTasks, acceptTask } = useTaskStore();

  useEffect(() => {
    initTasks();
  }, [initTasks]);

  useDidShow(() => {
    console.log('[Tasks] 页面显示');
    initTasks();
  });

  const tabs = [
    { key: 'all' as TabType, label: '全部' },
    { key: 'pending' as TabType, label: '待领取' },
    { key: 'ongoing' as TabType, label: '进行中' },
    { key: 'completed' as TabType, label: '已完成' },
  ];

  const filteredTasks = useMemo(() => {
    if (activeTab === 'all') return tasks;
    return tasks.filter((task) => task.status === activeTab);
  }, [tasks, activeTab]);

  const handleTaskClick = (taskId: string) => {
    Taro.navigateTo({ url: `/pages/task-detail/index?id=${taskId}` });
  };

  const handleAction = (taskId: string, status: string, e: any) => {
    e.stopPropagation?.();
    console.log('[Tasks] 任务操作', { taskId, status });

    if (status === 'pending') {
      Taro.showModal({
        title: '领取任务',
        content: '确定要领取该巡护任务吗？',
        success: (res) => {
          if (res.confirm) {
            acceptTask(taskId);
            Taro.showToast({ title: '任务领取成功', icon: 'success' });
            console.log('[Tasks] 任务领取成功', taskId);
          }
        },
      });
    } else if (status === 'ongoing') {
      Taro.navigateTo({ url: `/pages/task-detail/index?id=${taskId}` });
    } else if (status === 'completed') {
      Taro.navigateTo({ url: `/pages/task-detail/index?id=${taskId}` });
    }
  };

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      pending: '待领取',
      ongoing: '进行中',
      completed: '已完成',
    };
    return map[status] || status;
  };

  const getActionText = (status: string) => {
    const map: Record<string, string> = {
      pending: '领取任务',
      ongoing: '继续巡护',
      completed: '查看详情',
    };
    return map[status] || '查看';
  };

  const getCheckedCount = (checkpoints: any[]) => {
    return checkpoints.filter((cp) => cp.checked).length;
  };

  return (
    <View className={styles.page}>
      <View className={styles.tabs}>
        {tabs.map((tab) => (
          <View
            key={tab.key}
            className={classnames(styles.tabItem, activeTab === tab.key && styles.active)}
            onClick={() => setActiveTab(tab.key)}
          >
            <Text className={styles.tabText}>{tab.label}</Text>
            <View className={styles.tabLine}></View>
          </View>
        ))}
      </View>

      <ScrollView scrollY className={styles.taskList}>
        {filteredTasks.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📋</Text>
            <Text className={styles.emptyText}>暂无任务</Text>
          </View>
        ) : (
          filteredTasks.map((task) => (
            <View
              key={task.id}
              className={styles.taskCard}
              onClick={() => handleTaskClick(task.id)}
            >
              <View className={styles.taskHeader}>
                <Text className={styles.taskTitle}>{task.name}</Text>
                <View className={`${styles.statusBadge} ${styles[task.status]}`}>
                  <Text>{getStatusText(task.status)}</Text>
                </View>
              </View>

              <Text className={styles.taskDesc}>{task.description}</Text>

              <View className={styles.taskInfo}>
                <View className={styles.infoItem}>
                  <Text className={styles.infoIcon}>📏</Text>
                  <Text className={styles.infoText}>距离：</Text>
                  <Text className={styles.infoValue}>{formatDistance(task.distance)}</Text>
                </View>
                <View className={styles.infoItem}>
                  <Text className={styles.infoIcon}>⏱️</Text>
                  <Text className={styles.infoText}>时长：</Text>
                  <Text className={styles.infoValue}>{formatDuration(task.duration)}</Text>
                </View>
              </View>

              <View className={styles.taskFooter}>
                <View className={styles.checkpointProgress}>
                  <Text>打卡点：</Text>
                  <Text className={styles.checkpointValue}>
                    {getCheckedCount(task.checkpoints)}
                  </Text>
                  <Text>/{task.checkpoints.length}</Text>
                </View>
                <View
                  className={classnames(
                    styles.actionBtn,
                    task.status === 'completed' ? styles.outline : styles.primary
                  )}
                  onClick={(e) => handleAction(task.id, task.status, e)}
                >
                  <Text>{getActionText(task.status)}</Text>
                </View>
              </View>
            </View>
          ))
        )}

        <View style={{ height: '40rpx' }}></View>
      </ScrollView>
    </View>
  );
};

export default TasksPage;
