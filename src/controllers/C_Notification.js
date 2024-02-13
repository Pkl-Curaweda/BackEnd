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

const getUnreadMessage = async (req, res) => {
    try {
        const data = await notification.getUnreadTotal(req.user.lastCheckNotif)
        return success(res, 'Value shown', data)
    } catch (err) {
        return error(res, err.message)
    }
}
module.exports = { getAllNotification, getUnreadMessage }