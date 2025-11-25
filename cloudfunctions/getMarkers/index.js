const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const _ = db.command

// 返回：用户自己的标记 + 属于用户参与的共享地图中的标记
exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()

  try {
    // 查找用户参与的 maps
    const mapsRes = await db.collection('maps').where({ members: _.in([OPENID]) }).get()
    const mapIds = (mapsRes && mapsRes.data) ? mapsRes.data.map(m => m._id) : []

    // 先获取个人标记
    const personalRes = await db.collection('markers').where({ _openid: OPENID }).get()
    const personal = (personalRes && personalRes.data) ? personalRes.data : []

    let shared = []
    if (mapIds.length) {
      const sharedRes = await db.collection('markers').where({ mapId: _.in(mapIds) }).get()
      shared = (sharedRes && sharedRes.data) ? sharedRes.data : []
    }

    // 合并并返回
    const all = personal.concat(shared)
    return {
      success: true,
      data: all
    }
  } catch (err) {
    console.error('getMarkers failed', { err: err && err.message ? err.message : err, event })
    const errMsg = err && err.message ? err.message : String(err)
    const errCode = err && err.code ? err.code : undefined
    return {
      success: false,
      error: errMsg,
      code: errCode
    }
  }
}