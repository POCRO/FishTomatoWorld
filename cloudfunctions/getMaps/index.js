const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  try {
    // 返回用户是 owner 或 member 的 maps
    const res = await db.collection('maps').where({ members: _.in([OPENID]) }).get()
    const myMaps = (res && res.data) ? res.data : []
    return { success: true, data: myMaps }
  } catch (err) {
    console.error('getMaps failed', { err: err && err.message ? err.message : err, event })
    const errMsg = err && err.message ? err.message : String(err)
    const errCode = err && err.code ? err.code : undefined
    return { success: false, error: errMsg, code: errCode }
  }
}
