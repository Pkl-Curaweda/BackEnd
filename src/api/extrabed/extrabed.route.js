import express from 'express'

import {
  create,
  remove,
  findOne,
  findAll,
  update
} from './extrabed.controller.js'

import {
  getExtraBedValidation,
  createExtrabedValidation,
  updateExtrabedValidation,
} from './extrabed.validation.js'

const router = express.Router()

router.get('/', getExtraBedValidation, findAll)
router.get('/:id', findOne)
router.post('/', createExtrabedValidation, create)
router.put('/:id', updateExtrabedValidation, update)
router.delete('/:id', remove)

export default router
