const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { mapId, inviteeOpenid } = event

  if (!mapId || !inviteeOpenid) {
    return { success: false, error: 'mapId_and_invitee_required' }
  }

  try {
    const mapDoc = await db.collection('maps').doc(mapId).get()
    const map = mapDoc && mapDoc.data ? mapDoc.data : null
    if (!map) return { success: false, error: 'map_not_found' }

    // 只有 owner 可以邀请
    if (map.ownerOpenid !== OPENID) return { success: false, error: 'no_permission' }

    // 创建邀请记录
    const inv = {
      mapId,
      inviterOpenid: OPENID,
      inviteeOpenid,
      status: 'pending',
      createdAt: db.serverDate()
    }
    const res = await db.collection('invitations').add({ data: inv })
    return { success: true, id: res._id }
  } catch (err) {
    console.error('inviteMember failed', { err: err && err.message ? err.message : err, event })
    const errMsg = err && err.message ? err.message : String(err)
    const errCode = err && err.code ? err.code : undefined
    return { success: false, error: errMsg, code: errCode }
  }
}
