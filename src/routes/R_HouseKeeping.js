//Packages
const express = require('express')
const crypto = require('crypto');
const path = require('path');
const multer = require('multer');
const { error } = require('../utils/response.js');

//Middleware
const authMiddleware = require('../middlewares/auth.js')
// import authMiddleware from '#middleware/auth.js'

//Validation
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
const auth = require('../controllers/C_Auth.js')
const amenities = require('../controllers/House Keeping/C_Amenities.js');
const ooorooms = require('../controllers/House Keeping/C_OOO-OffMarket.js');
const user = require('../controllers/House Keeping/C_User.js');
const profile = require('../controllers/House Keeping/C_Profile.js');
const cleanDirty = require('../controllers/House Keeping/C_CleanDirtyRoom.js')
const discrepancy = require('../controllers/House Keeping/C_Discrepency.js')
const roomMaid = require('../controllers/House Keeping/C_RoomMaidReport.js')
const status = require('../controllers/House Keeping/C_Status.js')
const stock = require('../controllers/House Keeping/C_Stock.js')
const roomChange = require('../controllers/House Keeping/C_RoomChange.js')
const arrivalDeparture = require('../controllers/House Keeping/C_ArrivalDeparture.js');
const roomOcc = require('../controllers/House Keeping/C_RoomOCC.js')
const { route } = require('./R_Login.js');
const { postStat } = require('../controllers/Front Office/C_FloorPlan.js');
const { dailyCleaning, amenitiesTask } = require('../controllers/House Keeping/IMPPS/C_RoomMaid.js');


const router = express.Router()

//Start Multer
const allowedMimeTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp']
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, 'public/assets/lost-found')
    },
    filename: (_req, file, cb) => {
        crypto.pseudoRandomBytes(16, (_err, raw) => {
            cb(null, raw.toString('hex') + path.extname(file.originalname))
        })
    }
})

const upload = multer({
    storage,
    fileFilter(req, file, cb) {
        if (!allowedMimeTypes.includes(file.mimetype)) {
            req.fileValidationError = 'Only image file are allowed'
            cb(null, false)
            return
        }
        cb(null, true)
    }
})
//End Multer

router.get('/arrival-departure', arrivalDeparture.getArrivalDepartureData)

//Start Auth
router.post('/login', auth.login)
router.post('/refresh', auth.refresh)
router.post('/logout', auth.logout)
router.get('/me', auth.me)
//End Auth

//Start Profile
router.get('/profile/:id/', profile.get)
router.put('/profile/:id', profile.update)
//End Profile

//Start OOO Room
router.get('/ooo-rooms/', ooorooms.findAll)
router.post('/ooo-rooms/', createOooRoomValidation, ooorooms.create)
router.post('/ooo-rooms/print', ooorooms.print)
//End OOO Room

//Start User
router.get('/users/', getUserValidation, user.findAll)
router.get('/users/document', getUserValidation, user.document)
router.get('/users/:id', user.findOne)
router.post('/users/', createUserValidation, user.create)
router.put('/users/:id', updateUserValidation, user.update)
router.delete('/users/:id', user.remove)
//End User

//Start Lost Found
router.get('/lostfound/', getLostFoundValidation, lostFound.findAll)
router.post('/lostfound/', upload.single('image'), (req, res, next) => {
    if (req.fileValidationError) {
        return error(res, req.fileValidationError)
    }
    next()
}, createLostFoundValidation, lostFound.create)
router.put('/lostfound/:id', updateLostFoundValidation, lostFound.update)
router.delete('/lostfound/:id/:act', lostFound.remove)
//End Lost Found

//Start Status
router.get('/status', status.get)
router.post("/status/:id/:stId", postStat)
//End Status

//Start Room Occupancy Forecast
router.get('/roomocc', roomOcc.get)
//End Room Occupancy Forecast

//Start Room Change
router.get('/roomchange', roomChange.get)
router.post('/roomchange/print', roomChange.print)
//End Room Change

//Start Extra Bed
router.get('/extrabeds/:art', amenities.findAll)
router.post('/extrabeds/:art/print', amenities.print)
//End Extra Bed

//Start Clean Dirty Room
router.get('/clean-dirty', cleanDirty.get)
router.put("/clean-dirty/:id", updateRoomStatusValidation, cleanDirty.updateStatus)
//End Clean Dirty Room

//Start Discrepancy
router.get('/discrepancy', getDiscrepancyValidation, discrepancy.index)
//End Discrepancy

//Start Room  Maid
router.get('/room-maid', roomMaid.findAll)
router.post('/room-maid/print', roomMaid.print)
router.get('/room-maid/:id', roomMaid.findOne)
//End Room Maid

//Start Maid Task
router.get('/task/dc', dailyCleaning)
router.get('/task/at/:roomId?', amenitiesTask)
//End Maid Task

//Start Stock
router.get('/stock', getStockValidation, stock.index)
//End Stock

module.exports = router
