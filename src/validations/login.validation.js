const { z } = require('zod');
const validate = require('../middlewares/validation');

const validateLogin = validate((encrypt) => ({
    email: z.string({
        required_error: 'Email is required',
        invalid_type_error: "Email must be a type of text"
    }),
    password: z.string({
        required_error: 'Password is required',
        invalid_type_error: "Password must be a type of text"
    })
}))

module.exports = { validateLogin }