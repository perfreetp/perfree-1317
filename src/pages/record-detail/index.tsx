import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import { usePatrolRecordStore } from '@/stores/usePatrolRecordStore';
import { useReportStore } from '@/stores/useReportStore';
import { formatDuration } from '@/utils';
import { PatrolRecord } from '@/types';
import classnames from 'classnames';

const RecordDetailPage: React.FC = () => {
  const router = useRouter();
  const recordId = router.params.id || '';
  const { initRecords, getRecordById } = usePatrolRecordStore();
  const { initReports, getReportById } = useReportStore();
  const [record, setRecord] = useState<PatrolRecord | undefined>();

  const loadData = () => {
    initRecords();
    initReports();
    const found = getRecordById(recordId);
    setRecord(found);
  };

  useEffect(() => {
    loadData();
  }, [recordId]);

  useDidShow(() => {
    loadData();
  });

  const handleReportClick = (reportId: string) => {
    Taro.navigateTo({ url: `/pages/report-detail/index?id=${reportId}` });
  };

  if (!record) {
    return (
      <View className={styles.page}>
        <Text>加载中...</Text>
      </View>
    );
  }

  const linkedReports = (record.reportIds || [])
    .map((id) => getReportById(id))
    .filter(Boolean);

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.header}>
        <View className={styles.routeIcon}>🗺️</View>
        <Text className={styles.routeName}>{record.taskName || '巡护路线'}</Text>
        <Text className={styles.recordDate}>{record.date}</Text>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>⏱️</Text>
          巡护时间
        </Text>
        <View className={styles.timeCard}>
          <View className={styles.timeItem}>
            <Text className={styles.timeLabel}>开始时间</Text>
            <Text className={styles.timeValue}>{record.startTime || '--'}</Text>
          </View>
          <View className={styles.timeDivider}></View>
          <View className={styles.timeItem}>
            <Text className={styles.timeLabel}>结束时间</Text>
            <Text className={styles.timeValue}>{record.endTime || '--'}</Text>
          </View>
          <View className={styles.timeDivider}></View>
          <View className={styles.timeItem}>
            <Text className={styles.timeLabel}>巡护时长</Text>
            <Text className={styles.timeValue}>{formatDuration(record.duration)}</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>📊</Text>
          巡护数据
        </Text>
        <View className={styles.statsGrid}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{record.distance.toFixed(1)}</Text>
            <Text className={styles.statLabel}>巡护里程(公里)</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{record.checkpoints}</Text>
            <Text className={styles.statLabel}>打卡点数</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{record.reports || 0}</Text>
            <Text className={styles.statLabel}>隐患上报</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{record.turnBack || 0}</Text>
            <Text className={styles.statLabel}>劝返人数</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>📍</Text>
          打卡点明细
        </Text>
        <View className={styles.checkpointList}>
          {(record.checkpointDetails || []).length === 0 ? (
            <View className={styles.emptyTip}>
              <Text>暂无打卡点明细</Text>
            </View>
          ) : (
            (record.checkpointDetails || []).map((cp, index) => (
              <View key={cp.id} className={styles.checkpointItem}>
                <View className={classnames(styles.cpIndex, cp.checked && styles.checked)}>
                  <Text>{cp.checked ? '✓' : index + 1}</Text>
                </View>
                <View className={styles.cpInfo}>
                  <Text className={styles.cpName}>{cp.name}</Text>
                  <Text className={styles.cpTime}>
                    {cp.checkedTime ? `打卡时间：${cp.checkedTime}` : '未打卡'}
                  </Text>
                </View>
                <Text
                  className={classnames(
                    styles.cpStatus,
                    cp.checked ? styles.checked : styles.pending
                  )}
                >
                  {cp.checked ? '已完成' : '未打卡'}
                </Text>
              </View>
            ))
          )}
        </View>
      </View>

      {linkedReports.length > 0 && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>⚠️</Text>
            关联隐患上报
          </Text>
          <View className={styles.reportList}>
            {linkedReports.map((report: any) => (
              <View
                key={report.id}
                className={styles.reportItem}
                onClick={() => handleReportClick(report.id)}
              >
                <View className={styles.reportIcon}>
                  {report.type === 'fire' && '🔥'}
                  {report.type === 'poaching' && '🦌'}
                  {report.type === 'roadblock' && '🚧'}
                  {report.type === 'other' && '⚠️'}
                </View>
                <View className={styles.reportInfo}>
                  <Text className={styles.reportType}>{report.typeName}</Text>
                  <Text className={styles.reportDesc} numberOfLines={1}>
                    {report.description}
                  </Text>
                  <Text className={styles.reportTime}>{report.createTime}</Text>
                </View>
                <Text className={styles.reportArrow}>›</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={{ height: '40rpx' }}></View>
    </ScrollView>
  );
};

export default RecordDetailPage;
