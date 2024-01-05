const { z } = require('zod');
const validate = require('../../middlewares/validation');

const loginValidation = validate({
  email: z.string().email(),
  password: z.string(),
})

module.exports = loginValidation
