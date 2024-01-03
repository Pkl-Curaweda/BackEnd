import express from 'express'
import { create, findAll } from './ooo-room.controller.js'
import { createOooRoomValidation, getOooRoomValidation } from './ooo-room.validation.js'

const router = express.Router()

router.get('/', getOooRoomValidation , findAll)
router.post('/', createOooRoomValidation, create)

export default router