const { z } = require('zod');
const validate = require('../middlewares/validation');

const validateLogin = validate({
    email: z.string({
        required_error: 'Email is required'
    }),
    password: z.string({
        required_error: 'Password is required',
    })
})

module.exports = { validateLogin }