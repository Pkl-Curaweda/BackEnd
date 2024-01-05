const express = require('express');
const { create, findAll } = require('./ooo-room.controller.js');
const { getOooRoomValidation, createOooRoomValidation } = require('./ooo-room.validation.js');

const router = express.Router()

router.get('/', getOooRoomValidation , findAll)
router.post('/', createOooRoomValidation, create)

module.exports = router