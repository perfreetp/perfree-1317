import React from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { userInfo, patrolRecords, monthlyStats } from '@/data/stats';

const StatsPage: React.FC = () => {
  const handleExport = () => {
    console.log('[Stats] 导出记录');
    Taro.showActionSheet({
      itemList: ['导出本周记录', '导出本月记录', '按日期范围导出'],
      success: (res) => {
        console.log('[Stats] 选择导出类型', res.tapIndex);
        Taro.showLoading({ title: '导出中...' });
        setTimeout(() => {
          Taro.hideLoading();
          Taro.showToast({ title: '导出成功', icon: 'success' });
        }, 1500);
      },
      fail: (err) => {
        console.error('[Stats] 导出取消', err);
      },
    });
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.header}>
        <View className={styles.userCard}>
          <View className={styles.avatar}>🌲</View>
          <View className={styles.userInfo}>
            <Text className={styles.userName}>{userInfo.name}</Text>
            <Text className={styles.userTeam}>{userInfo.team} · {userInfo.role}</Text>
          </View>
        </View>
        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{userInfo.totalDistance.toFixed(1)}</Text>
            <Text className={styles.statLabel}>累计里程(公里)</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{userInfo.totalDays}</Text>
            <Text className={styles.statLabel}>累计天数</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{monthlyStats.totalTurnBack}</Text>
            <Text className={styles.statLabel}>本月劝返</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>本月数据</Text>
        <View className={styles.monthGrid}>
          <View className={styles.monthItem}>
            <Text className={styles.monthValue}>{monthlyStats.totalDistance}</Text>
            <Text className={styles.monthLabel}>巡护里程(公里)</Text>
          </View>
          <View className={styles.monthItem}>
            <Text className={styles.monthValue}>{monthlyStats.totalDuration}</Text>
            <Text className={styles.monthLabel}>巡护时长(小时)</Text>
          </View>
          <View className={styles.monthItem}>
            <Text className={styles.monthValue}>{monthlyStats.totalCheckpoints}</Text>
            <Text className={styles.monthLabel}>打卡点数</Text>
          </View>
          <View className={styles.monthItem}>
            <Text className={styles.monthValue}>{monthlyStats.totalReports}</Text>
            <Text className={styles.monthLabel}>隐患上报</Text>
          </View>
          <View className={styles.monthItem}>
            <Text className={styles.monthValue}>{monthlyStats.totalTurnBack}</Text>
            <Text className={styles.monthLabel}>劝返人数</Text>
          </View>
          <View className={styles.monthItem}>
            <Text className={styles.monthValue}>15</Text>
            <Text className={styles.monthLabel}>出勤天数</Text>
          </View>
        </View>
      </View>

      <View className={styles.recordSection}>
        <View className={styles.recordHeader}>
          <Text className={styles.recordTitle}>巡护记录</Text>
          <View className={styles.exportBtn} onClick={handleExport}>
            <Text className={styles.exportIcon}>📤</Text>
            <Text>导出记录</Text>
          </View>
        </View>
        <View className={styles.recordList}>
          {patrolRecords.map((record) => (
            <View key={record.id} className={styles.recordItem}>
              <View className={styles.recordTop}>
                <Text className={styles.recordDate}>{record.date}</Text>
                <View className={styles.recordStatus}>
                  <Text>已完成</Text>
                </View>
              </View>
              <View className={styles.recordBottom}>
                <View className={styles.recordInfoItem}>
                  <Text className={styles.recordInfoIcon}>📏</Text>
                  <Text>{record.distance.toFixed(1)}公里</Text>
                </View>
                <View className={styles.recordInfoItem}>
                  <Text className={styles.recordInfoIcon}>⏱️</Text>
                  <Text>{record.duration}分钟</Text>
                </View>
                <View className={styles.recordInfoItem}>
                  <Text className={styles.recordInfoIcon}>📍</Text>
                  <Text>{record.checkpoints}个打卡点</Text>
                </View>
                <View className={styles.recordInfoItem}>
                  <Text className={styles.recordInfoIcon}>🚷</Text>
                  <Text>劝返{record.turnBack}人</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={{ height: '40rpx' }}></View>
    </ScrollView>
  );
};

export default StatsPage;
