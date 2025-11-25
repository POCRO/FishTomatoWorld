const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const _ = db.command

// 更新或新增 marker；如果 marker.mapId 存在，则需要校验调用者是否在对应 map 的 members 中
exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { marker } = event

  // 清理客户端可能传来的只读或非法字段，避免写入数据库时报 InvalidParameter
  const sanitize = (obj) => {
    const out = {}
    Object.keys(obj || {}).forEach(k => {
      // 跳过以 '_' 开头的只读字段（例如 _id, _openid）以及 undefined 值
      if (k.startsWith('_')) return
      const v = obj[k]
      if (typeof v === 'undefined') return
      out[k] = v
    })
    return out
  }

  try {
    // 如果 marker 指向共享地图，检查权限
    if (marker.mapId) {
      // 获取 map
      const mapDoc = await db.collection('maps').doc(marker.mapId).get()
      const map = mapDoc && mapDoc.data ? mapDoc.data : null
      if (!map) {
        return { success: false, error: 'map_not_found' }
      }
      const members = map.members || []
      const owner = map.ownerOpenid
      if (owner !== OPENID && (!Array.isArray(members) || members.indexOf(OPENID) === -1)) {
        return { success: false, error: 'no_permission' }
      }
    }

    if (marker._id) {
      // Update existing marker：只写入允许更新的字段，避免传入 _id/_openid 导致参数无效
      const dataToUpdate = Object.assign({}, sanitize(marker), {
        updateTime: db.serverDate()
      })
      await db.collection('markers').doc(marker._id).update({ data: dataToUpdate })
    } else {
      // Add new marker：同样清理字段，服务器设置创建/更新时间
      const dataToAdd = Object.assign({}, sanitize(marker), {
        createTime: db.serverDate(),
        updateTime: db.serverDate()
      })
      await db.collection('markers').add({ data: dataToAdd })
    }

    return {
      success: true
    }
  } catch (err) {
    return {
      success: false,
      error: err
    }
  }
}