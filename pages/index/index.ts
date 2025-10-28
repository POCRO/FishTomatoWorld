/// <reference path="../../node_modules/miniprogram-api-typings/index.d.ts" />
import { Marker, getMarkers } from '../../utils/marker';

interface IPageData {
  longitude: number;
  latitude: number;
  scale: number;
  markers: Marker[];
  selectedMarker: Marker | null;
  searchQuery: string;
  filteredResults: Marker[];
  myMarkers: Marker[];
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
    selectedMarker: null,
    // 搜索相关
    searchQuery: '',
    filteredResults: [] as Marker[],
    // 我的地点（已保存的标记列表）
    myMarkers: [] as Marker[]
  },

  onLoad() {
    this.getCurrentLocation();
    // 加载已有标记（来自云函数）
    this.loadMarkers();
  },

  async loadMarkers() {
    const markers = await getMarkers();
    // 兼容旧数据结构：确保 callout 等存在
    // 清理可能引用不存在的本地图片路径
    const cleaned = (markers || []).map(m => {
      const copy = { ...m } as Marker;
      if (copy.iconPath) {
        // 如果项目 images 中没有该文件，移除 iconPath 使用默认 marker
        // images 文件夹在本项目中可能为空
        copy.iconPath = undefined;
      }
      return copy;
    });
    this.setData({
      markers: cleaned,
      myMarkers: cleaned
    });
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
          // 同步到我的地点列表
          this.setData({ myMarkers: markers });
        }
      }
    });
  },

  // 搜索输入变化
  onSearchInput(e: WechatMiniprogram.Input) {
    const q = (e.detail.value || '').trim();
    this.setData({ searchQuery: q });
    if (!q) {
      this.setData({ filteredResults: [] });
      return;
    }
    const filtered = (this.data.markers || []).filter(m => m.title && m.title.indexOf(q) !== -1);
    this.setData({ filteredResults: filtered });
  },

  // 搜索确认（回车）处理 - 同 onSearchInput 的过滤逻辑
  onSearchConfirm(e: WechatMiniprogram.Input) {
    this.onSearchInput(e as any);
  },

  // 选择搜索结果，移动地图并选择标记
  onSelectSearchResult(e: any) {
    const id = Number(e.currentTarget.dataset.id);
    const marker = this.data.markers.find(m => m.id === id);
    if (marker) {
      this.setData({
        latitude: marker.latitude,
        longitude: marker.longitude,
        scale: 18,
        selectedMarker: marker,
        // 清空搜索结果
        searchQuery: '',
        filteredResults: []
      });
    }
  },

  // 选择我的地点列表项
  onSelectMyLocation(e: any) {
    const id = Number(e.currentTarget.dataset.id);
    const marker = this.data.myMarkers.find(m => m.id === id);
    if (marker) {
      this.setData({
        latitude: marker.latitude,
        longitude: marker.longitude,
        scale: 18,
        selectedMarker: marker
      });
    }
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