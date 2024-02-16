const { Router } = require('express');
const { auth } = require('../middlewares/auth');

const SARoom = require('../controllers/Super Admin/C_SARoom')
const R_SA = Router()
R_SA.use(auth(['Super Admin']))

R_SA.get('/room', SARoom.get)

module.exports = R_Notif