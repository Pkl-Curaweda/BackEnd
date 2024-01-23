const { error, success } = require("../../utils/response")
const notification = require('../../models/Authorization/M_Notitication')
const { ThrowError } = require("../../utils/helper")
const getAllNotification = async (req, res) => {
    try{
        const data = await notification.get()
        return success(res, 'Operation Success', data)
    }catch(err){
        return error(res, err.message)
    }
}
module.exports = { getAllNotification }