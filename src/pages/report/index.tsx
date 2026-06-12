import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Textarea, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useReportStore } from '@/stores/useReportStore';

type ReportType = 'poaching' | 'fire' | 'roadblock' | 'other';

const reportTypes = [
  { key: 'poaching' as ReportType, icon: '🦌', name: '偷采偷猎', desc: '非法捕猎、采摘' },
  { key: 'fire' as ReportType, icon: '🔥', name: '火源隐患', desc: '明火、烟头等' },
  { key: 'roadblock' as ReportType, icon: '🚧', name: '临时封路', desc: '道路阻断、滑坡' },
  { key: 'other' as ReportType, icon: '⚠️', name: '其他隐患', desc: '其他安全问题' },
];

const ReportPage: React.FC = () => {
  const { initReports, addReport, reports } = useReportStore();
  const [type, setType] = useState<ReportType>('fire');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [location, setLocation] = useState('正在获取位置...');
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [hasVoice, setHasVoice] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [lat, setLat] = useState(30.6630);
  const [lng, setLng] = useState(104.0670);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initReports();
  }, [initReports]);

  useDidShow(() => {
    initReports();
  });

  useEffect(() => {
    getLocation();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const getLocation = () => {
    setIsLocating(true);
    setLocation('正在获取位置...');
    console.log('[Report] 获取位置中...');

    Taro.getLocation({
      type: 'gcj02',
      success: (res) => {
        console.log('[Report] 位置获取成功', res);
        setLat(res.latitude);
        setLng(res.longitude);
        setLocation(`东经 ${res.longitude.toFixed(4)}° 北纬 ${res.latitude.toFixed(4)}°`);
      },
      fail: (err) => {
        console.error('[Report] 位置获取失败', err);
        setLocation('位置获取失败，请手动输入');
        Taro.showToast({ title: '位置获取失败', icon: 'none' });
      },
      complete: () => {
        setIsLocating(false);
      },
    });
  };

  const handleChooseImage = () => {
    console.log('[Report] 选择图片');
    Taro.chooseImage({
      count: 9 - images.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newImages = [...images, ...res.tempFilePaths];
        setImages(newImages);
        console.log('[Report] 图片选择成功', newImages.length);
      },
      fail: (err) => {
        console.error('[Report] 图片选择失败', err);
      },
    });
  };

  const handleDeleteImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleRecordToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordTime(0);
    setHasVoice(false);
    console.log('[Report] 开始录音');

    timerRef.current = setInterval(() => {
      setRecordTime((prev) => {
        if (prev >= 60) {
          stopRecording();
          return 60;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
    setHasVoice(true);
    console.log('[Report] 停止录音，时长', recordTime, '秒');
  };

  const handleDeleteVoice = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setHasVoice(false);
    setRecordTime(0);
    setIsRecording(false);
    console.log('[Report] 删除语音');
  };

  const formatVoiceTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    if (!description.trim()) {
      Taro.showToast({ title: '请填写隐患描述', icon: 'none' });
      return;
    }

    console.log('[Report] 提交上报', { type, description, images, location });

    Taro.showModal({
      title: '提交确认',
      content: '确认提交该隐患上报？',
      success: (res) => {
        if (res.confirm) {
          Taro.showLoading({ title: '提交中...' });

          setTimeout(() => {
            const typeNameMap: Record<string, string> = {
              poaching: '偷采偷猎',
              fire: '火源隐患',
              roadblock: '临时封路',
              other: '其他隐患',
            };

            addReport({
              type,
              typeName: typeNameMap[type],
              description,
              images,
              voiceNote: hasVoice ? `${recordTime}秒语音描述` : undefined,
              location,
              lat,
              lng,
            });

            Taro.hideLoading();
            Taro.showToast({ title: '上报成功', icon: 'success' });
            setDescription('');
            setImages([]);
            setHasVoice(false);
            setRecordTime(0);
            console.log('[Report] 上报提交成功');
          }, 1500);
        }
      },
    });
  };

  const viewHistory = () => {
    Taro.showActionSheet({
      itemList: ['查看我的上报', '按类型查看', '查看全部上报'],
      success: (res) => {
        console.log('[Report] 查看历史', res.tapIndex);
        Taro.showToast({ title: '历史记录功能开发中', icon: 'none' });
      },
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionTitleIcon}>📋</Text>
          隐患类型
        </Text>
        <View className={styles.typeGrid}>
          {reportTypes.map((item) => (
            <View
              key={item.key}
              className={classnames(styles.typeItem, type === item.key && styles.active)}
              onClick={() => setType(item.key)}
            >
              <Text className={styles.typeIcon}>{item.icon}</Text>
              <Text className={styles.typeName}>{item.name}</Text>
              <Text className={styles.typeDesc}>{item.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionTitleIcon}>📝</Text>
          隐患描述
        </Text>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>
            <Text className={styles.required}>*</Text>详细描述
          </Text>
          <Textarea
            className={styles.textarea}
            placeholder="请详细描述发现的隐患情况..."
            value={description}
            onInput={(e) => setDescription(e.detail.value)}
            maxlength={500}
          />
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionTitleIcon}>📷</Text>
          拍照取证
        </Text>
        <View className={styles.imageGrid}>
          {images.map((img, index) => (
            <View key={index} className={styles.imageItem}>
              <Image className={styles.imageImg} src={img} mode="aspectFill" />
              <View
                className={styles.imageDelete}
                onClick={() => handleDeleteImage(index)}
              >
                <Text>×</Text>
              </View>
            </View>
          ))}
          {images.length < 9 && (
            <View className={styles.addImage} onClick={handleChooseImage}>
              <View className={styles.addImageContent}>
                <Text className={styles.addIcon}>+</Text>
                <Text className={styles.addText}>添加图片</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionTitleIcon}>🎤</Text>
          语音备注
        </Text>
        <View className={styles.voiceBox}>
          <View
            className={classnames(styles.recordBtn, isRecording && styles.recording)}
            onClick={handleRecordToggle}
          >
            <Text>{isRecording ? '⏹' : '🎙️'}</Text>
          </View>
          <View className={styles.voiceInfo}>
            {hasVoice ? (
              <>
                <Text className={styles.voiceStatus}>已录制语音</Text>
                <Text className={styles.voiceTime}>时长 {formatVoiceTime(recordTime)}</Text>
              </>
            ) : isRecording ? (
              <>
                <Text className={styles.voiceStatus}>正在录音...</Text>
                <Text className={styles.voiceTime}>{formatVoiceTime(recordTime)} / 01:00</Text>
              </>
            ) : (
              <>
                <Text className={styles.voiceStatus}>点击录制语音</Text>
                <Text className={styles.voiceTime}>最长录制60秒</Text>
              </>
            )}
          </View>
          {hasVoice && (
            <Text className={styles.voiceDelete} onClick={handleDeleteVoice}>删除</Text>
          )}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionTitleIcon}>📍</Text>
          位置信息
        </Text>
        <View className={styles.locationBox}>
          <Text className={styles.locationIcon}>📍</Text>
          <Text className={styles.locationText}>{location}</Text>
          <Text
            className={styles.locationRefresh}
            onClick={getLocation}
          >
            {isLocating ? '定位中...' : '刷新'}
          </Text>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.historyLink} onClick={viewHistory}>
          <Text>历史记录</Text>
        </View>
        <View
          className={classnames(styles.submitBtn, !description.trim() && styles.disabled)}
          onClick={handleSubmit}
        >
          <Text>提交上报</Text>
        </View>
      </View>
    </View>
  );
};

export default ReportPage;
