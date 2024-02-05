const { Router } = require("express");

const roomMaid = require('../controllers/House Keeping/IMPPS/C_RoomMaid')
const supervisor = require('../controllers/House Keeping/IMPPS/C_Supervisor');
const { auth } = require("../middlewares/auth");
const { postStat } = require("../controllers/Front Office/C_FloorPlan");
const R_IMPPS = Router()

//ESSENTIAL ROOM MAID
R_IMPPS.get('/roomboy/get-all', roomMaid.getAll)
R_IMPPS.get('/roomboy/reset', roomMaid.resetSchedule)
R_IMPPS.post('/roomboy', roomMaid.postCreateRoomMaid)

//ROOM MAID
R_IMPPS.get('/roomboy', auth(['Room Boy']), roomMaid.get)
R_IMPPS.put('/roomboy/:taskId', auth(['Room Boy', 'Supervisor']), roomMaid.submitComment)
R_IMPPS.post('/roomboy/:taskId/:action', auth(["Room Boy"]), roomMaid.post)
// R_IMPPS.get('/roomboy/:id', roomMaid.get)

//SUPERVISOR
R_IMPPS.get('/spv', supervisor.get)
R_IMPPS.post('/spv/:taskId/:action', auth(["Supervisor"]), roomMaid.post)
R_IMPPS.post('/spv/change-status/:id/:status', auth(['Supervisor']), postStat)
R_IMPPS.put('/spv/:taskId', auth(['Supervisor']), roomMaid.submitComment)

module.exports = R_IMPPS
