import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import { useReportStore } from '@/stores/useReportStore';
import { ReportItem } from '@/types';

type TabKey = 'pending' | 'processing' | 'completed';

const tabs: { key: TabKey; label: string; icon: string; color: string }[] = [
  { key: 'pending', label: '待处理', icon: '⏳', color: '#ff7d00' },
  { key: 'processing', label: '处理中', icon: '🔧', color: '#165dff' },
  { key: 'completed', label: '已解决', icon: '✅', color: '#00b42a' },
];

const DutyBoardPage: React.FC = () => {
  const { initReports, reports, updateReportStatus } = useReportStore();
  const [activeTab, setActiveTab] = useState<TabKey>('pending');
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [currentReportId, setCurrentReportId] = useState<string>('');
  const [processAction, setProcessAction] = useState<'processing' | 'completed'>('processing');
  const [processRemark, setProcessRemark] = useState('');

  useEffect(() => {
    initReports();
  }, [initReports]);

  useDidShow(() => {
    initReports();
  });

  const counts = useMemo(() => {
    return {
      pending: reports.filter((r) => r.status === 'pending').length,
      processing: reports.filter((r) => r.status === 'processing').length,
      completed: reports.filter((r) => r.status === 'completed').length,
    };
  }, [reports]);

  const filteredReports = useMemo(() => {
    const list = reports.filter((r) => r.status === activeTab);
    return list.sort((a, b) => {
      const tA = new Date(a.createTime.replace(/\//g, '-')).getTime();
      const tB = new Date(b.createTime.replace(/\//g, '-')).getTime();
      return tB - tA;
    });
  }, [reports, activeTab]);

  const openProcessModal = (reportId: string, action: 'processing' | 'completed') => {
    setCurrentReportId(reportId);
    setProcessAction(action);
    setProcessRemark('');
    setShowProcessModal(true);
  };

  const confirmProcess = () => {
    if (!currentReportId) return;
    updateReportStatus(currentReportId, processAction, processRemark || undefined);
    setShowProcessModal(false);
    setCurrentReportId('');
    setProcessRemark('');
    initReports();
    Taro.showToast({
      title: processAction === 'processing' ? '已推进为处理中' : '已标记为已解决',
      icon: 'success',
    });
  };

  const handleViewDetail = (id: string) => {
    Taro.navigateTo({ url: `/pages/report-detail/index?id=${id}` });
  };

  const getQuickAction = (report: ReportItem) => {
    if (report.status === 'pending') {
      return { label: '开始处理', action: 'processing' as const };
    }
    if (report.status === 'processing') {
      return { label: '标记已解决', action: 'completed' as const };
    }
    return null;
  };

  const getLatestRemark = (report: ReportItem) => {
    if (!report.progress || report.progress.length === 0) return '';
    const last = report.progress[report.progress.length - 1];
    return last.remark || '';
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>值班室处理看板</Text>
        <Text className={styles.subtitle}>隐患处理状态一览</Text>
      </View>

      <View className={styles.summaryRow}>
        {tabs.map((tab) => (
          <View
            key={tab.key}
            className={styles.summaryItem}
            onClick={() => setActiveTab(tab.key)}
          >
            <Text className={styles.summaryIcon}>{tab.icon}</Text>
            <Text className={styles.summaryCount} style={{ color: tab.color }}>
              {counts[tab.key]}
            </Text>
            <Text className={styles.summaryLabel}>{tab.label}</Text>
          </View>
        ))}
      </View>

      <View className={styles.tabBar}>
        {tabs.map((tab) => (
          <View
            key={tab.key}
            className={`${styles.tab} ${activeTab === tab.key ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <Text style={{ color: activeTab === tab.key ? tab.color : '#86909c' }}>
              {tab.label}
            </Text>
            <Text className={styles.tabCount}>{counts[tab.key]}</Text>
          </View>
        ))}
      </View>

      <ScrollView scrollY className={styles.listArea}>
        {filteredReports.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📋</Text>
            <Text className={styles.emptyText}>
              {activeTab === 'pending' && '暂无待处理隐患'}
              {activeTab === 'processing' && '暂无处理中的隐患'}
              {activeTab === 'completed' && '暂无已解决的隐患'}
            </Text>
          </View>
        ) : (
          <View className={styles.reportList}>
            {filteredReports.map((report) => {
              const quick = getQuickAction(report);
              const latestRemark = getLatestRemark(report);
              return (
                <View key={report.id} className={styles.reportCard}>
                  <View className={styles.reportHeader} onClick={() => handleViewDetail(report.id)}>
                    <View className={styles.reportTypeRow}>
                      <Text className={styles.reportType}>{report.typeName}</Text>
                      <View className={`${styles.statusTag} ${styles[`status-${report.status}`]}`}>
                        <Text>{tabs.find((t) => t.key === report.status)?.label}</Text>
                      </View>
                    </View>
                    <Text className={styles.reportTime}>{report.createTime}</Text>
                  </View>

                  <View className={styles.reportDesc} onClick={() => handleViewDetail(report.id)}>
                    <Text className={styles.reportDescText}>{report.description}</Text>
                  </View>

                  <View className={styles.reportMetaRow}>
                    <View className={styles.metaItem}>
                      <Text className={styles.metaIcon}>👤</Text>
                      <Text className={styles.metaText}>{report.reporter}</Text>
                    </View>
                    <View className={styles.metaItem}>
                      <Text className={styles.metaIcon}>📍</Text>
                      <Text className={styles.metaText}>{report.location.slice(0, 20)}</Text>
                    </View>
                  </View>

                  {latestRemark && (
                    <View className={styles.remarkRow}>
                      <Text className={styles.remarkLabel}>最近备注：</Text>
                      <Text className={styles.remarkText}>{latestRemark}</Text>
                    </View>
                  )}

                  <View className={styles.actionRow}>
                    <View className={styles.viewDetailBtn} onClick={() => handleViewDetail(report.id)}>
                      <Text>查看详情</Text>
                    </View>
                    {quick && (
                      <View
                        className={`${styles.quickBtn} ${quick.action === 'completed' ? styles.resolveBtn : styles.processBtn}`}
                        onClick={() => openProcessModal(report.id, quick.action)}
                      >
                        <Text>{quick.label}</Text>
                      </View>
                    )}
                    {!quick && (
                      <View className={styles.doneBtn}>
                        <Text>已完成</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
        <View style={{ height: '60rpx' }}></View>
      </ScrollView>

      {showProcessModal && (
        <View className={styles.modalOverlay}>
          <View className={styles.modalContent}>
            <Text className={styles.modalTitle}>
              {processAction === 'processing' ? '确认开始处理' : '确认标记已解决'}
            </Text>

            <View className={styles.modalField}>
              <Text className={styles.modalLabel}>处理备注</Text>
              <View className={styles.modalInputWrap}>
                <Text
                  className={styles.modalInput}
                  onClick={() => {
                    Taro.showModal({
                      title: '输入备注',
                      editable: true,
                      placeholderText: '请输入处理备注...',
                      success: (res) => {
                        if (res.confirm && res.content) {
                          setProcessRemark(res.content);
                        }
                      },
                    });
                  }}
                >
                  {processRemark || '点击输入备注（可选）'}
                </Text>
              </View>
            </View>

            <View className={styles.modalActions}>
              <View className={styles.modalCancel} onClick={() => setShowProcessModal(false)}>
                <Text>取消</Text>
              </View>
              <View className={styles.modalConfirm} onClick={confirmProcess}>
                <Text>确认</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default DutyBoardPage;
