import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';

interface OfflinePackage {
  id: string;
  name: string;
  area: string;
  size: string;
  sizeBytes: number;
  status: 'not_downloaded' | 'downloading' | 'downloaded';
  progress: number;
}

const OfflinePage: React.FC = () => {
  const [packages, setPackages] = useState<OfflinePackage[]>([
    {
      id: 'p1',
      name: '东线片区地图',
      area: '东线A段 + 东线B段',
      size: '45.2 MB',
      sizeBytes: 45.2,
      status: 'downloaded',
      progress: 100,
    },
    {
      id: 'p2',
      name: '西线片区地图',
      area: '西线B段 + 西线C段',
      size: '38.6 MB',
      sizeBytes: 38.6,
      status: 'downloading',
      progress: 65,
    },
    {
      id: 'p3',
      name: '南线片区地图',
      area: '南线C段 + 南线D段',
      size: '52.1 MB',
      sizeBytes: 52.1,
      status: 'not_downloaded',
      progress: 0,
    },
    {
      id: 'p4',
      name: '北线片区地图',
      area: '北线D段 + 北线E段',
      size: '41.8 MB',
      sizeBytes: 41.8,
      status: 'not_downloaded',
      progress: 0,
    },
    {
      id: 'p5',
      name: '核心区地图',
      area: '中线核心保护区',
      size: '68.3 MB',
      sizeBytes: 68.3,
      status: 'downloaded',
      progress: 100,
    },
  ]);

  const [pendingUpload, setPendingUpload] = useState(3);
  const [pendingReports, setPendingReports] = useState(2);

  const totalSize = packages.reduce((sum, p) => sum + p.sizeBytes, 0);
  const downloadedSize = packages
    .filter((p) => p.status === 'downloaded')
    .reduce((sum, p) => sum + p.sizeBytes, 0);
  const usedPercent = ((downloadedSize / totalSize) * 100).toFixed(0);

  const handleDownload = (pkg: OfflinePackage) => {
    if (pkg.status === 'not_downloaded') {
      console.log('[Offline] 开始下载', pkg.name);
      setPackages((prev) =>
        prev.map((p) =>
          p.id === pkg.id ? { ...p, status: 'downloading', progress: 0 } : p
        )
      );

      let progress = 0;
      const timer = setInterval(() => {
        progress += 10;
        if (progress >= 100) {
          clearInterval(timer);
          setPackages((prev) =>
            prev.map((p) =>
              p.id === pkg.id
                ? { ...p, status: 'downloaded', progress: 100 }
                : p
            )
          );
          Taro.showToast({ title: '下载完成', icon: 'success' });
        } else {
          setPackages((prev) =>
            prev.map((p) => (p.id === pkg.id ? { ...p, progress } : p))
          );
        }
      }, 500);
    } else if (pkg.status === 'downloaded') {
      Taro.showModal({
        title: '删除确认',
        content: '确定要删除"' + pkg.name + '"吗？',
        success: (res) => {
          if (res.confirm) {
            setPackages((prev) =>
              prev.map((p) =>
                p.id === pkg.id
                  ? { ...p, status: 'not_downloaded', progress: 0 }
                  : p
              )
            );
            Taro.showToast({ title: '已删除', icon: 'success' });
            console.log('[Offline] 删除离线包', pkg.name);
          }
        },
      });
    }
  };

  const handleSync = () => {
    if (pendingUpload > 0 || pendingReports > 0) {
      Taro.showLoading({ title: '同步中...' });
      console.log('[Offline] 开始同步数据');
      setTimeout(() => {
        Taro.hideLoading();
        setPendingUpload(0);
        setPendingReports(0);
        Taro.showToast({ title: '同步完成', icon: 'success' });
      }, 2000);
    } else {
      Taro.showToast({ title: '暂无待同步数据', icon: 'none' });
    }
  };

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      not_downloaded: '未下载',
      downloading: '下载中',
      downloaded: '已下载',
    };
    return map[status] || status;
  };

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      not_downloaded: '#86909c',
      downloading: '#2e7d32',
      downloaded: '#00b42a',
    };
    return map[status] || '#86909c';
  };

  const getBtnText = (status: string) => {
    const map: Record<string, string> = {
      not_downloaded: '下载',
      downloading: '下载中',
      downloaded: '删除',
    };
    return map[status] || '下载';
  };

  const storageWidth = (downloadedSize / totalSize) * 100;

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>存储空间</Text>
        <View className={styles.storageCard}>
          <View className={styles.storageInfo}>
            <View className={styles.storageIcon}>
              <Text>📦</Text>
            </View>
            <View className={styles.storageText}>
              <Text className={styles.storageTitle}>离线地图数据</Text>
              <Text className={styles.storageDesc}>
                已使用 {downloadedSize.toFixed(1)} MB / 共 {totalSize.toFixed(1)} MB
              </Text>
            </View>
          </View>
          <View className={styles.storageBar}>
            <View
              className={styles.storageFill}
              style={{ width: storageWidth + '%' }}
            ></View>
          </View>
          <View className={styles.storageDetail}>
            <Text>已用 {usedPercent}%</Text>
            <Text>剩余 {100 - Number(usedPercent)}%</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>离线地图包</Text>
        <View className={styles.packageList}>
          {packages.map((pkg) => (
            <View key={pkg.id} className={styles.packageItem}>
              <View className={styles.packageHeader}>
                <Text className={styles.packageName}>{pkg.name}</Text>
                <Text className={styles.packageSize}>{pkg.size}</Text>
              </View>
              <Text className={styles.packageDesc}>{pkg.area}</Text>
              {pkg.status === 'downloading' && (
                <View className={styles.packageProgress}>
                  <View
                    className={styles.packageProgressFill}
                    style={{ width: pkg.progress + '%' }}
                  ></View>
                </View>
              )}
              <View className={styles.packageFooter}>
                <View className={styles.packageStatus}>
                  <View
                    className={styles.statusDot}
                    style={{ background: getStatusColor(pkg.status) }}
                  ></View>
                  <Text style={{ color: getStatusColor(pkg.status) }}>
                    {getStatusText(pkg.status)}
                    {pkg.status === 'downloading' && ' ' + pkg.progress + '%'}
                  </Text>
                </View>
                <View
                  className={classnames(
                    styles.downloadBtn,
                    pkg.status === 'downloaded' ? styles.outline : styles.primary
                  )}
                  onClick={() => handleDownload(pkg)}
                >
                  <Text>{getBtnText(pkg.status)}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>离线数据同步</Text>
        <View className={styles.syncSection}>
          <View className={styles.syncItem}>
            <View className={styles.syncInfo}>
              <Text className={styles.syncIcon}>📍</Text>
              <Text className={styles.syncText}>待上传轨迹</Text>
              {pendingUpload > 0 && (
                <View className={styles.syncCount}>
                  <Text>{pendingUpload} 条</Text>
                </View>
              )}
            </View>
            <Text className={styles.syncAction} onClick={handleSync}>
              {pendingUpload > 0 ? '立即上传' : '已同步'}
            </Text>
          </View>
          <View className={styles.syncItem}>
            <View className={styles.syncInfo}>
              <Text className={styles.syncIcon}>📝</Text>
              <Text className={styles.syncText}>待上传上报</Text>
              {pendingReports > 0 && (
                <View className={styles.syncCount}>
                  <Text>{pendingReports} 条</Text>
                </View>
              )}
            </View>
            <Text className={styles.syncAction} onClick={handleSync}>
              {pendingReports > 0 ? '立即上传' : '已同步'}
            </Text>
          </View>
          <View className={styles.syncItem}>
            <View className={styles.syncInfo}>
              <Text className={styles.syncIcon}>🔄</Text>
              <Text className={styles.syncText}>自动同步</Text>
              <Text className={styles.syncDesc}>(仅WiFi)</Text>
            </View>
            <Text className={styles.syncAction}>已开启</Text>
          </View>
        </View>
      </View>

      <View style={{ height: '40rpx' }}></View>
    </ScrollView>
  );
};

export default OfflinePage;
