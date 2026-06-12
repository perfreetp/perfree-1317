import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import { useTaskStore } from '@/stores/useTaskStore';
import { formatDistance, formatDuration } from '@/utils';
import classnames from 'classnames';
import { PatrolTask } from '@/types';

const TaskDetailPage: React.FC = () => {
  const router = useRouter();
  const taskId = router.params.id || 'task002';
  const { tasks, initTasks, acceptTask, checkIn, getTaskById } = useTaskStore();
  const [task, setTask] = useState<PatrolTask | undefined>();

  const loadTask = () => {
    initTasks();
    const found = getTaskById(taskId);
    setTask(found);
    console.log('[TaskDetail] 加载任务', taskId, found?.status);
  };

  useEffect(() => {
    loadTask();
  }, [taskId]);

  useDidShow(() => {
    loadTask();
  });

  const handleCheckIn = () => {
    if (!task) return;
    console.log('[TaskDetail] 打卡');

    const currentIndex = task.checkpoints.findIndex((cp) => !cp.checked);
    if (currentIndex >= 0) {
      const checkpoint = task.checkpoints[currentIndex];
      checkIn(taskId, checkpoint.id);

      const updatedTask = getTaskById(taskId);
      setTask(updatedTask);

      Taro.showToast({ title: '打卡成功', icon: 'success' });
      console.log('[TaskDetail] 打卡成功', checkpoint.name);
    }
  };

  const handleAcceptTask = () => {
    if (!task) return;
    Taro.showModal({
      title: '领取任务',
      content: '确定要领取该巡护任务吗？',
      success: (res) => {
        if (res.confirm) {
          acceptTask(taskId);
          const updatedTask = getTaskById(taskId);
          setTask(updatedTask);
          Taro.showToast({ title: '任务领取成功', icon: 'success' });
          console.log('[TaskDetail] 任务领取成功');
        }
      },
    });
  };

  const handleReport = () => {
    Taro.switchTab({ url: `/pages/report/index?taskId=${taskId}` });
  };

  if (!task) {
    return (
      <View className={styles.page}>
        <Text>加载中...</Text>
      </View>
    );
  }

  const nextCheckpoint = task.checkpoints.find((cp) => !cp.checked);
  const checkedCount = task.checkpoints.filter((cp) => cp.checked).length;

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.taskName}>{task.name}</Text>
        <Text className={styles.taskDesc}>{task.description}</Text>
        <View className={styles.infoRow}>
          <View className={styles.infoItem}>
            <Text className={styles.infoValue}>{formatDistance(task.distance)}</Text>
            <Text className={styles.infoLabel}>总距离</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoValue}>{formatDuration(task.duration)}</Text>
            <Text className={styles.infoLabel}>预计时长</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoValue}>
              {checkedCount}/{task.checkpoints.length}
            </Text>
            <Text className={styles.infoLabel}>打卡点</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>🗺️</Text>
          路线示意
        </Text>
        <View className={styles.mapArea}>
          <View className={styles.mapRoute}></View>
          {task.checkpoints.map((cp, index) => {
            const positions = [
              { top: '25%', left: '20%' },
              { top: '50%', left: '35%' },
              { top: '40%', left: '60%' },
              { top: '65%', left: '75%' },
              { top: '75%', left: '45%' },
            ];
            const pos = positions[index % positions.length];
            const isCurrent = !cp.checked && (index === 0 || task.checkpoints[index - 1].checked);
            return (
              <View
                key={cp.id}
                className={classnames(
                  styles.mapPoint,
                  cp.checked && styles.checked,
                  isCurrent && styles.current
                )}
                style={pos}
              ></View>
            );
          })}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>📍</Text>
          打卡点列表
        </Text>
        <View className={styles.checkpointList}>
          {task.checkpoints.map((cp, index) => {
            const isCurrent = !cp.checked && (index === 0 || task.checkpoints[index - 1].checked);
            return (
              <View key={cp.id} className={styles.checkpointItem}>
                <View
                  className={classnames(
                    styles.cpIndex,
                    cp.checked && styles.checked,
                    isCurrent && styles.current
                  )}
                >
                  <Text>{cp.checked ? '✓' : index + 1}</Text>
                </View>
                <View className={styles.cpInfo}>
                  <Text className={styles.cpName}>{cp.name}</Text>
                  <Text className={styles.cpTime}>
                    {cp.checkedTime ? `打卡时间：${cp.checkedTime}` : '待打卡'}
                  </Text>
                </View>
                <Text
                  className={classnames(
                    styles.cpStatus,
                    cp.checked ? styles.checked : isCurrent ? styles.current : styles.pending
                  )}
                >
                  {cp.checked ? '已完成' : isCurrent ? '进行中' : '未开始'}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={{ height: '20rpx' }}></View>

      <View className={styles.bottomBar}>
        <View className={styles.secondaryBtn} onClick={handleReport}>
          <Text>上报隐患</Text>
        </View>
        {task.status === 'pending' && (
          <View className={styles.primaryBtn} onClick={handleAcceptTask}>
            <Text>领取任务</Text>
          </View>
        )}
        {task.status === 'ongoing' && (
          <>
            <View className={styles.primaryBtn} onClick={handleCheckIn}>
              <Text>{nextCheckpoint ? '到达打卡' : '结束任务'}</Text>
            </View>
          </>
        )}
        {task.status === 'completed' && (
          <View className={classnames(styles.primaryBtn, styles.disabled)}>
            <Text>任务已完成</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default TaskDetailPage;
