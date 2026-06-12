import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface StatusBadgeProps {
  type?: 'success' | 'warning' | 'error' | 'info' | 'primary';
  text: string;
  size?: 'sm' | 'md';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  type = 'info',
  text,
  size = 'md',
}) => {
  return (
    <View
      className={classnames(
        styles.badge,
        styles[type],
        size === 'sm' && styles.sm
      )}
    >
      <Text className={styles.text}>{text}</Text>
    </View>
  );
};

export default StatusBadge;
