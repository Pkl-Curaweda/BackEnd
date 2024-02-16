const { Router } = require('express');
const { auth } = require('../middlewares/auth');

const SARoom = require('../controllers/Super Admin/C_SARoom')
const R_SA = Router()
R_SA.use(auth(['Super Admin']))

R_SA.get('/room', SARoom.get)
R_SA.post('/room', SARoom.postAddEdit)
R_SA.delete('/room/:item/:id', SARoom.deleteData)

module.exports = R_SA