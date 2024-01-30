const { z } = require('zod');
const validate = require('../middlewares/validation');
const { fieldExist, recordExist } = require('../utils/db-validation');

const getLostFoundValidation = validate({
  page: z.coerce.number().optional().default(1),
  perPage: z.coerce.number().optional().default(5),
  sortOrder: z.enum([
    'pic', 'reported', 'date', 'roomNum'
  ]).optional().default('roomNum'),
  search: z.string().optional().default(''),
  date: z.coerce.date().optional(),
})

const updateLostFoundValidation = validate({
  description: z.coerce.string(),
  location: z.coerce.string(),
  phoneNumber: z.coerce.string(),
  reportedDate: z.coerce.date()
})

const createLostFoundValidation = validate({
  roomId: z.coerce.number().refine(recordExist('room', 'id'), {
    message: 'Room does not exist',
  }),
  description: z.string(),
  location: z.string(),
})
module.exports = { getLostFoundValidation, createLostFoundValidation, updateLostFoundValidation }