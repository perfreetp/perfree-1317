import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { noticeList } from '@/data/notices';
import { Notice } from '@/types';

type TabType = 'all' | 'urgent' | 'normal';

const NoticePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [notices, setNotices] = useState<Notice[]>(noticeList);

  const tabs = [
    { key: 'all' as TabType, text: '全部' },
    { key: 'urgent' as TabType, text: '紧急' },
    { key: 'normal' as TabType, text: '普通' },
  ];

  const filteredNotices = notices.filter((notice) => {
    if (activeTab === 'all') return true;
    return notice.type === activeTab;
  });

  const unreadCount = notices.filter((n) => !n.read).length;
  const urgentUnreadCount = notices.filter((n) => n.type === 'urgent' && !n.read).length;

  const handleNoticeClick = (notice: Notice) => {
    console.log('[Notice] 点击通知', notice.id);
    if (!notice.read) {
      setNotices((prev) =>
        prev.map((n) => (n.id === notice.id ? { ...n, read: true } : n))
      );
    }
    Taro.showModal({
      title: notice.title,
      content: notice.content,
      showCancel: false,
      confirmText: '知道了',
    });
  };

  const handleMarkAllRead = () => {
    Taro.showModal({
      title: '提示',
      content: '确定要标记全部为已读吗？',
      success: (res) => {
        if (res.confirm) {
          setNotices((prev) => prev.map((n) => ({ ...n, read: true })));
          Taro.showToast({ title: '已全部标为已读', icon: 'success' });
        }
      },
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.tabBar}>
        {tabs.map((tab) => {
          const count =
            tab.key === 'all'
              ? unreadCount
              : tab.key === 'urgent'
              ? urgentUnreadCount
              : unreadCount - urgentUnreadCount;
          return (
            <View
              key={tab.key}
              className={`${styles.tabItem} ${activeTab === tab.key ? styles.active : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <Text className={styles.tabText}>{tab.text}</Text>
              {count > 0 && (
                <View className={styles.tabBadge}>
                  <Text className={styles.tabBadgeText}>{count > 99 ? '99+' : count}</Text>
                </View>
              )}
            </View>
          );
        })}
        <View className={styles.markReadBtn} onClick={handleMarkAllRead}>
          <Text className={styles.markReadText}>全部已读</Text>
        </View>
      </View>

      <ScrollView scrollY className={styles.listContainer}>
        {filteredNotices.length === 0 ? (
          <View className={styles.empty}>
            <Text className={styles.emptyIcon}>📭</Text>
            <Text className={styles.emptyText}>暂无通知</Text>
          </View>
        ) : (
          <View className={styles.noticeList}>
            {filteredNotices.map((notice) => (
              <View
                key={notice.id}
                className={`${styles.noticeItem} ${!notice.read ? styles.unread : ''}`}
                onClick={() => handleNoticeClick(notice)}
              >
                <View className={styles.noticeLeft}>
                  <View
                    className={`${styles.noticeIcon} ${
                      notice.type === 'urgent' ? styles.urgentIcon : styles.normalIcon
                    }`}
                  >
                    <Text className={styles.noticeIconText}>
                      {notice.type === 'urgent' ? '⚠️' : '📢'}
                    </Text>
                  </View>
                  {!notice.read && <View className={styles.redDot}></View>}
                </View>
                <View className={styles.noticeContent}>
                  <View className={styles.noticeHeader}>
                    <Text className={styles.noticeTitle} numberOfLines={1}>
                      {notice.title}
                    </Text>
                    <View
                      className={`${styles.noticeTag} ${
                        notice.type === 'urgent' ? styles.urgentTag : styles.normalTag
                      }`}
                    >
                      <Text className={styles.noticeTagText}>
                        {notice.type === 'urgent' ? '紧急' : '通知'}
                      </Text>
                    </View>
                  </View>
                  <Text className={styles.noticeDesc} numberOfLines={2}>
                    {notice.content}
                  </Text>
                  <Text className={styles.noticeTime}>{notice.createTime}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
        <View style={{ height: '40rpx' }}></View>
      </ScrollView>
    </View>
  );
};

export default NoticePage;
