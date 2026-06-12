import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { reportList } from '@/data/reports';
import classnames from 'classnames';
import { ReportItem } from '@/types';

const ReportDetailPage: React.FC = () => {
  const router = useRouter();
  const reportId = router.params.id || 'report002';
  const [report, setReport] = useState<ReportItem | undefined>();

  useEffect(() => {
    const found = reportList.find((r) => r.id === reportId);
    setReport(found);
    console.log('[ReportDetail] 加载上报', reportId);
  }, [reportId]);

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      pending: '待处理',
      processing: '处理中',
      resolved: '已解决',
    };
    return map[status] || status;
  };

  const getTypeIcon = (type: string) => {
    const map: Record<string, string> = {
      poaching: '🦌',
      fire: '🔥',
      roadblock: '🚧',
      other: '⚠️',
    };
    return map[type] || '📝';
  };

  const handlePreviewImage = (index: number) => {
    if (!report) return;
    console.log('[ReportDetail] 预览图片', index);
    Taro.previewImage({
      current: report.images[index],
      urls: report.images,
    });
  };

  const handleCall = () => {
    console.log('[ReportDetail] 联系值班室');
    Taro.makePhoneCall({
      phoneNumber: '02888881234',
      fail: (err) => {
        console.error('[ReportDetail] 拨打电话失败', err);
      },
    });
  };

  const handleFollow = () => {
    console.log('[ReportDetail] 关注此上报');
    Taro.showToast({ title: '已关注', icon: 'success' });
  };

  if (!report) {
    return (
      <View className={styles.page}>
        <Text>加载中...</Text>
      </View>
    );
  }

  const timeline = [
    { status: 'done', content: '隐患已确认，已安排处理', time: '2024-01-15 14:30' },
    { status: 'done', content: '值班室已接收上报', time: '2024-01-15 09:46' },
    { status: 'pending', content: '等待处理结果', time: '' },
  ];

  const waveBars = Array.from({ length: 30 }, () => {
    const height = Math.random() * 30 + 10;
    return height;
  });

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.section}>
        <View className={styles.typeHeader}>
          <View className={styles.typeIcon}>
            <Text>{getTypeIcon(report.type)}</Text>
          </View>
          <View className={styles.typeInfo}>
            <Text className={styles.typeName}>{report.typeName}</Text>
            <Text className={styles.reportId}>上报编号：{report.id.toUpperCase()}</Text>
          </View>
          <View className={`${styles.statusBadge} ${styles[report.status]}`}>
            <Text>{getStatusText(report.status)}</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>基本信息</Text>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>上报人</Text>
          <Text className={styles.infoValue}>{report.reporter}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>上报时间</Text>
          <Text className={styles.infoValue}>{report.createTime}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>位置</Text>
          <Text className={styles.infoValue}>{report.location}</Text>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>详细描述</Text>
        <Text className={styles.descText}>{report.description}</Text>
      </View>

      {report.images.length > 0 && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>现场照片</Text>
          <View className={styles.imageGrid}>
            {report.images.map((img, index) => (
              <View
                key={index}
                className={styles.imageItem}
                onClick={() => handlePreviewImage(index)}
              >
                <Image className={styles.imageImg} src={img} mode="aspectFill" />
              </View>
            ))}
          </View>
        </View>
      )}

      {report.voiceNote ? (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>语音备注</Text>
          <View className={styles.voiceBox}>
            <View className={styles.voicePlayBtn}>
              <Text>▶</Text>
            </View>
            <View className={styles.voiceInfo}>
              <View className={styles.voiceWave}>
                {waveBars.map((height, i) => (
                  <View
                    key={i}
                    className={styles.waveBar}
                    style={{ height: `${height}rpx` }}
                  ></View>
                ))}
              </View>
              <Text className={styles.voiceDuration}>时长 00:28</Text>
            </View>
          </View>
        </View>
      ) : null}

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>处理进度</Text>
        <View className={styles.timeline}>
          {timeline.map((item, index) => (
            <View key={index} className={styles.timelineItem}>
              <View
                className={classnames(
                  styles.timelineDot,
                  item.status === 'done' ? styles.done : styles.pending
                )}
              ></View>
              <Text className={styles.timelineContent}>{item.content}</Text>
              {item.time && <Text className={styles.timelineTime}>{item.time}</Text>}
            </View>
          ))}
        </View>
      </View>

      <View style={{ height: '140rpx' }}></View>

      <View className={styles.bottomBar}>
        <View className={styles.outlineBtn} onClick={handleCall}>
          <Text>联系值班室</Text>
        </View>
        <View className={styles.primaryBtn} onClick={handleFollow}>
          <Text>关注此上报</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default ReportDetailPage;
