const crypto = require('crypto');
const path = require('path');
const express = require('express');
const multer = require('multer');

const {create,findAll,findOne,remove,update} = require('./lost-found.controller.js');

const {createLostFoundValidation,getLostFoundValidation} = require('./lost-found.validation.js');

const { error } = require('../../utils/response.js');

const router = express.Router()

const allowedMimeTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp']
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'public/lost-found')
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

router.get('/', getLostFoundValidation, findAll)
router.get('/:id', findOne)
router.post('/', upload.single('image'), (req, res, next) => {
  if (req.fileValidationError) {
    return error(res, req.fileValidationError)
  }
  next()
}, createLostFoundValidation, create)
router.put('/:id', update)
router.delete('/:id', remove)

module.exports =  router
