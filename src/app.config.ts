export default defineAppConfig({
  pages: [
    'pages/patrol/index',
    'pages/tasks/index',
    'pages/report/index',
    'pages/contacts/index',
    'pages/stats/index',
    'pages/supplies/index',
    'pages/offline/index',
    'pages/task-detail/index',
    'pages/report-detail/index',
    'pages/notice/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#2e7d32',
    navigationBarTitleText: '封山巡护',
    navigationBarTextStyle: 'white',
    backgroundColor: '#f5f7f5',
  },
  tabBar: {
    color: '#86909c',
    selectedColor: '#2e7d32',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/patrol/index',
        text: '巡护',
      },
      {
        pagePath: 'pages/tasks/index',
        text: '任务',
      },
      {
        pagePath: 'pages/report/index',
        text: '上报',
      },
      {
        pagePath: 'pages/contacts/index',
        text: '联络',
      },
      {
        pagePath: 'pages/stats/index',
        text: '统计',
      },
    ],
  },
});
