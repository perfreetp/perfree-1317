import { Notice } from '@/types';

export const noticeList: Notice[] = [
  {
    id: 'n001',
    title: '【紧急】南线C段发生山体滑坡',
    content: '各位护林员请注意：南线C段枫树林附近发生小型山体滑坡，道路暂时封闭，请绕行。已安排人员前往处理，请相关人员注意安全。',
    type: 'urgent',
    createTime: '2024-01-15 08:15',
    read: false,
  },
  {
    id: 'n002',
    title: '本周巡护任务安排通知',
    content: '本周巡护任务已发布，请各位护林员登录系统领取任务。本周重点加强森林防火巡查，确保林区安全。',
    type: 'normal',
    createTime: '2024-01-15 07:30',
    read: true,
  },
  {
    id: 'n003',
    title: '气象预警：今日高温天气',
    content: '今日最高气温35℃，森林火险等级较高，请各位护林员加强巡查，注意防暑降温，发现火情及时上报。',
    type: 'urgent',
    createTime: '2024-01-14 18:00',
    read: true,
  },
  {
    id: 'n004',
    title: '物资领取通知',
    content: '新一批巡护物资已到位，请各护林组组长前往物资站领取。领取时间：1月15日-1月17日。',
    type: 'normal',
    createTime: '2024-01-14 09:00',
    read: true,
  },
  {
    id: 'n005',
    title: '培训通知',
    content: '定于1月20日进行护林员业务培训，请各位护林员准时参加。培训内容：应急处理、防火知识等。',
    type: 'normal',
    createTime: '2024-01-13 14:30',
    read: true,
  },
];
