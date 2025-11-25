const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { inviteId } = event

  if (!inviteId) return { success: false, error: 'inviteId_required' }

  try {
    const invDoc = await db.collection('invitations').doc(inviteId).get()
    const inv = invDoc && invDoc.data ? invDoc.data : null
    if (!inv) return { success: false, error: 'invitation_not_found' }

    if (inv.inviteeOpenid !== OPENID) return { success: false, error: 'no_permission' }

    if (inv.status === 'accepted') return { success: false, error: 'already_accepted' }

    // 更新邀请为已接受
    await db.collection('invitations').doc(inviteId).update({ data: { status: 'accepted', respondedAt: db.serverDate() } })

    // 将用户加入 map.members
    const mapId = inv.mapId
    const mapDoc = await db.collection('maps').doc(mapId).get()
    const map = mapDoc && mapDoc.data ? mapDoc.data : null
    if (!map) return { success: false, error: 'map_not_found' }

    const members = map.members || []
    if (members.indexOf(OPENID) === -1) {
      members.push(OPENID)
      await db.collection('maps').doc(mapId).update({ data: { members, updatedAt: db.serverDate() } })
    }

    return { success: true }
  } catch (err) {
    console.error('acceptInvite failed', { err: err && err.message ? err.message : err, event })
    const errMsg = err && err.message ? err.message : String(err)
    const errCode = err && err.code ? err.code : undefined
    return { success: false, error: errMsg, code: errCode }
  }
}
