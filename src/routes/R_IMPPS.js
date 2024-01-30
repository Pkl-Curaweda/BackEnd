const { Router } = require("express");

const roomMaid = require('../controllers/House Keeping/IMPPS/C_RoomMaid')
const supervisor = require('../controllers/House Keeping/IMPPS/C_Supervisor')
const R_IMPPS = Router()

//ROOM MAID
R_IMPPS.get('/roomboy', roomMaid.getAll)
R_IMPPS.get('/roomboy/:id', roomMaid.get)
R_IMPPS.get('/roomboy/:id', roomMaid.get)
R_IMPPS.post('/roomboy/:id/:taskId/:action', roomMaid.post)

//SUPERVISOR
R_IMPPS.get('/spv', supervisor.get)
R_IMPPS.post('/spv/:id/:taskId/:action', roomMaid.post)

module.exports = R_IMPPS