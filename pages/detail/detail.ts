/// <reference path="../../node_modules/miniprogram-api-typings/index.d.ts" />
import { Marker, updateMarker } from '../../utils/marker';

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

    let resolvedMarker = marker as Marker | undefined;
    // 如果页面传递的列表中没有找到，尝试使用本地缓存回退
    if (!resolvedMarker) {
      try {
        const cached = wx.getStorageSync('markers') || [];
        resolvedMarker = (cached as Marker[]).find(m => String(m.id) === String(options.id) || (m._id && m._id === options.id));
        if (resolvedMarker) {
          console.warn('detail: 使用本地缓存回退获取 marker', resolvedMarker);
        }
      } catch (e) {
        console.warn('detail: 读取本地 markers 缓存失败', e);
      }
    }

    if (resolvedMarker) {
      this.setData({
        marker: resolvedMarker,
        description: resolvedMarker.description || '',
        imageUrl: resolvedMarker.imageUrl || ''
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

  // try to upload selected image to cloud storage if available; fallback to tempFilePath
  async uploadImageIfNeeded(tempPath: string): Promise<string> {
    if (!tempPath) return '';
    // if cloud is available, try upload
    try {
      if (wx.cloud && wx.cloud.uploadFile) {
        const cloudPath = `markers/${Date.now()}-${Math.floor(Math.random() * 1e6)}.jpg`;
        const res: any = await wx.cloud.uploadFile({
          cloudPath,
          filePath: tempPath
        });
        if (res && res.fileID) {
          return res.fileID;
        }
      }
    } catch (err) {
      console.warn('上传图片到云失败，使用本地临时路径回退', err);
    }
    // 回退到 tempPath（本地临时文件），注意此路径在不同页面间可能短期有效
    return tempPath;
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
  // 先处理图片并构建 updatedMarker，以便在更新或追加时复用
  let finalImageUrl = this.data.imageUrl || '';
  try {
    if (finalImageUrl && (finalImageUrl.startsWith('wxfile://') || finalImageUrl.startsWith('http://') || finalImageUrl.startsWith('https://') || finalImageUrl.indexOf('/') >= 0)) {
      finalImageUrl = await this.uploadImageIfNeeded(finalImageUrl);
    }
  } catch (err) {
    console.warn('处理图片时出错，继续使用原始路径', err);
  }

  const updatedMarker: Marker = {
    ...this.data.marker,
    description: this.data.description,
    imageUrl: finalImageUrl,
    callout: Object.assign({}, this.data.marker.callout || {}, {
      content: this.data.marker.title,
      display: (this.data.marker.callout && this.data.marker.callout.display) ? this.data.marker.callout.display : 'ALWAYS'
    })
  };

  const index = markers.findIndex((m: Marker) => String(m.id) === String(this.data.marker.id) || (m._id && this.data.marker._id && m._id === this.data.marker._id));

  if (index > -1) {
    // 更新上一页的数据并尝试持久化到云/本地缓存
    markers[index] = updatedMarker;
    prevPage.setData({
      markers,
      selectedMarker: updatedMarker
    });

    // 尝试调用 utils.updateMarker（会在云不可用时回退到本地缓存）
    try {
      const ok = await updateMarker(updatedMarker);
      if (!ok) {
        wx.showToast({ title: '已保存到本地（离线）', icon: 'none' });
      } else {
        wx.showToast({ title: '保存成功', icon: 'success' });
      }
    } catch (err) {
      console.warn('更新标记点失败，已写入本地缓存', err);
      wx.showToast({ title: '已保存到本地（离线）', icon: 'none' });
    }

    setTimeout(() => {
      wx.navigateBack();
    }, 800);
  } else {
    // 没找到匹配项：可能 id 类型不同或是新标记，追加到列表
    console.warn('detail.saveMarker: 未在上一页找到 marker，追加到 markers 列表', this.data.marker.id);
    markers.push(updatedMarker);
    prevPage.setData({ markers, selectedMarker: updatedMarker });
    try {
      await updateMarker(updatedMarker);
      wx.showToast({ title: '保存成功', icon: 'success' });
    } catch (e) {
      console.warn('detail.saveMarker: 云保存失败，已保存到本地缓存', e);
      wx.showToast({ title: '已保存到本地（离线）', icon: 'none' });
    }
    setTimeout(() => wx.navigateBack(), 800);
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