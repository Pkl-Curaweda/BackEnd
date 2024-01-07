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
const { createLostFoundValidation, getLostFoundValidation } = require('../validations/lost-found.validation.js');
const { getExtraBedValidation, createExtrabedValidation, updateExtrabedValidation } = require('../validations/extrabed.validation.js');
const { getOooRoomValidation, createOooRoomValidation } = require('../validations/ooo-room.validation.js');
const { createUserValidation, getUserValidation, updateUserValidation } = require('../validations/user.validation.js');

//Controller
const lostFound = require('../controllers/House Keeping/C_LostFound.js');
const auth = require('../controllers/House Keeping/C_Auth.js')
const extrabed = require('../controllers/House Keeping/C_Extrabed.js');
const ooorooms = require('../controllers/House Keeping/C_OOORoom.js');
const user = require('../controllers/House Keeping/C_User.js');


const router = express.Router()

//Start Multer
const allowedMimeTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp']
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, 'public/lost-found')
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


//Start Auth
router.post('/login', auth.login)
router.post('/refresh', auth.refresh)
router.post('/logout', auth.logout)
router.get('/me', auth.me)
//End Auth

//Start OOO Room
router.get('/ooo-rooms/', getOooRoomValidation, ooorooms.findAll)
router.post('/ooo-rooms/', createOooRoomValidation, ooorooms.create)
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
router.get('/lostfound/:id', lostFound.findOne)
router.post('/lostfound/', upload.single('image'), (req, res, next) => {
    if (req.fileValidationError) {
        return error(res, req.fileValidationError)
    }
    next()
}, createLostFoundValidation, lostFound.create)
router.put('/lostfound/:id', lostFound.update)
router.delete('/lostfound/:id', lostFound.remove)
//End Lost Found

//Start Extra Bed
router.get('/extrabeds/', getExtraBedValidation, extrabed.findAll)
router.get('/extrabeds/:id', extrabed.findOne)
router.post('/extrabeds/:id', createExtrabedValidation, extrabed.create)
router.put('/extrabeds/:id', updateExtrabedValidation, extrabed.update)
router.delete('/extrabeds/:id', extrabed.remove)
//End Extra Bed

module.exports = router
