/// <reference path="../../node_modules/miniprogram-api-typings/index.d.ts" />
import { Marker } from '../../utils/marker';

interface IPageData {
  longitude: number;
  latitude: number;
  scale: number;
  markers: Marker[];
  selectedMarker: Marker | null;
}

interface MapEvent extends WechatMiniprogram.BaseEvent {
  detail: {
    latitude: number;
    longitude: number;
  };
}

interface LocationResponse {
  latitude: number;
  longitude: number;
}

interface ModalResponse {
  confirm: boolean;
  content?: string;
}

Page<IPageData, WechatMiniprogram.Page.CustomOption>({
  data: {
    longitude: 116.397390,
    latitude: 39.908860,
    scale: 16,
    markers: [],
    selectedMarker: null
  },

  onLoad() {
    this.getCurrentLocation();
  },

  getCurrentLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res: LocationResponse) => {
        this.setData({
          latitude: res.latitude,
          longitude: res.longitude
        });
      },
      fail: () => {
        wx.showToast({
          title: '获取位置失败',
          icon: 'error'
        });
      }
    });
  },

  moveToLocation() {
    this.getCurrentLocation();
  },

  onMapTap(e: MapEvent) {
    const { latitude, longitude } = e.detail;
    wx.showModal({
      title: '添加标记',
      editable: true,
      placeholderText: '输入地点名称',
      success: (res: ModalResponse) => {
        if (res.confirm && res.content) {
          const markerId = Date.now();
          const newMarker: Marker = {
            id: markerId,
            latitude,
            longitude,
            title: res.content,
            iconPath: '/images/marker.png',
            width: 30,
            height: 30,
            callout: {
              content: res.content,
              color: '#000000',
              fontSize: 14,
              borderRadius: 4,
              padding: 8,
              display: 'ALWAYS',
              bgColor: '#ffffff'
            }
          };

          const markers = [...this.data.markers, newMarker];
          this.setData({
            markers,
            selectedMarker: newMarker
          });
        }
      }
    });
  },

  onMarkerTap(e: { markerId: number }) {
    const marker = this.data.markers.find(m => m.id === e.markerId);
    if (marker) {
      this.setData({
        selectedMarker: marker
      });
    }
  },

  editMarker() {
    if (this.data.selectedMarker) {
      wx.navigateTo({
        url: `/pages/detail/detail?id=${this.data.selectedMarker.id}`
      });
    }
  },

  deleteMarker() {
    if (!this.data.selectedMarker) return;

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个标记点吗？',
      success: (res) => {
        if (res.confirm) {
          const markers = this.data.markers.filter(
            m => m.id !== this.data.selectedMarker!.id
          );
          this.setData({
            markers,
            selectedMarker: null
          });
        }
      }
    });
  }
});