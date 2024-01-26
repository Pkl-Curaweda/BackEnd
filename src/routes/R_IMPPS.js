const { Router } = require("express");

const roomMaid = require('../controllers/House Keeping/IMPPS/C_RoomMaid')
const R_IMPPS = Router()

R_IMPPS.get('/roomboy', roomMaid.getAll)
R_IMPPS.get('/roomboy/:id', roomMaid.get)

module.exports = R_IMPPS