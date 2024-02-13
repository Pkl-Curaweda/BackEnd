//Packages
const express = require('express')
const crypto = require('crypto');
const path = require('path');
const multer = require('multer');
const { error } = require('../utils/response.js');

//Middleware
const {auth} = require('../middlewares/auth.js')
// import authMiddleware from '#middleware/auth.js'

//Validatio
const { createLostFoundValidation, getLostFoundValidation, updateLostFoundValidation } = require('../validations/lost-found.validation.js');
const { getExtraBedValidation, createExtrabedValidation, updateExtrabedValidation } = require('../validations/extrabed.validation.js');
const { getOooRoomValidation, createOooRoomValidation } = require('../validations/ooo-room.validation.js');
const { createUserValidation, getUserValidation, updateUserValidation } = require('../validations/user.validation.js');
const { getCleanDirtyRoomValidation, updateRoomStatusValidation } = require('../validations/clean-dirty-room.validation.js');
const { getDiscrepancyValidation } = require('../validations/discrepancy.validation.js');
const { getRoomMaidValidation } = require('../validations/room-maid.validation.js');
const { updateProfileValidation } = require('../validations/profile.validation.js');
const { getStockValidation } = require('../validations/stock-validation.js');

//Controller
const lostFound = require('../controllers/House Keeping/C_LostFound.js');
// const auth = require/('../controllers/C_Auth.js')
const amenities = require('../controllers/House Keeping/C_Amenities.js');
const ooorooms = require('../controllers/House Keeping/C_OOO-OffMarket.js');
const user = require('../controllers/Maybe-Used/C_User.js');
const cleanDirty = require('../controllers/House Keeping/C_CleanDirtyRoom.js')
const status = require('../controllers/House Keeping/C_Status.js')
const roomChange = require('../controllers/House Keeping/C_RoomChange.js')
const arrivalDeparture = require('../controllers/House Keeping/C_ArrivalDeparture.js');
const roomOcc = require('../controllers/House Keeping/C_RoomOCC.js')
const { route } = require('./R_Login.js');
const { postStat } = require('../controllers/Front Office/C_FloorPlan.js');
const { dailyCleaning, amenitiesTask, resetSchedule, postCreate, postCreateRoomMaid, getAll } = require('../controllers/House Keeping/IMPPS/C_RoomMaid.js');


const router = express.Router()


router.get('/arrival-departure', arrivalDeparture.getArrivalDepartureData)

// //Start Auth
// router.post('/login', auth.login)
// router.post('/refresh', auth.refresh)
// router.post('/logout', auth.logout)
// router.get('/me', auth.me)
// //End Auth

//Start OOO Room
router.get('/ooo-rooms/', ooorooms.findAll)
router.post('/ooo-rooms/', auth(['Admin']), ooorooms.create)
//End OOO Room

//Start User
router.get('/users/', getUserValidation, user.findAll)
router.get('/users/document', getUserValidation, user.document)
router.get('/users/:id', user.findOne)
router.put('/users/:id', updateUserValidation, user.update)
router.delete('/users/:id', user.remove)
//End User

//Start Lost Found
router.get('/lostfound/', lostFound.findAll)

router.post('/lostfound/:id', auth(['Room Boy']), lostFound.finish)
router.put('/lostfound/:id', updateLostFoundValidation, lostFound.update)
router.delete('/lostfound/:id/:act', lostFound.remove)
//End Lost Found

//Start Status
router.get('/status', status.get)
router.get('/status/refresh', status.getTask)
router.post("/status/:id/:status", auth(['Admin']) , postStat)
//End Status

//Start Room Occupancy Forecast
router.get('/roomocc', roomOcc.get)
//End Room Occupancy Forecast

//Start Room Change
router.get('/roomchange', roomChange.get)
//End Room Change

//Start Extra Bed
router.get('/amenities/:art', amenities.findAll)
//End Extra Bed

//Start Clean Dirty Room
router.get('/clean-dirty', cleanDirty.get)
router.put("/clean-dirty/:id", updateRoomStatusValidation, cleanDirty.updateStatus)
//End Clean Dirty Room

//Start Maid Task
router.get('/task/dc', dailyCleaning)
router.get('/task/at/:roomId?', amenitiesTask)
//End Maid Task

module.exports = router
