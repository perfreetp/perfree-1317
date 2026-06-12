import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';

interface FunctionEntryProps {
  icon: string;
  title: string;
  desc?: string;
  path?: string;
  onClick?: () => void;
  color?: string;
}

const FunctionEntry: React.FC<FunctionEntryProps> = ({
  icon,
  title,
  desc,
  path,
  onClick,
  color = '#2e7d32',
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (path) {
      Taro.navigateTo({ url: path });
    }
  };

  return (
    <View className={styles.entry} onClick={handleClick}>
      <View className={styles.iconWrap} style={{ background: `${color}15` }}>
        <Text className={styles.icon} style={{ color }}>{icon}</Text>
      </View>
      <View className={styles.info}>
        <Text className={styles.title}>{title}</Text>
        {desc && <Text className={styles.desc}>{desc}</Text>}
      </View>
    </View>
  );
};

export default FunctionEntry;
