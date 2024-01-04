const express = require('express');

const router = express.Router();
const order = require('../services/order.service');
const { createOrderValidation, updateQtyValidation } = require('../validations/order.validation');
// const middleware = require('../InRoomService-Backend/src/middlewares/auth.middleware');

router.get('/:id', order.findOne);
router.post('/create', createOrderValidation, order.create);
router.put('/update/qty/:id/:dordId', updateQtyValidation, order.updateQty);
router.put('/update/newItem/:id', order.updateNewItem);
router.delete('/delete/:id', order.remove);

module.exports = router;
