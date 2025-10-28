/// <reference path="./node_modules/miniprogram-api-typings/index.d.ts" />

App({
  onLaunch() {
    wx.cloud.init({
      env: 'your-env-id', // 需要替换为你的云开发环境ID
      traceUser: true
    });
  }
});