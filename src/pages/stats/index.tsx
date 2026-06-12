import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import { userInfo, monthlyStats } from '@/data/stats';
import { usePatrolRecordStore } from '@/stores/usePatrolRecordStore';
import { useReportStore } from '@/stores/useReportStore';
import { PatrolRecord } from '@/types';

const StatsPage: React.FC = () => {
  const { initRecords, records, getRecordsByDateRange } = usePatrolRecordStore();
  const { initReports, getUnresolvedCount } = useReportStore();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showExportPreview, setShowExportPreview] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterRoute, setFilterRoute] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [exportData, setExportData] = useState<{
    records: PatrolRecord[];
    totalDistance: number;
    totalCheckpoints: number;
    totalReports: number;
    unresolvedCount: number;
    range: string;
  } | null>(null);

  useEffect(() => {
    initRecords();
    initReports();
  }, [initRecords, initReports]);

  useDidShow(() => {
    initRecords();
    initReports();
  });

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
    Taro.showActionSheet({
      itemList: ['导出本周记录', '导出本月记录', '按日期范围导出'],
      success: (res) => {
        if (res.tapIndex === 2) {
          openDatePicker();
        } else {
          const defaults = getDefaultDates();
          let start = defaults.start;
          let end = defaults.end;

          if (res.tapIndex === 0) {
            const d = new Date();
            d.setDate(d.getDate() - 7);
            start = formatDateStr(d);
            end = defaults.end;
          } else if (res.tapIndex === 1) {
            const d = new Date();
            d.setDate(1);
            start = formatDateStr(d);
            end = defaults.end;
          }

          prepareExportPreview(start, end);
        }
      },
    });
  };

  const openDatePicker = () => {
    const defaults = getDefaultDates();
    setStartDate(defaults.start);
    setEndDate(defaults.end);
    setFilterRoute('');
    setFilterType('');
    setFilterStatus('');
    setShowDatePicker(true);
  };

  const pickStartDate = () => {
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

  const selectFilterRoute = () => {
    const routeNames = [...new Set(records.map((r) => r.taskName).filter(Boolean))];
    if (routeNames.length === 0) {
      Taro.showToast({ title: '暂无路线数据', icon: 'none' });
      return;
    }
    const items = ['全部路线', ...routeNames as string[]];
    Taro.showActionSheet({
      itemList: items,
      success: (res) => {
        setFilterRoute(res.tapIndex === 0 ? '' : (items[res.tapIndex] || ''));
      },
    });
  };

  const selectFilterType = () => {
    const items = ['全部类型', '偷采偷猎', '火源隐患', '临时封路', '其他隐患'];
    Taro.showActionSheet({
      itemList: items,
      success: (res) => {
        setFilterType(res.tapIndex === 0 ? '' : items[res.tapIndex]);
      },
    });
  };

  const selectFilterStatus = () => {
    const items = ['全部状态', '待处理', '处理中', '已解决'];
    Taro.showActionSheet({
      itemList: items,
      success: (res) => {
        setFilterStatus(res.tapIndex === 0 ? '' : items[res.tapIndex]);
      },
    });
  };

  const cancelDatePicker = () => {
    setShowDatePicker(false);
  };

  const prepareExportPreview = (start: string, end: string) => {
    if (!start || !end) {
      Taro.showToast({ title: '请选择完整日期范围', icon: 'none' });
      return;
    }

    if (new Date(start) > new Date(end)) {
      Taro.showToast({ title: '开始日期不能晚于结束日期', icon: 'none' });
      return;
    }

    initRecords();
    let filteredRecords = getRecordsByDateRange(start, end);

    if (filterRoute) {
      filteredRecords = filteredRecords.filter((r) => r.taskName === filterRoute);
    }

    const totalDistance = filteredRecords.reduce((sum, r) => sum + r.distance, 0);
    const totalCheckpoints = filteredRecords.reduce((sum, r) => sum + r.checkpoints, 0);
    const totalReports = filteredRecords.reduce((sum, r) => sum + (r.reports || 0), 0);

    initReports();
    const unresolvedCount = getUnresolvedCount();

    setExportData({
      records: filteredRecords,
      totalDistance: Math.round(totalDistance * 10) / 10,
      totalCheckpoints,
      totalReports,
      unresolvedCount,
      range: `${start} 至 ${end}`,
    });

    setShowDatePicker(false);
    setShowExportPreview(true);
  };

  const confirmDateRange = () => {
    prepareExportPreview(startDate, endDate);
  };

  const doExport = () => {
    if (!exportData) return;

    console.log('[Stats] 开始导出', exportData.range, exportData.records.length, '条');
    setShowExportPreview(false);
    Taro.showLoading({ title: '导出中...' });

    setTimeout(() => {
      Taro.hideLoading();
      Taro.showToast({
        title: '导出成功',
        icon: 'success',
        duration: 2000,
      });
    }, 1500);
  };

  const cancelExportPreview = () => {
    setShowExportPreview(false);
    setExportData(null);
  };

  const handleRecordClick = (recordId: string) => {
    Taro.navigateTo({ url: `/pages/record-detail/index?id=${recordId}` });
  };

  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [records]);

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
          {sortedRecords.length === 0 ? (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>📋</Text>
              <Text className={styles.emptyText}>暂无巡护记录</Text>
            </View>
          ) : (
            sortedRecords.map((record) => (
              <View
                key={record.id}
                className={styles.recordItem}
                onClick={() => handleRecordClick(record.id)}
              >
                <View className={styles.recordTop}>
                  <View>
                    <Text className={styles.recordDate}>{record.date}</Text>
                    {record.taskName && (
                      <Text className={styles.recordTaskName}>{record.taskName}</Text>
                    )}
                  </View>
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
                    <Text className={styles.recordInfoIcon}>⚠️</Text>
                    <Text>{record.reports || 0}条上报</Text>
                  </View>
                </View>
                <View className={styles.recordArrow}>
                  <Text>›</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </View>

      <View style={{ height: '40rpx' }}></View>

      {showDatePicker && (
        <View className={styles.datePickerOverlay}>
          <View className={styles.datePickerContent}>
            <Text className={styles.datePickerTitle}>选择导出条件</Text>

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

            <View className={styles.datePickerRow}>
              <View className={styles.datePickerLabel}>
                <Text>路线筛选</Text>
              </View>
              <View className={styles.datePickerInput} onClick={selectFilterRoute}>
                <Text className={styles.datePickerText}>{filterRoute || '全部路线'}</Text>
                <Text className={styles.datePickerArrow}>›</Text>
              </View>
            </View>

            <View className={styles.datePickerRow}>
              <View className={styles.datePickerLabel}>
                <Text>隐患类型</Text>
              </View>
              <View className={styles.datePickerInput} onClick={selectFilterType}>
                <Text className={styles.datePickerText}>{filterType || '全部类型'}</Text>
                <Text className={styles.datePickerArrow}>›</Text>
              </View>
            </View>

            <View className={styles.datePickerRow}>
              <View className={styles.datePickerLabel}>
                <Text>处理状态</Text>
              </View>
              <View className={styles.datePickerInput} onClick={selectFilterStatus}>
                <Text className={styles.datePickerText}>{filterStatus || '全部状态'}</Text>
                <Text className={styles.datePickerArrow}>›</Text>
              </View>
            </View>

            <View className={styles.datePickerActions}>
              <View className={styles.datePickerCancel} onClick={cancelDatePicker}>
                <Text>取消</Text>
              </View>
              <View className={styles.datePickerConfirm} onClick={confirmDateRange}>
                <Text>预览数据</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {showExportPreview && exportData && (
        <View className={styles.datePickerOverlay}>
          <View className={styles.datePickerContent}>
            <Text className={styles.datePickerTitle}>导出数据预览</Text>

            <Text className={styles.exportRangeText}>日期范围：{exportData.range}</Text>

            <View className={styles.exportPreviewGrid}>
              <View className={styles.exportPreviewItem}>
                <Text className={styles.exportPreviewValue}>{exportData.records.length}</Text>
                <Text className={styles.exportPreviewLabel}>记录条数</Text>
              </View>
              <View className={styles.exportPreviewItem}>
                <Text className={styles.exportPreviewValue}>{exportData.totalDistance}</Text>
                <Text className={styles.exportPreviewLabel}>总里程(公里)</Text>
              </View>
              <View className={styles.exportPreviewItem}>
                <Text className={styles.exportPreviewValue}>{exportData.totalCheckpoints}</Text>
                <Text className={styles.exportPreviewLabel}>总打卡数</Text>
              </View>
            </View>

            <View className={styles.exportPreviewGrid}>
              <View className={styles.exportPreviewItem}>
                <Text className={styles.exportPreviewValue}>{exportData.totalReports}</Text>
                <Text className={styles.exportPreviewLabel}>隐患数量</Text>
              </View>
              <View className={styles.exportPreviewItem}>
                <Text className={styles.exportPreviewValue}>{exportData.unresolvedCount}</Text>
                <Text className={styles.exportPreviewLabel}>未解决</Text>
              </View>
              <View className={styles.exportPreviewItem}>
                <Text className={styles.exportPreviewValue}>
                  {exportData.totalReports - exportData.unresolvedCount}
                </Text>
                <Text className={styles.exportPreviewLabel}>已解决</Text>
              </View>
            </View>

            <View className={styles.datePickerActions}>
              <View className={styles.datePickerCancel} onClick={cancelExportPreview}>
                <Text>取消</Text>
              </View>
              <View className={styles.datePickerConfirm} onClick={doExport}>
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
