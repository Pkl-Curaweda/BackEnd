const express = require('express')
const { login, refresh, logout, me } = require('./auth.controller.js')
const { loginValidation } = require('./auth.validation.js')
const auth = require('../../middlewares/auth.js')

const router = express.Router()

router.post('/login', login)
router.post('/refresh', refresh)
router.post('/logout', logout)
router.get('/me',  me)

module.exports = router
