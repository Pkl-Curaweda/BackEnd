const express = require('express');
const { create, remove, findOne, findAll, update, document } = require('./user.controller.js');
const { createUserValidation, getUserValidation, updateUserValidation } = require('./user.validation.js');

const router = express.Router()

router.get('/', getUserValidation, findAll)
router.get('/document', getUserValidation, document)
router.get('/:id', findOne)
router.post('/', createUserValidation, create)
router.put('/:id', updateUserValidation, update)
router.delete('/:id', remove)

module.exports = router
