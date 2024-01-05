const { z } = require('zod');
const validate = require('../../middlewares/validation');
const { fieldExist, recordExist, recordUnique } = require('#utils/db-validation.js');

const getUserValidation = validate({
  page: z.coerce.number().optional().default(1),
  show: z.coerce.number().optional().default(10),
  query: z.string().optional().default(''),
  sort: z.string().optional().refine(fieldExist('user')).default('id'),
  order: z.enum(['asc', 'desc']).optional().default('asc'),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  roleId: z.coerce.number().optional()
})

const createUserValidation = validate({
  name: z.string(),
  gender: z.enum(['MALE', 'FEMALE']),
  phone: z.string(),
  picture: z.string().optional(),
  birthday: z.coerce.date().optional(),
  nik: z.string().optional(),
  email: z.string().email().refine(recordUnique('user', 'email'), {
    message: 'Email already exist'
  }),
  username: z.string().refine(recordUnique('user', 'username'), {
    message: 'Username already exist'
  }),
  password: z.string(),
  roleId: z.number().refine(recordExist('role', 'id'), {
    message: 'Role does not exist',
  }),
})

const updateUserValidation = validate(
  id => ({
    name: z.string().optional(),
    gender: z.enum(['MALE', 'FEMALE']).optional(),
    phone: z.string().optional(),
    picture: z.string().optional(),
    birthday: z.coerce.date().optional(),
    nik: z.string().optional(),
    email: z.string().email().refine(recordUnique('user', 'email', id), {
      message: 'Email already exist'
    }).optional(),
    username: z.string().refine(recordUnique('user', 'username', id), {
      message: 'Username already exist'
    }).optional(),
    password: z.string().optional(),
    roleId: z.number().refine(recordExist('role', 'id'), {
      message: 'Role does not exist',
    }).optional(),
  })
)

module.exports = { getUserValidation, createUserValidation, updateUserValidation }