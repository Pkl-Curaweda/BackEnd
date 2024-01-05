const express = require('express')
const auth = require('../api/auth/auth.route')
const user = require('../api/user/user.route.js')
const oooRoom = require('../api/ooo-room/ooo-room.route.js')
const lostFound = require( '../api/lost-found/lost-found.route.js')
const extrabed = require( '../api/extrabed/extrabed.route.js')
// import authMiddleware from '#middleware/auth.js'

const router = express.Router()

router.use('/auth', auth)
// router.use(authMiddleware)
router.use('/ooo-rooms', oooRoom)
router.use('/users', user)
router.use('/lost-founds', lostFound)
router.use('/extrabeds', extrabed)

module.exports = router
