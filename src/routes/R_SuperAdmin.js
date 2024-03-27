const { Router } = require('express');
const { auth } = require('../middlewares/auth');
const multer = require("multer");
const crypto = require('crypto');
const path = require('path');

const SARoom = require('../controllers/Super Admin/C_SARoom');
const SAArticle = require('../controllers/Super Admin/C_SAArticle')
const SAAccess = require('../controllers/Super Admin/C_SAAcess')
const { error } = require('../utils/response');
const R_SA = Router()

R_SA.use(auth(['showSuperAdmin']))

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

//? START ROOM PAGE
R_SA.get('/room', SARoom.get)
R_SA.get('/room/helper/:ident/:id/:act?', SARoom.getHelper)
R_SA.post('/room/room/:action?', upload.single('picture'), (req, res, next) => {
    if (req.fileValidationError) {
        return error(res, req.fileValidationError)
    }
    next()
}, SARoom.postAddRoom)
R_SA.post('/room/:item/:action?', SARoom.postAddEdit)
R_SA.delete('/room/:item/:id', SARoom.deleteData)
//? END ROOM PAGE

//? START ARTICLE PAGE
R_SA.get('/article', SAArticle.get)
R_SA.post('/article/:action?', SAArticle.addEdit)
R_SA.delete('/article/:id', SAArticle.deleteArticle)
//? END ARTICLE PAGE

//? START ACCESS PAGE
R_SA.get('/access', SAAccess.get)
R_SA.get('/access/helper/:ident/:firstId?/:act?/:secondId?', SAAccess.getHelper)
R_SA.post('/access/role', SAAccess.postNewRole)
// R_SA.post('/access/user/add', upload.single('picture'), (req, res, next) => {
//     if (req.fileValidationError) {
//         return error(res, req.fileValidationError)
//     }
//     next()
// }, SAAccess.postNewUser)
R_SA.post('/access/rb/', SAAccess.postNewRoomBoy)
R_SA.post('/access/change-password', SAAccess.postChangePassword)
R_SA.put('/access/rb/:id', SAAccess.putEditRoomBoy)
R_SA.put('/access/role/:id', SAAccess.putEditRole)
R_SA.post('/access/user/:action/:id?', upload.single('picture'), (req, res, next) => {
if (req.fileValidationError) {
        return error(res, req.fileValidationError)
    }
    next()
}, SAAccess.postAddEditUser)
R_SA.delete('/access/:ident/:id', SAAccess.deleteData)
R_SA.delete('/logout-all/:type/:id', SAAccess.logoutAlToken)

//? END ACCESS PAGE
module.exports = R_SA