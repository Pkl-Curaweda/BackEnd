import express from 'express'

import {
  create,
  remove,
  findOne,
  findAll,
  update,
  document
} from './user.controller.js'

import {
  createUserValidation,
  getUserValidation,
  updateUserValidation,
} from './user.validation.js'

const router = express.Router()

router.get('/', getUserValidation, findAll)
router.get('/document', getUserValidation, document)
router.get('/:id', findOne)
router.post('/', createUserValidation, create)
router.put('/:id', updateUserValidation, update)
router.delete('/:id', remove)

export default router
