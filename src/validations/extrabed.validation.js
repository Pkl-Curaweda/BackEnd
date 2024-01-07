const { z } = require('zod');
const validate = require('../middlewares/validation');
const { fieldExist } = require('../utils/db-validation');

const getExtraBedValidation = validate({
  page: z.coerce.number().optional().default(1),
  show: z.coerce.number().optional().default(5),
  sort: z.string().optional().refine(fieldExist('extraBed')).default('id'),
  order: z.enum(['asc', 'desc']).optional().default('asc'),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
})

const createExtrabedValidation = validate({
  date: z.coerce.date(),
  roomId: z.number(),
  used: z.boolean(),
  remain: z.number(),
})

const updateExtrabedValidation = validate({
  date: z.coerce.date(),
  roomId: z.number(),
  used: z.boolean(),
  remain: z.number(),
})

module.exports = { getExtraBedValidation, createExtrabedValidation, updateExtrabedValidation }