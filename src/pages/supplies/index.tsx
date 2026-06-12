import React from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';

const mySupplies = [
  { icon: '🥤', name: '水壶', qty: 1 },
  { icon: '🔦', name: '手电', qty: 1 },
  { icon: '🩹', name: '急救包', qty: 1 },
  { icon: '🥪', name: '干粮', qty: 2 },
  { icon: '🧭', name: '指南针', qty: 1 },
  { icon: '📻', name: '对讲机', qty: 1 },
  { icon: '🧤', name: '手套', qty: 1 },
  { icon: '🧥', name: '雨衣', qty: 1 },
];

const supplyPoints = [
  {
    id: 's1',
    name: '东门物资站',
    address: '东门入口左侧50米',
    distance: '1.2公里',
    items: ['饮用水', '急救药品', '手电筒', '雨衣', '对讲机'],
    status: '开放',
  },
  {
    id: 's2',
    name: '中心管理站',
    address: '景区中心管理大楼一层',
    distance: '2.5公里',
    items: ['全套巡护装备', '应急物资', '通讯设备', '食品补给'],
    status: '开放',
  },
  {
    id: 's3',
    name: '西门物资点',
    address: '西门检查站旁',
    distance: '3.8公里',
    items: ['饮用水', '急救药品', '手电筒'],
    status: '开放',
  },
  {
    id: 's4',
    name: '北线补给点',
    address: '北线观景台下方',
    distance: '4.5公里',
    items: ['饮用水', '干粮', '急救包'],
    status: '维护中',
  },
];

const SuppliesPage: React.FC = () => {
  const handleGetSupplies = (pointName: string) => {
    console.log('[Supplies] 领取物资', pointName);
    Taro.showModal({
      title: '领取确认',
      content: `确定要在${pointName}领取物资吗？`,
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '领取成功', icon: 'success' });
        }
      },
    });
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>我的物资</Text>
        <View className={styles.mySupplies}>
          <View className={styles.suppliesHeader}>
            <Text className={styles.suppliesTitle}>个人装备清单</Text>
            <View className={styles.suppliesStatus}>
              <Text>装备齐全</Text>
            </View>
          </View>
          <View className={styles.supplyGrid}>
            {mySupplies.map((item, index) => (
              <View key={index} className={styles.supplyItem}>
                <Text className={styles.supplyIcon}>{item.icon}</Text>
                <Text className={styles.supplyName}>{item.name}</Text>
                <Text className={styles.supplyQty}>×{item.qty}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>附近物资点</Text>
        {supplyPoints.map((point) => (
          <View key={point.id} className={styles.pointCard}>
            <View className={styles.pointHeader}>
              <Text className={styles.pointName}>{point.name}</Text>
              <Text className={styles.pointDistance}>{point.distance}</Text>
            </View>
            <View className={styles.pointAddress}>
              <Text className={styles.pointAddressIcon}>📍</Text>
              <Text>{point.address}</Text>
            </View>
            <View className={styles.pointItems}>
              {point.items.map((item, idx) => (
                <View key={idx} className={styles.itemTag}>
                  <Text>{item}</Text>
                </View>
              ))}
            </View>
            <View className={styles.pointFooter}>
              <View className={styles.pointStatus}>
                <View
                  className={styles.pointStatusDot}
                  style={{
                    background: point.status === '开放' ? '#00b42a' : '#86909c',
                  }}
                ></View>
                <Text
                  style={{
                    color: point.status === '开放' ? '#00b42a' : '#86909c',
                  }}
                >
                  {point.status}
                </Text>
              </View>
              <View
                className={styles.getBtn}
                style={{
                  opacity: point.status === '开放' ? 1 : 0.5,
                }}
                onClick={() =>
                  point.status === '开放' && handleGetSupplies(point.name)
                }
              >
                <Text>领取物资</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View style={{ height: '40rpx' }}></View>
    </ScrollView>
  );
};

export default SuppliesPage;
