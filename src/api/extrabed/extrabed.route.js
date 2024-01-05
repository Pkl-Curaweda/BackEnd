const express = require('express');

const {
  create,
  remove,
  findOne,
  findAll,
  update
} = require('./extrabed.controller.js');

const {
  getExtraBedValidation,
  createExtrabedValidation,
  updateExtrabedValidation,
} = require('./extrabed.validation.js');

const router = express.Router()

router.get('/', getExtraBedValidation, findAll)
router.get('/:id', findOne)
router.post('/', createExtrabedValidation, create)
router.put('/:id', updateExtrabedValidation, update)
router.delete('/:id', remove)

module.exports = router
