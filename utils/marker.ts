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
    const { result } = await wx.cloud.callFunction({
      name: 'getMarkers'
    });
    return result.data || [];
  } catch (error) {
    console.error('获取标记点失败:', error);
    return [];
  }
};

export const updateMarker = async (marker: Marker): Promise<boolean> => {
  try {
    const { result } = await wx.cloud.callFunction({
      name: 'updateMarker',
      data: { marker }
    });
    return result.success;
  } catch (error) {
    console.error('更新标记点失败:', error);
    return false;
  }
};