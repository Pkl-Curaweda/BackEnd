const express = require("express");
const { setStorage, setFileFilter, uploadFile } = require('../utils/helper');

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

const storage = setStorage();
const fileFilter = setFileFilter();
const options = { storage, fileFilter };

// //Start Auth
// R_InRoomService.post('/auth/register', loginValidation, auth.register);
// R_InRoomService.post('/auth/login', registerValidation, auth.login);
// R_InRoomService.get('/auth/refresh', auth.refresh);
// R_InRoomService.get('/auth/logout', auth.logout);
// //Emd Auth

// R_InRoomService.use(auth(['readInRoom']))

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
R_InRoomService.post('/productReq/create', uploadFile(options, 'picture'), productReqInputValidation, productReqService.create);
R_InRoomService.get('/productReq/', productReqService.getAll);
R_InRoomService.get('/productReq/status/:status', productReqService.getProductReqByStatus);
R_InRoomService.get('/productReq/:id', productReqService.getProductReqById);
R_InRoomService.put('/productReq/update/:id', uploadFile(options, 'picture'), productReqInputValidation, productReqService.update,);
R_InRoomService.delete('/productReq/delete/:id', productReqService.remove);
R_InRoomService.post('/productReq/accept/:id', productReqService.acceptProductReq);
R_InRoomService.post('/productReq/reject/:id', productReqService.rejectProductReq);
R_InRoomService.get('/productReq/user/:userId', productReqService.getProductReqByUserId);
//End ProductReq

//Start Profile
R_InRoomService.get('/profile/', profile.getData);
R_InRoomService.put('/profile/updateNumber', phoneValidation, profile.updateNumber);
R_InRoomService.put('/profile/updateEmail', emailValidation, profile.updateEmail);
R_InRoomService.put('/profile/updateNIK', nikValidation, profile.updateNIK);
//End Profile

//Start Room
R_InRoomService.get('/room/', room.getAllData);
R_InRoomService.get('/room/:id', room.getData);
R_InRoomService.post('/room/create', uploadFile(options, 'roomImage'), room.createData);
R_InRoomService.put('/room/update/:id', uploadFile(options, 'roomImage'), room.updateData);
R_InRoomService.delete('/room/delete/:id', room.deleteData);
//End Room

//Start Service
R_InRoomService.post('/services/create-service', uploadFile(options, 'picture'), serviceInputValidation, services.createService);
R_InRoomService.get('/services/:serviceTypeId', services.getService);
R_InRoomService.get('/services/:serviceTypeId/latest', services.getServiceLatest);
R_InRoomService.put('/services/update/:id', uploadFile(options, 'picture'), serviceInputValidation, services.updateService);
R_InRoomService.delete('/services/delete/:id', services.deleteService);
//Emd Service

//Start subType
R_InRoomService.get('/subType/', subType.getSubtypes);
R_InRoomService.post('/subType/create', subType.createSubType);
R_InRoomService.put('/subType/update/:id', subType.updateSubType);
R_InRoomService.delete('/subType/delete/:id', subType.remove);
//End subType

module.exports = R_InRoomService