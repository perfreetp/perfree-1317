import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import { useReportStore } from '@/stores/useReportStore';
import classnames from 'classnames';
import { ReportItem } from '@/types';

const ReportDetailPage: React.FC = () => {
  const router = useRouter();
  const reportId = router.params.id || 'report001';
  const { initReports, getReportById, updateReportStatus } = useReportStore();
  const [report, setReport] = useState<ReportItem | undefined>();
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [processAction, setProcessAction] = useState<'processing' | 'completed'>('processing');
  const [processRemark, setProcessRemark] = useState('');

  const loadReport = () => {
    initReports();
    const found = getReportById(reportId);
    setReport(found);
  };

  useEffect(() => {
    loadReport();
  }, [reportId]);

  useDidShow(() => {
    loadReport();
  });

  const waveBars = Array.from({ length: 30 }, () => {
    const height = Math.random() * 30 + 10;
    return height;
  });

  const handleCallDuty = () => {
    Taro.makePhoneCall({
      phoneNumber: '02888881234',
    });
  };

  const previewImage = (url: string) => {
    Taro.previewImage({
      urls: report?.images || [],
      current: url,
    });
  };

  const openProcessModal = (action: 'processing' | 'completed') => {
    setProcessAction(action);
    setProcessRemark('');
    setShowProcessModal(true);
  };

  const confirmProcess = () => {
    updateReportStatus(reportId, processAction, processRemark || undefined);
    setShowProcessModal(false);
    loadReport();
    Taro.showToast({
      title: processAction === 'processing' ? '已推进为处理中' : '已标记为已解决',
      icon: 'success',
    });
  };

  if (!report) {
    return (
      <View className={styles.page}>
        <Text>加载中...</Text>
      </View>
    );
  }

  const statusMap: Record<string, { text: string; class: string }> = {
    pending: { text: '待处理', class: 'pending' },
    processing: { text: '处理中', class: 'processing' },
    completed: { text: '已解决', class: 'completed' },
  };

  const typeIconMap: Record<string, string> = {
    poaching: '🦌',
    fire: '🔥',
    roadblock: '🚧',
    other: '⚠️',
  };

  const displayProgress = report.progress && report.progress.length > 0
    ? report.progress
    : [
        { status: 'pending' as const, statusText: '待处理', time: report.createTime, operator: '系统', remark: '已提交上报，等待值班室派单' },
      ];

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={`${styles.header} ${styles[report.type]}`}>
        <View className={styles.typeIcon}>
          <Text>{typeIconMap[report.type] || '⚠️'}</Text>
        </View>
        <Text className={styles.typeName}>{report.typeName}</Text>
        <Text className={styles.reportNo}>编号：{report.id}</Text>
        <View className={`${styles.statusBadge} ${styles[statusMap[report.status]?.class]}`}>
          <Text>{statusMap[report.status]?.text || '待处理'}</Text>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>基本信息</Text>
        <View className={styles.infoCard}>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>上报人</Text>
            <Text className={styles.infoValue}>{report.reporter}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>上报时间</Text>
            <Text className={styles.infoValue}>{report.createTime}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>位置</Text>
            <Text className={styles.infoValue}>{report.location}</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>详细描述</Text>
        <View className={styles.descCard}>
          <Text className={styles.descText}>{report.description}</Text>
        </View>
      </View>

      {report.images && report.images.length > 0 && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>现场照片</Text>
          <View className={styles.photoGrid}>
            {report.images.map((img, index) => (
              <View
                key={index}
                className={styles.photoItem}
                onClick={() => previewImage(img)}
              >
                <Image className={styles.photoImg} src={img} mode="aspectFill" />
              </View>
            ))}
          </View>
        </View>
      )}

      {report.voiceNote ? (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>语音备注</Text>
          <View className={styles.voiceCard}>
            <View className={styles.voicePlayer}>
              <View className={styles.playBtn}>
                <Text>▶</Text>
              </View>
              <View className={styles.waveform}>
                {waveBars.map((height, index) => (
                  <View
                    key={index}
                    className={styles.waveBar}
                    style={{ height: `${height}rpx` }}
                  ></View>
                ))}
              </View>
              <Text className={styles.duration}>{report.voiceNote}</Text>
            </View>
          </View>
        </View>
      ) : null}

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>处理进度</Text>
        <View className={styles.timeline}>
          {displayProgress.map((node, index) => (
            <View key={index} className={styles.timelineItem}>
              <View className={classnames(styles.timelineDot, styles.done)}>
                <Text className={styles.dotCheck}>✓</Text>
              </View>
              <View className={styles.timelineContent}>
                <Text className={styles.timelineText}>{node.statusText}</Text>
                <Text className={styles.timelineTime}>{node.time} · {node.operator}</Text>
                {node.remark && (
                  <View className={styles.timelineRemark}>
                    <Text className={styles.timelineRemarkText}>{node.remark}</Text>
                  </View>
                )}
              </View>
              {index < displayProgress.length - 1 && <View className={styles.timelineLine}></View>}
            </View>
          ))}
        </View>
      </View>

      {report.dutyRemark && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>值班室备注</Text>
          <View className={styles.dutyRemarkCard}>
            <Text className={styles.dutyRemarkText}>{report.dutyRemark}</Text>
          </View>
        </View>
      )}

      <View style={{ height: '160rpx' }}></View>

      <View className={styles.bottomBar}>
        <View className={styles.secondaryBtn} onClick={handleCallDuty}>
          <Text>📞 联系值班室</Text>
        </View>
        {report.status === 'pending' && (
          <View className={styles.primaryBtn} onClick={() => openProcessModal('processing')}>
            <Text>开始处理</Text>
          </View>
        )}
        {report.status === 'processing' && (
          <View className={styles.resolveBtn} onClick={() => openProcessModal('completed')}>
            <Text>标记已解决</Text>
          </View>
        )}
        {report.status === 'completed' && (
          <View className={classnames(styles.primaryBtn, styles.disabledBtn)}>
            <Text>已解决</Text>
          </View>
        )}
      </View>

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
                  className={classnames(styles.modalInput, !processRemark && styles.placeholder)}
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
    </ScrollView>
  );
};

export default ReportDetailPage;
