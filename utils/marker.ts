export interface Marker {
  _id?: string;
  id: number;
  latitude: number;
  longitude: number;
  title: string;
  description?: string;
  imageUrl?: string;
  _openid?: string;
  createTime?: Date;
  updateTime?: Date;
  iconPath?: string;
  width?: number;
  height?: number;
  callout?: {
    content: string;
    color?: string;
    fontSize?: number;
    borderRadius?: number;
    bgColor?: string;
    padding?: number;
    display: 'ALWAYS' | 'BYCLICK';
  };
}

export const getMarkers = async (): Promise<Marker[]> => {
  try {
    const resp: any = await wx.cloud.callFunction({
      name: 'getMarkers'
    });
    const result = resp && resp.result ? resp.result : undefined;
    const data = result && result.data ? result.data : [];
    // 缓存到本地以备离线或云功能不可用时回退
    try {
      wx.setStorageSync('markers', data);
    } catch (e) {
      console.warn('保存 markers 到本地失败', e);
    }
    return data;
  } catch (error) {
    console.error('获取标记点失败:', error);
    // 云调用失败时尝试读取本地缓存
    try {
      const cached = wx.getStorageSync('markers');
      if (cached && Array.isArray(cached)) {
        console.warn('使用本地缓存的 markers 回退');
        return cached as Marker[];
      }
    } catch (e) {
      console.warn('读取本地 markers 缓存失败', e);
    }
    return [];
  }
};

export const updateMarker = async (marker: Marker): Promise<boolean> => {
  try {
    const resp: any = await wx.cloud.callFunction({
      name: 'updateMarker',
      data: { marker }
    });
    const result = resp && resp.result ? resp.result : undefined;
    // 成功时尝试更新本地缓存
    if (result && result.success) {
      try {
        const cached = wx.getStorageSync('markers') || [];
        const arr: Marker[] = Array.isArray(cached) ? cached : [];
        const idx = arr.findIndex(m => m.id === marker.id || m._id === marker._id);
        if (idx >= 0) {
          arr[idx] = marker;
        } else {
          arr.push(marker);
        }
        wx.setStorageSync('markers', arr);
      } catch (e) {
        console.warn('更新本地 markers 缓存失败', e);
      }
    }
  return result && result.success ? result.success : false;
  } catch (error) {
    console.error('更新标记点失败:', error);
    // 云调用失败时回退到本地缓存（离线模式）
    try {
      const cached = wx.getStorageSync('markers') || [];
      const arr: Marker[] = Array.isArray(cached) ? cached : [];
      const idx = arr.findIndex(m => m.id === marker.id || m._id === marker._id);
      if (idx >= 0) {
        arr[idx] = marker;
      } else {
        arr.push(marker);
      }
      wx.setStorageSync('markers', arr);
      console.warn('云更新失败，已保存到本地缓存');
      return true;
    } catch (e) {
      console.error('本地保存标记点失败:', e);
      return false;
    }
  }
};