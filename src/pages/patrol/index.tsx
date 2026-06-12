import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import { useTaskStore } from '@/stores/useTaskStore';
import { userInfo, monthlyStats } from '@/data/stats';
import { noticeList } from '@/data/notices';
import { PatrolTask } from '@/types';

const PatrolPage: React.FC = () => {
  const { tasks, initTasks, getTodayCheckedCount, getTodayDistance, getOngoingTask } = useTaskStore();
  const [isPatrolling, setIsPatrolling] = useState(false);
  const [todayDistance, setTodayDistance] = useState(0);
  const [todayCheckpoints, setTodayCheckpoints] = useState(0);
  const [ongoingTask, setOngoingTask] = useState<PatrolTask | undefined>();
  const [nextCheckpoint, setNextCheckpoint] = useState<string>('');

  useEffect(() => {
    initTasks();
  }, [initTasks]);

  useDidShow(() => {
    loadPatrolStatus();
  });

  const loadPatrolStatus = () => {
    initTasks();
    const task = getOngoingTask();
    if (task) {
      setIsPatrolling(true);
      setOngoingTask(task);
      const next = task.checkpoints.find((cp) => !cp.checked);
      setNextCheckpoint(next ? next.name : '已全部完成');
    } else {
      setIsPatrolling(false);
      setOngoingTask(undefined);
      setNextCheckpoint('');
    }
    setTodayCheckpoints(getTodayCheckedCount());
    setTodayDistance(getTodayDistance());
  };

  const handleStartPatrol = () => {
    if (isPatrolling) {
      Taro.showModal({
        title: '提示',
        content: '确定要结束今日巡护吗？',
        success: (res) => {
          if (res.confirm) {
            setIsPatrolling(false);
            Taro.showToast({ title: '巡护已结束', icon: 'success' });
          }
        },
      });
    } else {
      Taro.switchTab({ url: '/pages/tasks/index' });
    }
  };

  const goToTaskDetail = () => {
    if (ongoingTask) {
      Taro.navigateTo({ url: `/pages/task-detail/index?id=${ongoingTask.id}` });
    }
  };

  const quickEntries = [
    { icon: '🗺️', text: '路线任务', path: '/pages/tasks/index', color: '#2e7d32' },
    { icon: '📝', text: '隐患上报', path: '/pages/report/index', color: '#f53f3f' },
    { icon: '📦', text: '物资点', path: '/pages/supplies/index', color: '#ff7d00' },
    { icon: '📴', text: '离线包', path: '/pages/offline/index', color: '#165dff' },
    { icon: '👥', text: '人员联络', path: '/pages/contacts/index', color: '#722ed1' },
    { icon: '📊', text: '统计记录', path: '/pages/stats/index', color: '#13c2c2' },
    { icon: '📢', text: '紧急通知', path: '/pages/notice/index', color: '#eb2f96' },
    { icon: '📞', text: '呼叫值班', action: 'call', color: '#52c41a' },
  ];

  const handleQuickAction = (item: typeof quickEntries[0]) => {
    if (item.action === 'call') {
      Taro.makePhoneCall({
        phoneNumber: '02888881234',
        fail: (err) => {
          console.error('[Patrol] 拨打电话失败', err);
        },
      });
    } else if (item.path) {
      if (item.path.startsWith('/pages/tasks') || item.path.startsWith('/pages/report') || item.path.startsWith('/pages/contacts') || item.path.startsWith('/pages/stats')) {
        Taro.switchTab({ url: item.path });
      } else {
        Taro.navigateTo({ url: item.path });
      }
    }
  };

  const latestNotices = noticeList.slice(0, 3);

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.header}>
        <View className={styles.userInfo}>
          <View className={styles.avatar}>🌲</View>
          <View className={styles.userText}>
            <Text className={styles.userName}>{userInfo.name}</Text>
            <Text className={styles.userRole}>{userInfo.role} · {userInfo.team}</Text>
          </View>
        </View>
      </View>

      <View className={styles.statusCard}>
        <View className={styles.statusHeader}>
          <Text className={styles.statusTitle}>今日巡护状态</Text>
          <View className={styles.statusBadge}>
            <View className={styles.statusDot}></View>
            <Text className={styles.statusText}>{isPatrolling ? '巡护中' : '未开始'}</Text>
          </View>
        </View>

        {isPatrolling && ongoingTask && (
          <View className={styles.ongoingTask} onClick={goToTaskDetail}>
            <View className={styles.ongoingInfo}>
              <Text className={styles.ongoingLabel}>当前路线</Text>
              <Text className={styles.ongoingName}>{ongoingTask.name}</Text>
              <Text className={styles.ongoingNext}>
                下一打卡点：📍 {nextCheckpoint}
              </Text>
            </View>
            <View className={styles.ongoingAction}>
              <Text className={styles.ongoingActionText}>继续巡护 ›</Text>
            </View>
          </View>
        )}

        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{todayDistance.toFixed(1)}</Text>
            <Text className={styles.statLabel}>公里</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{todayCheckpoints}</Text>
            <Text className={styles.statLabel}>打卡点</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{monthlyStats.totalTurnBack}</Text>
            <Text className={styles.statLabel}>劝返(月)</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>快捷功能</Text>
        <View className={styles.quickGrid}>
          {quickEntries.map((item, index) => (
            <View
              key={index}
              className={styles.quickItem}
              onClick={() => handleQuickAction(item)}
            >
              <View
                className={styles.quickIcon}
                style={{ background: `${item.color}15` }}
              >
                <Text style={{ fontSize: '40rpx' }}>{item.icon}</Text>
              </View>
              <Text className={styles.quickText}>{item.text}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text>封控边界</Text>
          <Text className={styles.sectionMore}>查看详情</Text>
        </View>
        <View className={styles.mapCard}>
          <View className={styles.mapHeader}>
            <Text className={styles.mapTitle}>巡护区域示意图</Text>
            <View className={styles.mapLegend}>
              <View className={styles.legendItem}>
                <View className={`${styles.legendDot} ${styles.boundary}`}></View>
                <Text>封控线</Text>
              </View>
              <View className={styles.legendItem}>
                <View className={`${styles.legendDot} ${styles.checkpoint}`}></View>
                <Text>打卡点</Text>
              </View>
              <View className={styles.legendItem}>
                <View className={`${styles.legendDot} ${styles.me}`}></View>
                <Text>我的位置</Text>
              </View>
            </View>
          </View>
          <View className={styles.mapArea}>
            <View className={styles.boundaryFill}></View>
            <View className={styles.boundaryLine}></View>
            <View className={styles.mapPoint} style={{ top: '35%', left: '30%' }}></View>
            <View className={styles.mapPoint} style={{ top: '55%', left: '50%' }}></View>
            <View className={styles.mapPoint} style={{ top: '40%', left: '70%' }}></View>
            <View className={styles.mapPoint} style={{ top: '65%', left: '40%' }}></View>
            <View className={styles.myPosition} style={{ top: '48%', left: '45%' }}></View>
            <Text className={styles.mapLabel} style={{ top: '20%', left: '50%' }}>封控区域</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text>紧急通知</Text>
          <Text className={styles.sectionMore} onClick={() => Taro.navigateTo({ url: '/pages/notice/index' })}>全部</Text>
        </View>
        <View className={styles.noticeCard}>
          {latestNotices.map((notice) => (
            <View key={notice.id} className={styles.noticeItem}>
              <View className={`${styles.noticeTag} ${notice.type === 'urgent' ? styles.urgent : styles.normal}`}>
                <Text>{notice.type === 'urgent' ? '紧急' : '通知'}</Text>
              </View>
              <View className={styles.noticeContent}>
                <Text className={styles.noticeTitle}>{notice.title}</Text>
                <Text className={styles.noticeTime}>{notice.createTime}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={{ height: '120rpx' }}></View>

      <View className={styles.startBtn} onClick={handleStartPatrol}>
        <Text className={styles.startBtnText}>
          {isPatrolling ? '结束巡护' : '开始巡护'}
        </Text>
      </View>
    </ScrollView>
  );
};

export default PatrolPage;
