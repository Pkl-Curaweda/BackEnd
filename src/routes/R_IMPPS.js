const { Router } = require("express");

const roomMaid = require('../controllers/House Keeping/IMPPS/C_RoomMaid')
const supervisor = require('../controllers/House Keeping/IMPPS/C_Supervisor');
const lostFound = require('../controllers/House Keeping/C_LostFound')
const { auth } = require("../middlewares/auth");
const { postStat } = require("../controllers/Front Office/C_FloorPlan");
const { createLostFoundValidation } = require("../validations/lost-found.validation");
const multer = require("multer");
const crypto = require('crypto');
const path = require('path');
const R_IMPPS = Router()

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


//ESSENTIAL ROOM MAID
R_IMPPS.get('/roomboy/get-all', roomMaid.getAll)
R_IMPPS.get('/roomboy/reset', roomMaid.resetSchedule)
R_IMPPS.post('/roomboy', roomMaid.postCreateRoomMaid)

//ROOM MAID
R_IMPPS.get('/roomboy', auth(['Room Boy']), roomMaid.get)
R_IMPPS.put('/roomboy/:taskId', auth(['Room Boy', 'Supervisor']), roomMaid.submitComment)
R_IMPPS.post('/roomboy/:taskId/:action', auth(["Room Boy"]), roomMaid.post)
R_IMPPS.post('/roomboy/lostfound', auth(['Room Boy']), 
upload.single('image'), 
(req, res, next) => {
    if (req.fileValidationError) {
        return error(res, req.fileValidationError)
    }
    next()
}, createLostFoundValidation, lostFound.create)
//SUPERVISOR
R_IMPPS.get('/spv', supervisor.get)
R_IMPPS.post('/spv/:taskId/:action', auth(["Supervisor"]), roomMaid.post)
R_IMPPS.post('/spv/change-status/:id/:status', auth(['Supervisor']), postStat)
R_IMPPS.put('/spv/:taskId', auth(['Supervisor']), roomMaid.submitComment)

module.exports = R_IMPPS
