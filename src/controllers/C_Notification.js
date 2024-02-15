const { error, success } = require("../utils/response")
const notification = require('../models/Authorization/M_Notitication')
const { ThrowError } = require("../utils/helper")

const getAllNotification = async (req, res) => {
    try {
        const data = await notification.get(req.user)
        return success(res, 'Showing Notification', data)
    } catch (err) {
        return error(res, err.message)
    }
}

const getTotalUnread = async (req, res) => {
    try {
        const value = await notification.getUnreadTotal(req.user.lastCheckNotif)
        return success(res, 'Value shown', {value})
    } catch (err) {
        return error(res, err.message)
    }
}

const readMessage = async (req, res) => {
    try{
        const updateUser = await notification.changeLatestCheckNotif(req.user.id)
        return success(res, 'Message readed', updateUser)
    }catch(err){
        return error(res, err.message)
    }
}
module.exports = { getAllNotification, getTotalUnread, readMessage }