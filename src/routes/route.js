import express from 'express'
import auth from '#api/auth/auth.route.js'
import user from '#api/user/user.route.js'
import oooRoom from '#api/ooo-room/ooo-room.route.js'
import lostFound from '#api/lost-found/lost-found.route.js'
import extrabed from '#api/extrabed/extrabed.route.js'
import authMiddleware from '#middleware/auth.js'

const router = express.Router()

router.use('/auth', auth)
router.use(authMiddleware)
router.use('/ooo-rooms', oooRoom)
router.use('/users', user)
router.use('/lost-founds', lostFound)
router.use('/extrabeds', extrabed)

export default router
