const { error } = require("../../utils/response")
const notification = require('../../models/Authorization/M_Notitication')
const getAllNotification = async () => {
    try{
        const data = await notification.get()
        return data
    }catch(err){
        return error(res, err.message)
    }
}
module.exports = { getAllNotification }