/// <reference path="../../node_modules/miniprogram-api-typings/index.d.ts" />
import { Marker } from '../../utils/marker';

interface IPageData {
  marker: Marker;
  description: string;
  imageUrl: string;
}

Page<IPageData, WechatMiniprogram.Page.CustomOption>({
  data: {
    marker: {
      id: 0,
      latitude: 0,
      longitude: 0,
      title: ''
    } as Marker,
    description: '',
    imageUrl: ''
  },

  onLoad(options: { id: string }) {
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2] as any;
    const marker = prevPage.data.markers.find(
      (m: Marker) => m.id === parseInt(options.id)
    );

    if (marker) {
      this.setData({
        marker,
        description: marker.description || '',
        imageUrl: marker.imageUrl || ''
      });
    }
  },

  onDescriptionChange(e: { detail: { value: string } }) {
    this.setData({
      description: e.detail.value
    });
  },

  chooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          imageUrl: res.tempFiles[0].tempFilePath
        });
      }
    });
  },

  previewImage() {
    if (this.data.imageUrl) {
      wx.previewImage({
        urls: [this.data.imageUrl]
      });
    }
  },

  async saveMarker() {
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2] as any;
    const markers = prevPage.data.markers;
    const index = markers.findIndex((m: Marker) => m.id === this.data.marker.id);

    if (index > -1) {
      const updatedMarker = {
        ...this.data.marker,
        description: this.data.description,
        imageUrl: this.data.imageUrl,
        callout: {
          ...this.data.marker.callout,
          content: this.data.marker.title
        }
      };

      markers[index] = updatedMarker;
      prevPage.setData({ 
        markers,
        selectedMarker: updatedMarker
      });
      
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });
      
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  deleteMarker() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个标记点吗？',
      success: (res) => {
        if (res.confirm) {
          const pages = getCurrentPages();
          const prevPage = pages[pages.length - 2] as any;
          const markers = prevPage.data.markers.filter(
            (m: Marker) => m.id !== this.data.marker.id
          );
          prevPage.setData({
            markers,
            selectedMarker: null
          });
          wx.navigateBack();
        }
      }
    });
  }
});