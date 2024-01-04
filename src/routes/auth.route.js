const express = require('express');

const router = express.Router();
const auth = require('../services/auth.service');
// const middleware = require('../InRoomService-Backend/src/middlewares/auth.middleware');
const { loginValidation, registerValidation } = require('../validations/auth.validation');

router.post('/register', loginValidation, auth.register);

router.post('/login', registerValidation, auth.login);

router.get('/refresh', auth.refresh);

router.get('/logout', auth.logout);

module.exports = router;
