const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { marker } = event
  
  try {
    if (marker._id) {
      // Update existing marker
      await db.collection('markers').doc(marker._id).update({
        data: {
          ...marker,
          _openid: OPENID,
          updateTime: db.serverDate()
        }
      })
    } else {
      // Add new marker
      await db.collection('markers').add({
        data: {
          ...marker,
          _openid: OPENID,
          createTime: db.serverDate(),
          updateTime: db.serverDate()
        }
      })
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