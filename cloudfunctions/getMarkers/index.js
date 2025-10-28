const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  
  try {
    const result = await db.collection('markers')
      .where({
        _openid: OPENID
      })
      .get()
    
    return {
      success: true,
      data: result.data
    }
  } catch (err) {
    return {
      success: false,
      error: err
    }
  }
}