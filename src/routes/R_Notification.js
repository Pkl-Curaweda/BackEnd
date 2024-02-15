const { Router } = require('express');
const { auth } = require('../middlewares/auth');

const notification = require('../controllers/C_Notification')
const R_Notif = Router()
R_Notif.use(auth())

R_Notif.get('/', notification.getAllNotification)
R_Notif.get('/value', notification.getTotalUnread)
R_Notif.post('/read', notification.readMessage)

module.exports = R_Notif