import React from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { contactList, dutyRoomPhone } from '@/data/contacts';
import classnames from 'classnames';

const ContactsPage: React.FC = () => {
  const onlineContacts = contactList.filter((c) => c.online);

  const handleCallDutyRoom = () => {
    console.log('[Contacts] 呼叫值班室');
    Taro.makePhoneCall({
      phoneNumber: dutyRoomPhone,
      fail: (err) => {
        console.error('[Contacts] 拨打电话失败', err);
      },
    });
  };

  const handleCallContact = (phone: string, name: string) => {
    console.log('[Contacts] 呼叫', name, phone);
    Taro.makePhoneCall({
      phoneNumber: phone.replace(/\*/g, '0'),
      fail: (err) => {
        console.error('[Contacts] 拨打电话失败', err);
        Taro.showToast({ title: '拨号失败', icon: 'none' });
      },
    });
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.emergencyCall} onClick={handleCallDutyRoom}>
        <View className={styles.callIcon}>
          <Text className={styles.callIconText}>📞</Text>
        </View>
        <View className={styles.callInfo}>
          <Text className={styles.callTitle}>一键呼叫值班室</Text>
          <Text className={styles.callDesc}>24小时值班 · 紧急情况请拨打</Text>
        </View>
        <Text className={styles.callArrow}>›</Text>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text>同伴位置</Text>
          <Text className={styles.onlineCount}>
            在线 <Text className={styles.onlineNum}>{onlineContacts.length}</Text> 人
          </Text>
        </View>
        <View className={styles.mapCard}>
          <View className={styles.mapHeader}>
            <Text className={styles.mapTitle}>巡护区域人员分布</Text>
          </View>
          <View className={styles.mapArea}>
            <View
              className={`${styles.mapMarker} ${styles.me}`}
              style={{ top: '45%', left: '40%' }}
            >
              <View className={styles.markerLabel}>我</View>
            </View>
            <View
              className={`${styles.mapMarker} ${styles.online}`}
              style={{ top: '30%', left: '55%' }}
            >
              <View className={styles.markerLabel}>张卫国</View>
            </View>
            <View
              className={`${styles.mapMarker} ${styles.online}`}
              style={{ top: '60%', left: '25%' }}
            >
              <View className={styles.markerLabel}>李志强</View>
            </View>
            <View
              className={`${styles.mapMarker} ${styles.online}`}
              style={{ top: '25%', left: '70%' }}
            >
              <View className={styles.markerLabel}>赵美玲</View>
            </View>
            <View
              className={`${styles.mapMarker} ${styles.offline}`}
              style={{ top: '70%', left: '75%' }}
            >
              <View className={styles.markerLabel}>王建国</View>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>通讯录</Text>
        <View className={styles.contactList}>
          {contactList.map((contact) => (
            <View key={contact.id} className={styles.contactItem}>
              <View className={styles.avatar}>
                <Text>👤</Text>
                <View
                  className={classnames(
                    styles.onlineDot,
                    !contact.online && styles.offline
                  )}
                ></View>
              </View>
              <View className={styles.contactInfo}>
                <Text className={styles.contactName}>{contact.name}</Text>
                <Text className={styles.contactRole}>{contact.role}</Text>
              </View>
              <View className={styles.contactRight}>
                {contact.lastUpdate && (
                  <Text className={styles.locationHint}>{contact.lastUpdate}</Text>
                )}
                <View
                  className={styles.phoneBtn}
                  onClick={() => handleCallContact(contact.phone, contact.name)}
                >
                  <Text className={styles.phoneIcon}>📞</Text>
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

export default ContactsPage;
