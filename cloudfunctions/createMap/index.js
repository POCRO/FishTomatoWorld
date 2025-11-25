const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { name, description } = event

  if (!name) {
    return { success: false, error: 'name_required' }
  }

  try {
    // 简单输入校验与清理，避免将非法/只读字段传入数据库
    const sanitize = (obj) => {
      const out = {}
      Object.keys(obj || {}).forEach(k => {
        if (k.startsWith('_')) return
        const v = obj[k]
        if (typeof v === 'undefined') return
        out[k] = v
      })
      return out
    }

    const safeName = String(name).trim()
    const safeDescription = typeof description === 'string' ? description : String(description || '')

    const data = Object.assign({}, sanitize({ name: safeName, description: safeDescription }), {
      ownerOpenid: OPENID,
      members: [OPENID],
      createdAt: db.serverDate(),
      updatedAt: db.serverDate()
    })

    const res = await db.collection('maps').add({ data })
    return { success: true, id: res._id }
  } catch (err) {
    // 打印更详细的日志，便于在控制台查看具体错误和入参
    console.error('createMap failed', { err: err && err.message ? err.message : err, event })
    const errMsg = err && err.message ? err.message : String(err)
    const errCode = err && err.code ? err.code : undefined
    return { success: false, error: errMsg, code: errCode }
  }
}
