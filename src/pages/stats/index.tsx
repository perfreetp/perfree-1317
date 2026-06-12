import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { userInfo, patrolRecords, monthlyStats } from '@/data/stats';

const StatsPage: React.FC = () => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const formatDateStr = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDefaultDates = () => {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    return {
      start: formatDateStr(sevenDaysAgo),
      end: formatDateStr(today),
    };
  };

  const handleExport = () => {
    console.log('[Stats] 导出记录');
    Taro.showActionSheet({
      itemList: ['导出本周记录', '导出本月记录', '按日期范围导出'],
      success: (res) => {
        console.log('[Stats] 选择导出类型', res.tapIndex);
        if (res.tapIndex === 2) {
          openDatePicker();
        } else {
          const rangeText = res.tapIndex === 0 ? '本周' : '本月';
          doExport(rangeText);
        }
      },
      fail: (err) => {
        console.error('[Stats] 导出取消', err);
      },
    });
  };

  const openDatePicker = () => {
    const defaults = getDefaultDates();
    setStartDate(defaults.start);
    setEndDate(defaults.end);
    setShowDatePicker(true);
  };

  const handleStartDateChange = (e: any) => {
    setStartDate(e.detail.value);
  };

  const handleEndDateChange = (e: any) => {
    setEndDate(e.detail.value);
  };

  const pickStartDate = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    Taro.showModal({
      title: '选择开始日期',
      content: `请输入开始日期（格式：YYYY-MM-DD）\n默认：${startDate}`,
      editable: true,
      placeholderText: '如 2024-01-15',
      success: (res) => {
        if (res.confirm && res.content) {
          const datePattern = /^\d{4}-\d{2}-\d{2}$/;
          if (datePattern.test(res.content)) {
            setStartDate(res.content);
          } else {
            Taro.showToast({ title: '日期格式不正确', icon: 'none' });
          }
        }
      },
    });
  };

  const pickEndDate = () => {
    Taro.showModal({
      title: '选择结束日期',
      content: `请输入结束日期（格式：YYYY-MM-DD）\n默认：${endDate}`,
      editable: true,
      placeholderText: '如 2024-01-31',
      success: (res) => {
        if (res.confirm && res.content) {
          const datePattern = /^\d{4}-\d{2}-\d{2}$/;
          if (datePattern.test(res.content)) {
            setEndDate(res.content);
          } else {
            Taro.showToast({ title: '日期格式不正确', icon: 'none' });
          }
        }
      },
    });
  };

  const cancelDatePicker = () => {
    setShowDatePicker(false);
  };

  const confirmExport = () => {
    if (!startDate || !endDate) {
      Taro.showToast({ title: '请选择完整日期范围', icon: 'none' });
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      Taro.showToast({ title: '开始日期不能晚于结束日期', icon: 'none' });
      return;
    }

    setShowDatePicker(false);
    doExport(`${startDate} 至 ${endDate}`);
  };

  const doExport = (range: string) => {
    console.log('[Stats] 开始导出', range);
    Taro.showLoading({ title: '导出中...' });

    setTimeout(() => {
      Taro.hideLoading();
      Taro.showToast({
        title: '导出成功',
        icon: 'success',
        duration: 2000,
      });
      console.log('[Stats] 导出完成', range);
    }, 1500);
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

      {showDatePicker && (
        <View className={styles.datePickerOverlay}>
          <View className={styles.datePickerContent}>
            <Text className={styles.datePickerTitle}>选择导出日期范围</Text>

            <View className={styles.datePickerRow}>
              <View className={styles.datePickerLabel}>
                <Text>开始日期</Text>
              </View>
              <View className={styles.datePickerInput} onClick={pickStartDate}>
                <Text className={styles.datePickerText}>{startDate || '请选择'}</Text>
                <Text className={styles.datePickerArrow}>›</Text>
              </View>
            </View>

            <View className={styles.datePickerRow}>
              <View className={styles.datePickerLabel}>
                <Text>结束日期</Text>
              </View>
              <View className={styles.datePickerInput} onClick={pickEndDate}>
                <Text className={styles.datePickerText}>{endDate || '请选择'}</Text>
                <Text className={styles.datePickerArrow}>›</Text>
              </View>
            </View>

            <View className={styles.datePickerHint}>
              <Text className={styles.datePickerHintText}>
                选择日期范围后，将导出该时间段内的所有巡护记录
              </Text>
            </View>

            <View className={styles.datePickerActions}>
              <View className={styles.datePickerCancel} onClick={cancelDatePicker}>
                <Text>取消</Text>
              </View>
              <View className={styles.datePickerConfirm} onClick={confirmExport}>
                <Text>确认导出</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default StatsPage;
