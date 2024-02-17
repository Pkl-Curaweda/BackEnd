const { Router } = require('express');
const { auth } = require('../middlewares/auth');
const multer = require("multer");
const crypto = require('crypto');
const path = require('path');

const SARoom = require('../controllers/Super Admin/C_SARoom');
const { error } = require('../utils/response');
const R_SA = Router()

R_SA.use(auth(['Super Admin']))

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

R_SA.get('/room', SARoom.get)
R_SA.post('/room/room/:action?', upload.single('image'), (req, res, next) => {
    if (req.fileValidationError) {
        return error(res, req.fileValidationError)
    }
    next()
}, SARoom.postAddRoom)
R_SA.post('/room/:item/:action?', SARoom.postAddEdit)
R_SA.delete('/room/:item/:id', SARoom.deleteData)

module.exports = R_SA