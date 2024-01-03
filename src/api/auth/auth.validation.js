import { z } from 'zod'
import validate from '#middleware/validation.js'

export const loginValidation = validate({
  email: z.string().email(),
  password: z.string(),
})
