const { Router } = require('express');
const { auth } = require('../middlewares/auth');

const notification = require('../controllers/C_Notification')
const R_Notif = Router()
R_Notif.use(auth())

R_Notif.get('/', notification.getAllNotification)
R_Notif.get('/value', notification.getUnreadMessage)

module.exports = R_Notif