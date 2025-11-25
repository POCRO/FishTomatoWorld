const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  try {
    return { success: true, openid: OPENID }
  } catch (err) {
    console.error('whoAmI failed', { err: err && err.message ? err.message : err, event })
    const errMsg = err && err.message ? err.message : String(err)
    return { success: false, error: errMsg }
  }
}
