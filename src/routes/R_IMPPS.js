const { Router } = require("express");

const roomMaid = require('../controllers/House Keeping/IMPPS/C_RoomMaid')
const supervisor = require('../controllers/House Keeping/IMPPS/C_Supervisor');
const { auth } = require("../middlewares/auth");
const R_IMPPS = Router()

//ESSENTIAL ROOM MAID
R_IMPPS.get('/roomboy/get-all', roomMaid.getAll)
R_IMPPS.post('/roomboy',roomMaid.postCreateRoomMaid)
R_IMPPS.get('/roomboy/reset', roomMaid.resetSchedule)

//ROOM MAID
R_IMPPS.get('/roomboy',auth(['Room Boy'])  , roomMaid.get)
// R_IMPPS.get('/roomboy/:id', roomMaid.get)
R_IMPPS.post('/roomboy/:taskId/:action/:roomMaidId?', auth(["Room Boy", "Supervisor"]), roomMaid.post)

//SUPERVISOR
R_IMPPS.get('/spv', supervisor.get)
R_IMPPS.post('/spv/:id/:taskId/:action', roomMaid.post)

module.exports = R_IMPPS
