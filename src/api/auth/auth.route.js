import express from 'express'
import { login, refresh, logout, me } from './auth.controller.js'
import { loginValidation } from './auth.validation.js'
import auth from '#middleware/auth.js'

const router = express.Router()

router.post('/login', loginValidation, login)
router.post('/refresh', refresh)
router.post('/logout', auth, logout)
router.get('/me', auth, me)

export default router
