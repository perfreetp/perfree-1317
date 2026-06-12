import { useEffect } from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
import './app.scss';

function App(props: { children: React.ReactNode }) {
  useEffect(() => {}, []);

  useDidShow(() => {});

  useDidHide(() => {});

  return props.children;
}

export default App;
