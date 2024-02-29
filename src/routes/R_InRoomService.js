const express = require("express");
const multer = require("multer");
const crypto = require('crypto');
const path = require('path');


const { loginValidation, registerValidation } = require('../validations/auth.validation');
const { createOrderValidation, updateQtyValidation } = require('../validations/order.validation');
const { productReqInputValidation } = require('../validations/productReq.validation');
const { phoneValidation, emailValidation, nikValidation } = require('../validations/profile.validation');
const { roomInputValidation } = require('../validations/room.validation');
const { serviceInputValidation } = require('../validations/service.validation');

const guest = require('../controllers/In Room Service/C_Guest');
const order = require('../controllers/In Room Service/C_Order');
const productReqService = require('../controllers/In Room Service/C_ProductReq');
const profile = require('../controllers/In Room Service/C_Profile');
const room = require('../controllers/In Room Service/C_Room');
const services = require('../controllers/In Room Service/C_Service');
const subType = require('../controllers/In Room Service/C_SubType');
const mainMenu = require('../controllers/In Room Service/C_MainMenu');
const { auth } = require("../middlewares/auth");

const R_InRoomService = express();

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
// //Start Auth
// R_InRoomService.post('/auth/register', loginValidation, auth.register);
// R_InRoomService.post('/auth/login', registerValidation, auth.login);
// R_InRoomService.get('/auth/refresh', auth.refresh);
// R_InRoomService.get('/auth/logout', auth.logout);
// //Emd Auth

// R_InRoomService.use(auth(['readInRoom']))
R_InRoomService.use(auth())

//? START MAIN MENU
R_InRoomService.get('/menu', auth() ,mainMenu.getIRSMenu)
//? END MAIN MENU

//Start Order
R_InRoomService.get('/order/:id', order.findOne);
R_InRoomService.post('/order/create', createOrderValidation, order.create);
R_InRoomService.put('/order/update/qty/:id/:dordId', updateQtyValidation, order.updateQty);
R_InRoomService.put('/order/update/newItem/:id', order.updateNewItem);
R_InRoomService.delete('/order/delete/:id', order.remove);
//End Order

//Start ProductReq
R_InRoomService.post('/productReq/create', auth(),upload.single('picture'), productReqService.create);
R_InRoomService.get('/productReq/', productReqService.getAll);
R_InRoomService.get('/productReq/status/:status', productReqService.getProductReqByStatus);
R_InRoomService.get('/productReq/:id', productReqService.getProductReqById);
R_InRoomService.put('/productReq/update/:id', upload.single('picture'), productReqInputValidation, productReqService.update,);
R_InRoomService.delete('/productReq/delete/:id', productReqService.remove);
R_InRoomService.post('/productReq/accept/:id', productReqService.acceptProductReq);
R_InRoomService.post('/productReq/reject/:id', productReqService.rejectProductReq);
R_InRoomService.get('/productReq/user/:userId', productReqService.getProductReqByUserId);
//End ProductReq

//Start Profile
R_InRoomService.get('/profile/', profile.getData);
R_InRoomService.put('/profile/', profile.updateProfile)
//End Profile

//Start Room
R_InRoomService.get('/room/', room.getAllData);
R_InRoomService.get('/room/:id', room.getData);
R_InRoomService.post('/room/create', upload.single('roomImage'), room.createData);
R_InRoomService.put('/room/update/:id', upload.single('roomImage'), room.updateData);
R_InRoomService.delete('/room/delete/:id', room.deleteData);
//End Room

//Start Service
R_InRoomService.post('/services/create-service', upload.single('picture'), serviceInputValidation, services.createService);
R_InRoomService.get('/services/:serviceTypeId', auth(),services.getService);
R_InRoomService.get('/services/:serviceTypeId/latest', services.getServiceLatest);
R_InRoomService.put('/services/update/:id', upload.single('picture'), serviceInputValidation, services.updateService);
R_InRoomService.delete('/services/delete/:id', services.deleteService);
//Emd Service

//Start subType
R_InRoomService.get('/subType/', subType.getSubtypes);
R_InRoomService.post('/subType/create', subType.createSubType);
R_InRoomService.put('/subType/update/:id', subType.updateSubType);
R_InRoomService.delete('/subType/delete/:id', subType.remove);
//End subType

module.exports = R_InRoomService